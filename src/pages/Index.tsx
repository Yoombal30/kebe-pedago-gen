<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Bot, BookOpen, Settings, FileText, Zap, Upload, Wand2, HelpCircle, Info, LifeBuoy, History, Layout, BarChart3, Play, Sparkles, CheckCircle, Database, GraduationCap, ClipboardCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
=======
 import React, { useState } from 'react';
 import { Bot, FileText, Zap, Play, Sparkles, Database, Layout, History, BarChart3, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
>>>>>>> e05cba30849c3c7900a9fbc2790e87dba9b2816f
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
import { InteractiveQCM } from '@/components/InteractiveQCM';
<<<<<<< HEAD
import { ThemeLanguageSelector } from '@/components/ThemeLanguageSelector';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Badge } from '@/components/ui/badge';
import { demoCourse } from '@/data/demoCourse';
import { useKeyboardShortcuts, APP_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
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
  const [showInteractiveQCM, setShowInteractiveQCM] = useState(false);

  // Activer les raccourcis clavier globaux
  useKeyboardShortcuts(APP_SHORTCUTS);

  return (
    <div className="min-h-screen bg-background">
=======
 import { MainLayout } from '@/components/layout';
import { demoCourse } from '@/data/demoCourse';
import { useKeyboardShortcuts, APP_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

 const Dashboard: React.FC = () => (
   <div className="p-6 space-y-6">
     {/* Hero Section */}
     <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border p-8">
       <div className="absolute inset-0 bg-grid-pattern opacity-5" />
       <div className="relative">
         <div className="flex items-center gap-2 mb-4">
           <Sparkles className="h-5 w-5 text-primary" />
           <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
             Mode Cloud Actif
           </Badge>
         </div>
         <h1 className="text-3xl font-bold mb-2">Bienvenue sur Professeur KEBE</h1>
         <p className="text-muted-foreground max-w-2xl">
           Générez des cours professionnels complets avec ou sans IA. 
           L'enrichissement IA est optionnel et jamais bloquant.
         </p>
       </div>
     </div>
 
     {/* Stats Cards */}
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
       <Card className="group hover:shadow-md transition-shadow">
         <CardContent className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
               <Zap className="h-5 w-5 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">100%</p>
               <p className="text-xs text-muted-foreground">Déterministe</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       <Card className="group hover:shadow-md transition-shadow">
         <CardContent className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
               <Database className="h-5 w-5 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">Multi</p>
               <p className="text-xs text-muted-foreground">Normes</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       <Card className="group hover:shadow-md transition-shadow">
         <CardContent className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
               <FileText className="h-5 w-5 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">4+</p>
               <p className="text-xs text-muted-foreground">Formats export</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       <Card className="group hover:shadow-md transition-shadow">
         <CardContent className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
               <Bot className="h-5 w-5 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">Cloud</p>
               <p className="text-xs text-muted-foreground">IA Intégrée</p>
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
 
     {/* Features & Quick Start */}
     <div className="grid lg:grid-cols-3 gap-6">
       <Card className="lg:col-span-2">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Zap className="w-5 h-5 text-primary" />
             Fonctionnalités principales
           </CardTitle>
           <CardDescription>
             Tout ce dont vous avez besoin pour créer des formations
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid sm:grid-cols-2 gap-4">
             {[
               { icon: Layout, title: '6 Templates', desc: 'Formations prêtes à l\'emploi' },
               { icon: History, title: 'Historique', desc: 'Versioning complet' },
               { icon: BarChart3, title: 'Analytique', desc: 'Statistiques détaillées' },
               { icon: Wand2, title: 'Prévisualisation', desc: 'QCM interactifs' },
             ].map((feature, i) => (
               <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                 <div className="p-2 rounded-md bg-background">
                   <feature.icon className="h-4 w-4 text-primary" />
                 </div>
                 <div>
                   <h4 className="font-medium text-sm">{feature.title}</h4>
                   <p className="text-xs text-muted-foreground">{feature.desc}</p>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle>Démarrage rapide</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {[
               { step: '1', title: 'Configurer l\'IA', desc: 'Administration → Cloud' },
               { step: '2', title: 'Importer documents', desc: 'PDF, Word, TXT' },
               { step: '3', title: 'Générer le cours', desc: 'Templates ou libre' },
               { step: '4', title: 'Exporter', desc: 'Word, PPT, PDF, SCORM' },
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3">
                 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                   {item.step}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-medium text-sm truncate">{item.title}</p>
                   <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     </div>
   </div>
 );

const Index = () => {
   const [activeTab, setActiveTab] = useState('dashboard');
  const [showDemoPresentation, setShowDemoPresentation] = useState(false);

  useKeyboardShortcuts(APP_SHORTCUTS);

   const renderContent = () => {
     switch (activeTab) {
       case 'dashboard':
         return <Dashboard />;
       case 'chat':
         return (
           <div className="p-6 h-full">
             <div className="max-w-4xl mx-auto h-full">
               <ChatInterface />
             </div>
           </div>
         );
       case 'templates':
         return (
           <div className="p-6">
             <CourseTemplates onSelectTemplate={(template) => console.log('Template:', template)} />
           </div>
         );
       case 'generator':
         return (
           <div className="p-6">
             <CourseGenerator />
           </div>
         );
       case 'modules':
         return <ModuleManager />;
       case 'documents':
         return <DocumentManager />;
       case 'qcm':
         return <QCMManager />;
       case 'norm-generator':
         return (
           <div className="p-6">
             <NormativeCourseGeneratorUI />
           </div>
         );
       case 'norms':
         return (
           <div className="p-6">
             <NormExplorer />
           </div>
         );
       case 'history':
         return <CourseHistory />;
       case 'analytics':
         return <AnalyticsDashboard />;
       case 'guide':
         return <UserGuide />;
       case 'status':
         return <AppStatus />;
       case 'admin':
         return <AdminPanel />;
       default:
         return <Dashboard />;
     }
   };
 
  return (
     <>
>>>>>>> e05cba30849c3c7900a9fbc2790e87dba9b2816f
      {/* Demo Presentation Mode */}
      {showDemoPresentation && (
        <PresentationMode
          course={demoCourse}
          onClose={() => setShowDemoPresentation(false)}
        />
      )}
<<<<<<< HEAD
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
                <OfflineIndicator />
                <ThemeLanguageSelector />
                <StatusIndicator />
                <div className="text-sm text-muted-foreground hidden md:block">
                  <span className="font-semibold">Professeur KEBE</span> v4.0
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
=======
       
       <MainLayout
         activeTab={activeTab}
         onTabChange={setActiveTab}
         onLaunchDemo={() => setShowDemoPresentation(true)}
       >
         {renderContent()}
       </MainLayout>
     </>
>>>>>>> e05cba30849c3c7900a9fbc2790e87dba9b2816f
  );
};

export default Index;
