import { useState, useCallback, useRef } from 'react';
import { Course, Document, GenerationSettings } from '@/types';
import { toast } from 'sonner';
import { DeterministicCourseGenerator, GenerationResult } from '@/services/deterministicCourseGenerator';
import { aiEnhancer } from '@/services/aiEnhancer';
import { saveCourseToHistory } from '@/components/CourseHistory';
import { trackAnalyticsEvent } from '@/components/AnalyticsDashboard';

interface UseCourseGenerationOptions {
  onSuccess?: (course: Course) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook personnalisé pour la génération de cours avec gestion d'état optimisée
 */
export const useCourseGeneration = (options: UseCourseGenerationOptions = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastStats, setLastStats] = useState<GenerationResult['processingStats'] | null>(null);
  const [lastNormRules, setLastNormRules] = useState(0);

  // Ref pour éviter les appels multiples
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Génère un cours avec ou sans enrichissement IA
   */
  const generateCourse = useCallback(async (
    documents: Document[],
    settings: GenerationSettings,
    customInstructions: string = '',
    useAIEnhancement: boolean = false,
    aiAvailable: boolean = false
  ): Promise<Course | null> => {
    // Validation
    if (documents.length === 0) {
      toast.error("Veuillez importer au moins un document");
      return null;
    }

    // Vérifier si une génération est déjà en cours
    if (isGenerating) {
      toast.warning("Une génération est déjà en cours");
      return null;
    }

    // Créer un abort controller pour pouvoir annuler
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setProgress(0);

    try {
      // Étape 1: Analyse des documents
      setProgress(20);
      toast.info("Analyse structurée des documents...");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Étape 2: Génération déterministe
      setProgress(50);
      toast.info("Génération du cours...");

      const result = DeterministicCourseGenerator.generateCourse(
        documents,
        settings,
        customInstructions
      );

      let finalCourse = result.course;

      // Étape 3: Enrichissement IA (optionnel)
      if (useAIEnhancement && aiAvailable) {
        setProgress(70);
        toast.info("Enrichissement avec l'IA...");

        try {
          const enhancedSections = await Promise.all(
            finalCourse.content.sections.slice(0, 5).map(async (section) => {
              if (abortControllerRef.current?.signal.aborted) {
                throw new Error('Generation cancelled');
              }

              const enhanced = await aiEnhancer.enhanceSection(section);
              return enhanced.enhanced
                ? { ...section, explanation: enhanced.enhancedContent }
                : section;
            })
          );

          finalCourse = {
            ...finalCourse,
            content: {
              ...finalCourse.content,
              sections: [
                ...enhancedSections,
                ...finalCourse.content.sections.slice(5)
              ]
            }
          };

          toast.success("Contenu enrichi avec l'IA");
        } catch (error) {
          if (error instanceof Error && error.message === 'Generation cancelled') {
            throw error;
          }
          console.warn("Enrichissement IA non disponible:", error);
          toast.info("Cours généré sans enrichissement IA");
        }
      }

      // Étape 4: Finalisation
      setProgress(100);

      // Sauvegarder et tracker
      setLastStats(result.processingStats);
      setLastNormRules(result.normRulesUsed);

      saveCourseToHistory(finalCourse);
      trackAnalyticsEvent('course_generated', {
        generationTime: result.processingStats.processingTimeMs,
        withAI: useAIEnhancement && aiAvailable,
        normRulesUsed: result.normRulesUsed
      });
      documents.forEach(() => trackAnalyticsEvent('document_processed'));

      const aiLabel = result.generatedWithAI ? 'avec IA' : 'sans IA';
      const normLabel = result.normRulesUsed > 0 ? ` + ${result.normRulesUsed} règles NS 01-001` : '';
      toast.success(`Cours généré ${aiLabel}${normLabel} et sauvegardé !`);

      options.onSuccess?.(finalCourse);
      return finalCourse;

    } catch (error) {
      if (error instanceof Error && error.message === 'Generation cancelled') {
        toast.info('Génération annulée');
        return null;
      }

      console.error('Course generation error:', error);
      toast.error('Erreur lors de la génération du cours');
      options.onError?.(error as Error);
      return null;

    } finally {
      setIsGenerating(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  }, [isGenerating, options]);

  /**
   * Annule la génération en cours
   */
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info('Annulation de la génération...');
    }
  }, []);

  return {
    isGenerating,
    progress,
    lastStats,
    lastNormRules,
    generateCourse,
    cancelGeneration
  };
};
