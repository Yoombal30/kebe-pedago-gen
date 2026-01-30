/**
 * Service d'enrichissement IA - OPTIONNEL et NON-BLOQUANT
 * 
 * Ce service permet d'améliorer le contenu généré par le moteur déterministe
 * en utilisant un moteur IA externe. Si l'IA est indisponible, le contenu
 * original reste utilisable tel quel.
 */

import { Course, CourseSection, QCMQuestion } from '@/types';
import { AIService, aiService } from './aiService';

export interface EnhancementResult {
  success: boolean;
  enhanced: boolean;
  originalContent: string;
  enhancedContent: string;
  error?: string;
}

export interface EnhancementOptions {
  reformulate: boolean;
  addExamples: boolean;
  improveStyle: boolean;
  timeout: number;
}

const DEFAULT_OPTIONS: EnhancementOptions = {
  reformulate: true,
  addExamples: true,
  improveStyle: true,
  timeout: 30000,
};

export class AIEnhancer {
  private static instance: AIEnhancer;
  private aiService: AIService;
  private isAvailable: boolean = false;

  private constructor() {
    this.aiService = aiService;
  }

  static getInstance(): AIEnhancer {
    if (!AIEnhancer.instance) {
      AIEnhancer.instance = new AIEnhancer();
    }
    return AIEnhancer.instance;
  }

  /**
   * Vérifie si le moteur IA est disponible (non-bloquant)
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const engine = this.aiService.getActiveEngine();
      if (!engine) {
        this.isAvailable = false;
        return false;
      }

      // Test rapide avec timeout court
      const testPromise = this.aiService.sendMessage('Réponds uniquement OK');
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 5000)
      );

      const result = await Promise.race([testPromise, timeoutPromise]);
      this.isAvailable = result !== null && (result as any).success === true;
      return this.isAvailable;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Retourne l'état de disponibilité de l'IA
   */
  getAvailabilityStatus(): { available: boolean; message: string } {
    if (this.isAvailable) {
      return { available: true, message: 'IA disponible pour enrichissement' };
    }
    return { available: false, message: 'IA désactivée - Contenu généré sans IA' };
  }

  /**
   * Enrichit une section de cours avec l'IA (optionnel)
   */
  async enhanceSection(
    section: CourseSection,
    options: Partial<EnhancementOptions> = {}
  ): Promise<EnhancementResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const originalContent = section.explanation;

    if (!this.isAvailable) {
      return {
        success: true,
        enhanced: false,
        originalContent,
        enhancedContent: originalContent,
      };
    }

    try {
      const prompt = this.buildEnhancementPrompt(section, opts);
      
      const response = await Promise.race([
        this.aiService.sendMessage(prompt),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), opts.timeout))
      ]);

      if (!response || !(response as any).success) {
        return {
          success: true,
          enhanced: false,
          originalContent,
          enhancedContent: originalContent,
        };
      }

      return {
        success: true,
        enhanced: true,
        originalContent,
        enhancedContent: (response as any).content || originalContent,
      };
    } catch (error) {
      console.warn('Enrichissement IA non disponible:', error);
      return {
        success: true,
        enhanced: false,
        originalContent,
        enhancedContent: originalContent,
        error: 'IA indisponible - contenu original conservé',
      };
    }
  }

  /**
   * Améliore les questions QCM avec l'IA (optionnel)
   */
  async enhanceQCM(
    questions: QCMQuestion[],
    options: Partial<EnhancementOptions> = {}
  ): Promise<{ questions: QCMQuestion[]; enhanced: boolean }> {
    if (!this.isAvailable || questions.length === 0) {
      return { questions, enhanced: false };
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const prompt = `Améliore ces questions QCM en les rendant plus claires et pédagogiques.
Garde le même format JSON.

Questions actuelles:
${JSON.stringify(questions.slice(0, 5), null, 2)}

Retourne uniquement le JSON amélioré.`;

      const response = await Promise.race([
        this.aiService.sendMessage(prompt),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), opts.timeout))
      ]);

      if (!response || !(response as any).success) {
        return { questions, enhanced: false };
      }

      // Parser la réponse
      try {
        const content = (response as any).content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const enhancedQuestions = JSON.parse(jsonMatch[0]);
          return { questions: enhancedQuestions, enhanced: true };
        }
      } catch {
        // Parsing échoué, retourner les questions originales
      }

      return { questions, enhanced: false };
    } catch {
      return { questions, enhanced: false };
    }
  }

  /**
   * Reformule un texte avec l'IA (optionnel)
   */
  async reformulateText(
    text: string,
    style: 'professional' | 'pedagogical' | 'simplified' = 'pedagogical'
  ): Promise<EnhancementResult> {
    if (!this.isAvailable) {
      return {
        success: true,
        enhanced: false,
        originalContent: text,
        enhancedContent: text,
      };
    }

    const styleInstructions = {
      professional: 'dans un style professionnel et formel',
      pedagogical: 'dans un style pédagogique clair et engageant',
      simplified: 'en simplifiant pour un public débutant',
    };

    try {
      const prompt = `Reformule ce texte ${styleInstructions[style]}, en gardant le sens original:

"${text.substring(0, 1000)}"

Retourne uniquement le texte reformulé.`;

      const response = await this.aiService.sendMessage(prompt);

      if (!response.success) {
        return {
          success: true,
          enhanced: false,
          originalContent: text,
          enhancedContent: text,
        };
      }

      return {
        success: true,
        enhanced: true,
        originalContent: text,
        enhancedContent: response.content,
      };
    } catch {
      return {
        success: true,
        enhanced: false,
        originalContent: text,
        enhancedContent: text,
      };
    }
  }

  /**
   * Génère des exemples supplémentaires avec l'IA (optionnel)
   */
  async generateExamples(
    topic: string,
    context: string,
    count: number = 3
  ): Promise<{ examples: string[]; generated: boolean }> {
    if (!this.isAvailable) {
      return { examples: [], generated: false };
    }

    try {
      const prompt = `Génère ${count} exemples concrets et pratiques pour illustrer le sujet "${topic}".
Contexte: ${context.substring(0, 500)}

Retourne les exemples sous forme de liste JSON: ["exemple1", "exemple2", ...]`;

      const response = await this.aiService.sendMessage(prompt);

      if (!response.success) {
        return { examples: [], generated: false };
      }

      try {
        const jsonMatch = response.content.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const examples = JSON.parse(jsonMatch[0]);
          return { examples, generated: true };
        }
      } catch {
        // Parsing échoué
      }

      return { examples: [], generated: false };
    } catch {
      return { examples: [], generated: false };
    }
  }

  /**
   * Construit le prompt d'enrichissement
   */
  private buildEnhancementPrompt(
    section: CourseSection,
    options: EnhancementOptions
  ): string {
    let prompt = `Tu es un expert pédagogique. Améliore cette section de cours:\n\n`;
    prompt += `Titre: ${section.title}\n`;
    prompt += `Contenu: ${section.explanation.substring(0, 1000)}\n\n`;

    const instructions: string[] = [];
    if (options.reformulate) {
      instructions.push('Reformule pour plus de clarté');
    }
    if (options.addExamples && section.examples.length < 2) {
      instructions.push('Ajoute des exemples concrets');
    }
    if (options.improveStyle) {
      instructions.push('Améliore le style pédagogique');
    }

    prompt += `Instructions: ${instructions.join(', ')}.\n`;
    prompt += `Retourne uniquement le contenu amélioré, sans balises.`;

    return prompt;
  }
}

export const aiEnhancer = AIEnhancer.getInstance();
