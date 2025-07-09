
import React, { useState } from 'react';
import { Wand2, FileText, Download, BookOpen, Settings, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAI } from '@/contexts/AIContext';

interface GeneratedCourse {
  id: string;
  title: string;
  content: string;
  modules: string[];
  qcmCount: number;
  generatedAt: Date;
  status: 'generating' | 'completed' | 'error';
}

export const CourseGenerator: React.FC = () => {
  const [courses, setCourses] = useState<GeneratedCourse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [settings, setSettings] = useState({
    includeQCM: true,
    includeIntroduction: true,
    includeConclusion: true,
    addExamples: true,
    addWarnings: true,
    courseStyle: 'structured' as 'structured' | 'conversational' | 'technical'
  });
  const [customInstructions, setCustomInstructions] = useState('');
  const { sendMessage, activeEngine, isConnected } = useAI();
  const { toast } = useToast();

  const handleGenerateCourse = async () => {
    if (!activeEngine || !isConnected) {
      toast({
        title: "Moteur IA requis",
        description: "Veuillez configurer et connecter un moteur IA dans l'administration",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const newCourse: GeneratedCourse = {
      id: Date.now().toString(),
      title: 'Cours en génération...',
      content: '',
      modules: [],
      qcmCount: 0,
      generatedAt: new Date(),
      status: 'generating'
    };

    setCourses(prev => [newCourse, ...prev]);

    try {
      // Simulation de progression
      const progressSteps = [
        { step: 20, message: "Analyse des modules..." },
        { step: 40, message: "Génération de l'introduction..." },
        { step: 60, message: "Création du contenu principal..." },
        { step: 80, message: "Ajout des exemples et exercices..." },
        { step: 90, message: "Génération du QCM..." },
        { step: 100, message: "Finalisation du cours..." }
      ];

      for (const { step, message } of progressSteps) {
        setGenerationProgress(step);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Génération du contenu via l'IA
      const prompt = `Génère un cours de formation structuré avec les paramètres suivants :
      - Style : ${settings.courseStyle}
      - Inclure introduction : ${settings.includeIntroduction ? 'Oui' : 'Non'}
      - Inclure conclusion : ${settings.includeConclusion ? 'Oui' : 'Non'}
      - Ajouter exemples : ${settings.addExamples ? 'Oui' : 'Non'}
      - Ajouter avertissements : ${settings.addWarnings ? 'Oui' : 'Non'}
      - Inclure QCM : ${settings.includeQCM ? 'Oui' : 'Non'}
      
      Instructions personnalisées : ${customInstructions || 'Aucune'}
      
      Le cours doit être complet, pédagogique et prêt à être utilisé en formation.`;

      await sendMessage(prompt);

      // Simulation du résultat
      const generatedContent = `# Cours de Formation Professionnelle

## Introduction
Ce cours a été généré automatiquement par le Professeur KEBE pour répondre à vos besoins de formation spécifiques.

## Module 1: Fondamentaux
### Objectifs pédagogiques
- Comprendre les concepts de base
- Maîtriser les bonnes pratiques
- Appliquer les procédures en situation réelle

### Contenu théorique
Les fondamentaux constituent la base essentielle de toute formation professionnelle...

### Exemples pratiques
${settings.addExamples ? `
1. Exemple concret en situation professionnelle
2. Cas d'étude détaillé avec solution
3. Exercice d'application pratique
` : ''}

### Points d'attention
${settings.addWarnings ? `
⚠️ Attention aux erreurs courantes
⚠️ Précautions de sécurité importantes
⚠️ Bonnes pratiques à respecter
` : ''}

## Module 2: Applications pratiques
### Mise en œuvre
Les applications pratiques permettent de consolider les acquis théoriques...

### Évaluation des compétences
L'évaluation se fait par observation directe et contrôle des réalisations...

${settings.includeConclusion ? `
## Conclusion
Ce cours vous a permis d'acquérir les compétences essentielles pour...
Les prochaines étapes de votre formation incluront...
` : ''}

${settings.includeQCM ? `
## QCM d'évaluation

**Question 1:** Quelle est la première étape de la procédure ?
a) Vérifier les équipements
b) Lire la documentation
c) Contacter le superviseur
d) Préparer l'espace de travail

**Réponse correcte:** a) Vérifier les équipements
**Explication:** La vérification des équipements est primordiale pour la sécurité.

**Question 2:** Combien de temps faut-il prévoir pour cette opération ?
a) 15 minutes
b) 30 minutes
c) 45 minutes
d) 1 heure

**Réponse correcte:** b) 30 minutes
**Explication:** Le temps standard recommandé est de 30 minutes pour une exécution optimale.

**Question 3:** Quelle est la principale erreur à éviter ?
a) Aller trop vite
b) Ne pas porter d'EPI
c) Oublier la documentation
d) Toutes les réponses

**Réponse correcte:** d) Toutes les réponses
**Explication:** Chacune de ces erreurs peut compromettre la sécurité et la qualité.
` : ''}`;

      const updatedCourse: GeneratedCourse = {
        ...newCourse,
        title: 'Cours de Formation Professionnelle',
        content: generatedContent,
        modules: ['Fondamentaux', 'Applications pratiques'],
        qcmCount: settings.includeQCM ? 3 : 0,
        status: 'completed'
      };

      setCourses(prev => prev.map(course => 
        course.id === newCourse.id ? updatedCourse : course
      ));

      toast({
        title: "Cours généré avec succès",
        description: "Le cours est maintenant prêt à être consulté et exporté"
      });

    } catch (error) {
      const errorCourse: GeneratedCourse = {
        ...newCourse,
        title: 'Erreur de génération',
        status: 'error'
      };

      setCourses(prev => prev.map(course => 
        course.id === newCourse.id ? errorCourse : course
      ));

      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le cours. Vérifiez votre connexion IA.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleExport = (courseId: string, format: 'pdf' | 'docx' | 'pptx' | 'scorm') => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Simulation de l'export
    const formats = {
      pdf: 'PDF',
      docx: 'Word',
      pptx: 'PowerPoint',
      scorm: 'SCORM'
    };

    toast({
      title: `Export ${formats[format]}`,
      description: `Le cours "${course.title}" a été exporté au format ${formats[format]}`
    });

    // En réalité, ici on créerait et téléchargerait le fichier
    const element = document.createElement('a');
    const file = new Blob([course.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${course.title}.${format === 'docx' ? 'txt' : format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    toast({
      title: "Cours supprimé",
      description: "Le cours a été retiré de la liste"
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Générateur de cours</h1>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Générer</TabsTrigger>
          <TabsTrigger value="courses">Cours générés</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Génération automatique de cours</CardTitle>
              <CardDescription>
                Créez un cours complet à partir de vos modules et documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeEngine || !isConnected ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Configuration requise</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    Veuillez configurer un moteur IA dans l'onglet Administration pour utiliser le générateur.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Prêt à générer</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    Moteur IA connecté : {activeEngine.name}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="instructions">Instructions personnalisées (optionnel)</Label>
                <Textarea
                  id="instructions"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Ajoutez des instructions spécifiques pour personnaliser la génération du cours..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateCourse}
                  disabled={isGenerating || !activeEngine || !isConnected}
                  className="flex-1"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Génération en cours...' : 'Générer le cours'}
                </Button>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Génération en cours...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Cours générés</h2>
            <p className="text-muted-foreground">Liste des cours créés automatiquement</p>
          </div>

          <div className="grid gap-4">
            {courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun cours généré</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Utilisez le générateur pour créer votre premier cours automatique
                  </p>
                </CardContent>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Généré le {course.generatedAt.toLocaleDateString()}</span>
                          <span>{course.modules.length} modules</span>
                          {course.qcmCount > 0 && <span>{course.qcmCount} questions QCM</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          course.status === 'completed' ? 'default' :
                          course.status === 'generating' ? 'secondary' :
                          'destructive'
                        }>
                          {course.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {course.status === 'generating' && <Play className="h-3 w-3 mr-1" />}
                          {course.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {course.status === 'completed' ? 'Terminé' :
                           course.status === 'generating' ? 'En cours' : 'Erreur'}
                        </Badge>
                        
                        {course.status === 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(course.id, 'pdf')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(course.id, 'docx')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Word
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(course.id, 'pptx')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PowerPoint
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(course.id, 'scorm')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              SCORM
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {course.status === 'completed' && (
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Aperçu du contenu :</p>
                        <div className="text-sm line-clamp-4 whitespace-pre-wrap">
                          {course.content.substring(0, 300)}...
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de génération</CardTitle>
              <CardDescription>
                Personnalisez le style et le contenu des cours générés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-qcm">Inclure un QCM</Label>
                    <p className="text-sm text-muted-foreground">
                      Ajouter des questions à choix multiples à la fin du cours
                    </p>
                  </div>
                  <Switch
                    id="include-qcm"
                    checked={settings.includeQCM}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, includeQCM: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-intro">Inclure une introduction</Label>
                    <p className="text-sm text-muted-foreground">
                      Ajouter une introduction au début du cours
                    </p>
                  </div>
                  <Switch
                    id="include-intro"
                    checked={settings.includeIntroduction}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, includeIntroduction: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-conclusion">Inclure une conclusion</Label>
                    <p className="text-sm text-muted-foreground">
                      Ajouter une conclusion à la fin du cours
                    </p>
                  </div>
                  <Switch
                    id="include-conclusion"
                    checked={settings.includeConclusion}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, includeConclusion: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="add-examples">Ajouter des exemples</Label>
                    <p className="text-sm text-muted-foreground">
                      Inclure des exemples pratiques dans chaque section
                    </p>
                  </div>
                  <Switch
                    id="add-examples"
                    checked={settings.addExamples}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, addExamples: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="add-warnings">Ajouter des avertissements</Label>
                    <p className="text-sm text-muted-foreground">
                      Inclure des points d'attention et de sécurité
                    </p>
                  </div>
                  <Switch
                    id="add-warnings"
                    checked={settings.addWarnings}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, addWarnings: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
