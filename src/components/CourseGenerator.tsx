import React, { useState, useEffect } from 'react';
import { Wand2, FileText, Download, Upload, BookOpen, Settings, CheckCircle, AlertCircle, FileUp, Trash2, Eye, Sparkles, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAI } from '@/contexts/AIContext';
import { Course, Module, Document, CourseSection, QCMQuestion, GenerationSettings } from '@/types';
import { exportToWord, exportToPowerPoint, exportToPDF, exportToSCORM } from '@/utils/exportUtils';
import { DocumentProcessor } from '@/services/documentProcessor';
import { DeterministicCourseGenerator, GenerationResult } from '@/services/deterministicCourseGenerator';
import { aiEnhancer } from '@/services/aiEnhancer';
import { CoursePreview } from './CoursePreview';
import { saveCourseToHistory } from './CourseHistory';
import { trackAnalyticsEvent } from './AnalyticsDashboard';

export const CourseGenerator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [useAIEnhancement, setUseAIEnhancement] = useState(false);
  const [lastGenerationStats, setLastGenerationStats] = useState<GenerationResult['processingStats'] | null>(null);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    includeQCM: true,
    includeIntroduction: true,
    includeConclusion: true,
    addExamples: true,
    addWarnings: true,
    qcmQuestionCount: 10,
    courseStyle: 'structured'
  });
  const [customInstructions, setCustomInstructions] = useState('');
  const { activeEngine, isConnected } = useAI();

  // Vérifier la disponibilité de l'IA au chargement
  useEffect(() => {
    const checkAI = async () => {
      const available = await aiEnhancer.checkAvailability();
      setAiAvailable(available);
    };
    checkAI();
  }, [activeEngine, isConnected]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments: Document[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const content = await DocumentProcessor.extractText(file);
        
        const doc: Document = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : 'txt',
          size: file.size,
          uploadedAt: new Date(),
          content,
          processed: true
        };

        newDocuments.push(doc);
        toast.success(`Document "${file.name}" importé avec succès`);
      } catch (error) {
        toast.error(`Erreur lors de l'import de "${file.name}"`);
        console.error('File upload error:', error);
      }
    }

    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Document supprimé');
  };

  /**
   * GÉNÉRATION DE COURS - Fonctionne SANS IA par défaut
   */
  const handleGenerateCourse = async () => {
    if (documents.length === 0) {
      toast.error("Veuillez importer au moins un document");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Étape 1: Analyse des documents (déterministe)
      setGenerationProgress(20);
      toast.info("Analyse structurée des documents...");
      
      await new Promise(resolve => setTimeout(resolve, 500)); // UX feedback

      // Étape 2: Génération déterministe
      setGenerationProgress(50);
      toast.info("Génération du cours...");

      const result = DeterministicCourseGenerator.generateCourse(
        documents,
        settings,
        customInstructions
      );

      let finalCourse = result.course;

      // Étape 3: Enrichissement IA (optionnel et non-bloquant)
      if (useAIEnhancement && aiAvailable) {
        setGenerationProgress(70);
        toast.info("Enrichissement avec l'IA...");

        try {
          // Enrichir les sections (avec timeout)
          const enhancedSections = await Promise.all(
            finalCourse.content.sections.slice(0, 5).map(async (section) => {
              const enhanced = await aiEnhancer.enhanceSection(section);
              if (enhanced.enhanced) {
                return { ...section, explanation: enhanced.enhancedContent };
              }
              return section;
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
          console.warn("Enrichissement IA non disponible:", error);
          toast.info("Cours généré sans enrichissement IA");
        }
      }

      // Étape 4: Finalisation
      setGenerationProgress(100);

      setCourses(prev => [finalCourse, ...prev]);
      setLastGenerationStats(result.processingStats);
      
      // Save to history and track analytics
      saveCourseToHistory(finalCourse);
      trackAnalyticsEvent('course_generated', { 
        generationTime: result.processingStats.processingTimeMs,
        withAI: useAIEnhancement && aiAvailable
      });
      documents.forEach(() => trackAnalyticsEvent('document_processed'));
      
      const aiLabel = result.generatedWithAI ? 'avec IA' : 'sans IA';
      toast.success(`Cours généré ${aiLabel} et sauvegardé !`);

    } catch (error) {
      console.error('Course generation error:', error);
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleExport = async (courseId: string, format: 'pdf' | 'docx' | 'pptx' | 'scorm') => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      switch (format) {
        case 'docx':
          await exportToWord(course);
          trackAnalyticsEvent('export', { format: 'docx' });
          break;
        case 'pptx':
          await exportToPowerPoint(course);
          trackAnalyticsEvent('export', { format: 'pptx' });
          break;
        case 'pdf':
          await exportToPDF(course);
          trackAnalyticsEvent('export', { format: 'pdf' });
          break;
        case 'scorm':
          await exportToSCORM(course);
          break;
      }
      toast.success(`Export ${format.toUpperCase()} réussi`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Erreur lors de l'export ${format.toUpperCase()}`);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.success('Cours supprimé');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">
            <Wand2 className="w-4 h-4 mr-2" />
            Générer
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            Cours générés ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Onglet Génération */}
        <TabsContent value="generate" className="space-y-6">
          {/* Import de documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Documents sources
              </CardTitle>
              <CardDescription>
                Importez vos documents (PDF, Word, TXT) pour générer une formation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <FileUp className="w-4 h-4 mr-2" />
                  Parcourir
                </Button>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <Label>Documents importés ({documents.length})</Label>
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(doc.size / 1024).toFixed(2)} KB • {doc.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions personnalisées */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions personnalisées</CardTitle>
              <CardDescription>
                Ajoutez des consignes spécifiques pour la génération du cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ex: Créer une formation pour des débutants, mettre l'accent sur la pratique, inclure des études de cas réels..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Option d'enrichissement IA */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Enrichissement IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Améliorer avec l'IA</Label>
                  <p className="text-xs text-muted-foreground">
                    Reformulation et exemples supplémentaires
                  </p>
                </div>
                <Switch
                  checked={useAIEnhancement}
                  onCheckedChange={setUseAIEnhancement}
                  disabled={!aiAvailable}
                />
              </div>
              
              <div className={`p-3 rounded-lg text-sm ${aiAvailable ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-muted text-muted-foreground'}`}>
                <div className="flex items-center gap-2">
                  {aiAvailable ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>IA disponible pour enrichissement</span>
                    </>
                  ) : (
                    <>
                      <Info className="w-4 h-4" />
                      <span>IA désactivée - Génération 100% déterministe</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton de génération */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {isGenerating ? (
                <div className="space-y-4">
                  <Progress value={generationProgress} />
                  <p className="text-center text-sm text-muted-foreground">
                    Génération en cours... {generationProgress}%
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateCourse}
                  disabled={documents.length === 0}
                  className="w-full"
                  size="lg"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Générer le cours {useAIEnhancement && aiAvailable ? '+ IA' : '(sans IA)'}
                </Button>
              )}

              {lastGenerationStats && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Dernière génération : {lastGenerationStats.sectionsCreated} sections, 
                    {lastGenerationStats.qcmGenerated} questions QCM en {lastGenerationStats.processingTimeMs}ms
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Info mode sans IA */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Mode robuste :</strong> Le cours est généré par analyse structurée des documents.
              L'IA est optionnelle et sert uniquement à enrichir le contenu.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Onglet Cours générés */}
        <TabsContent value="courses" className="space-y-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucun cours généré</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par importer des documents et générer votre premier cours
                </p>
              </CardContent>
            </Card>
          ) : (
            courses.map(course => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        Généré le {new Date(course.generatedAt).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complété
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Modules</p>
                      <p className="font-semibold">{course.modules.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sections</p>
                      <p className="font-semibold">{course.content.sections.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Questions QCM</p>
                      <p className="font-semibold">{course.content.qcm.length}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewCourse(course)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Prévisualiser
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleExport(course.id, 'docx')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Word
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleExport(course.id, 'pptx')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PowerPoint
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(course.id, 'pdf')}
                      disabled
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de génération</CardTitle>
              <CardDescription>
                Personnalisez le contenu et le style de vos formations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeIntro">Inclure une introduction</Label>
                  <Switch
                    id="includeIntro"
                    checked={settings.includeIntroduction}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, includeIntroduction: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeConclusion">Inclure une conclusion</Label>
                  <Switch
                    id="includeConclusion"
                    checked={settings.includeConclusion}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, includeConclusion: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="addExamples">Ajouter des exemples</Label>
                  <Switch
                    id="addExamples"
                    checked={settings.addExamples}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, addExamples: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="addWarnings">Ajouter des points d'attention</Label>
                  <Switch
                    id="addWarnings"
                    checked={settings.addWarnings}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, addWarnings: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeQCM">Générer un QCM</Label>
                  <Switch
                    id="includeQCM"
                    checked={settings.includeQCM}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, includeQCM: checked })
                    }
                  />
                </div>

                {settings.includeQCM && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="qcmCount">Nombre de questions QCM</Label>
                    <Input
                      id="qcmCount"
                      type="number"
                      min="5"
                      max="20"
                      value={settings.qcmQuestionCount}
                      onChange={(e) =>
                        setSettings({ ...settings, qcmQuestionCount: parseInt(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Style de cours</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['structured', 'conversational', 'technical'] as const).map((style) => (
                    <Button
                      key={style}
                      variant={settings.courseStyle === style ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, courseStyle: style })}
                    >
                      {style === 'structured' && 'Structuré'}
                      {style === 'conversational' && 'Conversationnel'}
                      {style === 'technical' && 'Technique'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewCourse} onOpenChange={(open) => !open && setPreviewCourse(null)}>
        <DialogContent className="max-w-5xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Prévisualisation du cours</DialogTitle>
            <DialogDescription>
              Naviguez dans le cours et testez le QCM interactif
            </DialogDescription>
          </DialogHeader>
          {previewCourse && (
            <div className="flex-1 overflow-hidden -mx-6 -mb-6">
              <CoursePreview course={previewCourse} onClose={() => setPreviewCourse(null)} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
