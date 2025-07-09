
import React, { useState } from 'react';
import { BookOpen, Wand2, Download, FileText, Presentation, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAI } from '@/contexts/AIContext';
import { Course, Module, Document, CourseContent } from '@/types';

export const CourseGenerator: React.FC = () => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { sendMessage, activeEngine } = useAI();
  const { toast } = useToast();

  // Données de démonstration
  const availableModules: Module[] = [
    {
      id: '1',
      title: 'Sécurité électrique - Bases NF C 18-510',
      prerequisites: ['Connaissances générales en électricité'],
      knowledge: ['Réglementation NF C 18-510', 'Risques électriques', 'Équipements de protection'],
      skills: ['Identifier les risques électriques', 'Utiliser les EPI appropriés'],
      duration: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const availableDocuments: Document[] = [
    {
      id: '1',
      name: 'NF C 18-510 - Norme officielle.pdf',
      type: 'pdf',
      size: 2048000,
      uploadedAt: new Date(),
      processed: true,
      content: 'Contenu normatif détaillé sur la sécurité électrique...'
    }
  ];

  const handleGenerateCourse = async () => {
    if (!activeEngine) {
      toast({
        title: "Moteur IA requis",
        description: "Veuillez configurer un moteur IA dans l'administration",
        variant: "destructive"
      });
      return;
    }

    if (selectedModules.length === 0) {
      toast({
        title: "Modules requis",
        description: "Sélectionnez au moins un module pour générer le cours",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Simulation du processus de génération
      const intervals = [20, 40, 60, 80, 90, 100];
      const messages = [
        "Analyse des modules sélectionnés...",
        "Extraction des contenus des documents...",
        "Génération de la structure pédagogique...",
        "Création des explications détaillées...",
        "Génération des QCM et exercices...",
        "Finalisation du cours complet..."
      ];

      for (let i = 0; i < intervals.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(intervals[i]);
        
        if (i < messages.length) {
          toast({
            title: "Génération en cours",
            description: messages[i]
          });
        }
      }

      const courseContent: CourseContent = {
        introduction: `Ce cours sur la sécurité électrique couvre les aspects essentiels de la norme NF C 18-510. Il est conçu pour former les professionnels aux bonnes pratiques et aux réglementations en vigueur.`,
        sections: [
          {
            id: '1',
            title: 'Introduction à la sécurité électrique',
            explanation: 'La sécurité électrique est un enjeu majeur dans tous les domaines d\'activité impliquant l\'électricité. Cette section présente les principes fondamentaux et les risques associés.',
            examples: [
              'Accident par électrocution sur chantier',
              'Incendie d\'origine électrique en milieu industriel'
            ],
            warnings: [
              'Ne jamais travailler sur une installation sous tension sans habilitation',
              'Toujours vérifier l\'absence de tension avant intervention'
            ],
            illustrations: ['schema-risques-electriques.jpg']
          },
          {
            id: '2',
            title: 'Équipements de protection individuelle',
            explanation: 'Les EPI sont essentiels pour la protection des travailleurs. Cette section détaille les différents équipements et leur utilisation.',
            examples: [
              'Casque isolant classe E',
              'Gants isolants adaptés à la tension'
            ],
            warnings: [
              'Vérifier l\'état des EPI avant chaque utilisation',
              'Respecter les dates de péremption'
            ]
          }
        ],
        conclusion: 'La maîtrise de la sécurité électrique nécessite une formation continue et une application rigoureuse des procédures. Ce cours constitue une base solide pour développer une culture de sécurité.',
        qcm: [
          {
            id: '1',
            question: 'Quelle est la première action à effectuer avant toute intervention sur une installation électrique ?',
            options: [
              'Mettre ses gants',
              'Vérifier l\'absence de tension',
              'Couper le disjoncteur',
              'Prévenir le responsable'
            ],
            correctAnswer: 1,
            explanation: 'Selon la norme NF C 18-510, la vérification d\'absence de tension (VAT) est l\'étape préalable obligatoire à toute intervention.'
          },
          {
            id: '2',
            question: 'Quelle classe d\'habilitation est requise pour des travaux non électriques en zone 4 ?',
            options: [
              'B0',
              'H0',
              'B1',
              'H1'
            ],
            correctAnswer: 0,
            explanation: 'L\'habilitation B0 permet d\'effectuer des travaux non électriques dans un environnement électrique basse tension.'
          }
        ],
        resources: [
          'Norme NF C 18-510 version 2012',
          'Guide pratique de l\'habilitation électrique',
          'Mémento sécurité électrique INRS'
        ]
      };

      const newCourse: Course = {
        id: Date.now().toString(),
        title: courseTitle || 'Cours généré automatiquement',
        modules: availableModules.filter(m => selectedModules.includes(m.id)),
        documents: availableDocuments.filter(d => selectedDocuments.includes(d.id)),
        content: courseContent,
        generatedAt: new Date(),
        lastModified: new Date()
      };

      setGeneratedCourse(newCourse);
      
      toast({
        title: "Cours généré avec succès !",
        description: "Le contenu pédagogique a été créé selon vos spécifications"
      });

    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Une erreur s'est produite lors de la génération du cours",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const handleExport = (format: string) => {
    if (!generatedCourse) return;

    toast({
      title: `Export ${format.toUpperCase()}`,
      description: `Le cours sera exporté au format ${format.toUpperCase()}`
    });

    // Simulation d'export
    const exportData = {
      pdf: () => 'data:application/pdf;base64,JVBERi0xLjQKJQ==',
      docx: () => 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEs=',
      pptx: () => 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEs=',
      scorm: () => 'data:application/zip;base64,UEs='
    };

    const blob = new Blob([exportData[format as keyof typeof exportData]?.() || ''], {
      type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedCourse.title}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Générateur de cours</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du cours</CardTitle>
              <CardDescription>
                Définissez les paramètres de votre cours automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre du cours</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Ex: Formation sécurité électrique"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Décrivez brièvement les objectifs du cours..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Modules à inclure</label>
                <div className="space-y-2">
                  {availableModules.map((module) => (
                    <div key={module.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`module-${module.id}`}
                        checked={selectedModules.includes(module.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModules(prev => [...prev, module.id]);
                          } else {
                            setSelectedModules(prev => prev.filter(id => id !== module.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`module-${module.id}`} className="text-sm flex-1">
                        {module.title}
                        <Badge variant="outline" className="ml-2">{module.duration}h</Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Documents sources</label>
                <div className="space-y-2">
                  {availableDocuments.map((document) => (
                    <div key={document.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`doc-${document.id}`}
                        checked={selectedDocuments.includes(document.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(prev => [...prev, document.id]);
                          } else {
                            setSelectedDocuments(prev => prev.filter(id => id !== document.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`doc-${document.id}`} className="text-sm flex-1">
                        {document.name}
                        <Badge variant={document.processed ? "secondary" : "outline"} className="ml-2">
                          {document.processed ? "Analysé" : "En attente"}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerateCourse}
                disabled={generating || !activeEngine}
                className="w-full"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {generating ? "Génération en cours..." : "Générer le cours"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {generating && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Génération en cours</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {generatedCourse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {generatedCourse.title}
                </CardTitle>
                <CardDescription>
                  Généré le {generatedCourse.generatedAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Structure du cours</h4>
                  <div className="space-y-2">
                    {generatedCourse.content.sections.map((section, index) => (
                      <div key={section.id} className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span>{section.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">QCM généré</h4>
                  <Badge variant="secondary">
                    {generatedCourse.content.qcm.length} questions
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Formats d'export</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('pdf')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('docx')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Word
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('pptx')}
                    >
                      <Presentation className="h-4 w-4 mr-2" />
                      PowerPoint
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('scorm')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      SCORM
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
