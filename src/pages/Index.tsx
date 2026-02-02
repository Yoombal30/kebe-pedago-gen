import React, { useState } from 'react';
import { Bot, BookOpen, Settings, FileText, Zap, Upload, Wand2, HelpCircle, Info, LifeBuoy, History, Layout, BarChart3, Play, Sparkles, CheckCircle, Database, GraduationCap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ChatInterface';
import { AdminPanel } from '@/components/AdminPanel';
import { ModuleManager } from '@/components/ModuleManager';
import { DocumentManager } from '@/components/DocumentManager';
import { CourseGenerator } from '@/components/CourseGenerator';
import { QCMManager } from '@/components/QCMManager';
import { UserGuide } from '@/components/UserGuide';
import { AppStatus } from '@/components/AppStatus';
import { StatusIndicator } from '@/components/StatusIndicator';
import { CourseHistory } from '@/components/CourseHistory';
import { CourseTemplates } from '@/components/CourseTemplates';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { PresentationMode } from '@/components/PresentationMode';
import { NormExplorer } from '@/components/NormExplorer';
import { NormativeCourseGeneratorUI } from '@/components/NormativeCourseGenerator';
import { Badge } from '@/components/ui/badge';
import { demoCourse } from '@/data/demoCourse';
interface DashboardProps {
  onLaunchDemo: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLaunchDemo }) => (
  <div className="p-6">
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Professeur KEBE</h1>
            <p className="text-muted-foreground text-lg">
              Générateur de cours professionnel - Fonctionne avec ou sans IA
            </p>
          </div>
        </div>
        <Button onClick={onLaunchDemo} size="lg" className="gap-2 hidden md:flex">
          <Play className="w-5 h-5" />
          Démo Présentation
        </Button>
      </div>
    </div>

    {/* Bannière mode robuste */}
    <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground">Mode robuste actif</h3>
          <p className="text-sm text-muted-foreground">
            L'application génère des cours complets par analyse structurée des documents.
            L'IA est un enrichissement optionnel, jamais bloquant.
          </p>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Génération
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">Sans IA</div>
          <p className="text-xs text-muted-foreground">Logique 100% déterministe</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4 text-secondary-foreground" />
            Norme NS 01-001
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary-foreground">1994</div>
          <p className="text-xs text-muted-foreground">Règles de sécurité électrique</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-muted-foreground">Word, PPT, PDF, SCORM</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Optionnelle</div>
          <p className="text-xs text-muted-foreground">Enrichissement non-bloquant</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Fonctionnalités avancées
            </CardTitle>
            <CardDescription>
              Découvrez toutes les capacités de Professeur KEBE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-primary" />
                  Templates pré-configurés
                </h4>
                <p className="text-sm text-muted-foreground">
                  6 templates de formation prêts à l'emploi : sécurité, management, IT...
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  Historique complet
                </h4>
                <p className="text-sm text-muted-foreground">
                  Retrouvez et restaurez tous vos cours générés avec versioning
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Tableau de bord analytique
                </h4>
                <p className="text-sm text-muted-foreground">
                  Statistiques détaillées sur vos formations et exports
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  Prévisualisation interactive
                </h4>
                <p className="text-sm text-muted-foreground">
                  Visualisez vos cours avec navigation et QCM interactifs
                </p>
              </div>
            </div>

            {/* Demo button for mobile */}
            <div className="mt-6 md:hidden">
              <Button onClick={onLaunchDemo} className="w-full gap-2">
                <Play className="w-5 h-5" />
                Tester la démo présentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Guide rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <div className="font-medium text-sm">Configurer le moteur IA</div>
                  <div className="text-xs text-muted-foreground">Onglet Administration</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <div className="font-medium text-sm">Importer vos documents</div>
                  <div className="text-xs text-muted-foreground">PDF, Word, TXT supportés</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <div className="font-medium text-sm">Générer le cours</div>
                  <div className="text-xs text-muted-foreground">Avec ou sans template</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <div className="font-medium text-sm">Exporter et partager</div>
                  <div className="text-xs text-muted-foreground">Word, PowerPoint, PDF</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [showDemoPresentation, setShowDemoPresentation] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Presentation Mode */}
      {showDemoPresentation && (
        <PresentationMode
          course={demoCourse}
          onClose={() => setShowDemoPresentation(false)}
        />
      )}
      <Tabs defaultValue="dashboard" className="h-screen flex flex-col">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container">
            <div className="flex items-center justify-between">
              <TabsList className="h-12 w-full max-w-5xl overflow-x-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">Accueil</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat IA</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  <span className="hidden sm:inline">Templates</span>
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Générateur</span>
                </TabsTrigger>
                <TabsTrigger value="modules" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Modules</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Documents</span>
                </TabsTrigger>
                <TabsTrigger value="qcm" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">QCM</span>
                </TabsTrigger>
                <TabsTrigger value="norm-generator" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Cours Normatif</span>
                </TabsTrigger>
                <TabsTrigger value="norms" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Explorer</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Historique</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="guide" className="flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  <span className="hidden sm:inline">Guide</span>
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">État</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-3 ml-4">
                <StatusIndicator />
                <div className="text-sm text-muted-foreground hidden md:block">
                  <span className="font-semibold">Professeur KEBE</span> v3.0
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <TabsContent value="dashboard" className="m-0 h-full">
            <Dashboard onLaunchDemo={() => setShowDemoPresentation(true)} />
          </TabsContent>
          
          <TabsContent value="chat" className="m-0 h-full p-6">
            <div className="max-w-4xl mx-auto h-full">
              <ChatInterface />
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="m-0 h-full p-6">
            <CourseTemplates onSelectTemplate={(template) => {
              console.log('Template selected:', template);
            }} />
          </TabsContent>
          
          <TabsContent value="generator" className="m-0 h-full p-6">
            <CourseGenerator />
          </TabsContent>
          
          <TabsContent value="modules" className="m-0 h-full">
            <ModuleManager />
          </TabsContent>
          
          <TabsContent value="documents" className="m-0 h-full">
            <DocumentManager />
          </TabsContent>
          
          <TabsContent value="qcm" className="m-0 h-full">
            <QCMManager />
          </TabsContent>
          
          <TabsContent value="norm-generator" className="m-0 h-full p-6">
            <NormativeCourseGeneratorUI />
          </TabsContent>
          
          <TabsContent value="norms" className="m-0 h-full p-6">
            <NormExplorer />
          </TabsContent>
          
          <TabsContent value="history" className="m-0 h-full">
            <CourseHistory />
          </TabsContent>
          
          <TabsContent value="analytics" className="m-0 h-full">
            <AnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="guide" className="m-0 h-full">
            <UserGuide />
          </TabsContent>
          
          <TabsContent value="status" className="m-0 h-full">
            <AppStatus />
          </TabsContent>
          
          <TabsContent value="admin" className="m-0 h-full">
            <AdminPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Index;
