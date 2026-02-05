 import React, { useState } from 'react';
 import { Bot, FileText, Zap, Play, Sparkles, Database, Layout, History, BarChart3, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
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
      {/* Demo Presentation Mode */}
      {showDemoPresentation && (
        <PresentationMode
          course={demoCourse}
          onClose={() => setShowDemoPresentation(false)}
        />
      )}
       
       <MainLayout
         activeTab={activeTab}
         onTabChange={setActiveTab}
         onLaunchDemo={() => setShowDemoPresentation(true)}
       >
         {renderContent()}
       </MainLayout>
     </>
  );
};

export default Index;
