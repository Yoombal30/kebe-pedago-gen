
import React from 'react';
import { Bot, BookOpen, Settings, FileText, Zap, Upload, Wand2, HelpCircle, Info, LifeBuoy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatInterface } from '@/components/ChatInterface';
import { AdminPanel } from '@/components/AdminPanel';
import { ModuleManager } from '@/components/ModuleManager';
import { DocumentManager } from '@/components/DocumentManager';
import { CourseGenerator } from '@/components/CourseGenerator';
import { QCMManager } from '@/components/QCMManager';
import { UserGuide } from '@/components/UserGuide';
import { AppStatus } from '@/components/AppStatus';
import { StatusIndicator } from '@/components/StatusIndicator';


const Dashboard = () => (
  <div className="p-6">
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Professeur KEBE</h1>
      <p className="text-muted-foreground text-lg">
        Votre assistant IA pédagogique pour la création de contenus de formation
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            IA Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">Professeur KEBE</div>
          <p className="text-xs text-muted-foreground">Moteur pédagogique</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1</div>
          <p className="text-xs text-muted-foreground">Module créé</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Document source</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Cours générés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Cours complet</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assistant IA Configuré</CardTitle>
                  <CardDescription>
                    Moteur Hugging Face connecté et prêt à l'emploi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-primary">✅ Application prête pour la production</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Moteur IA gratuit Hugging Face configuré</li>
                        <li>• Aucune clé API requise</li>
                        <li>• Fonctionnalités complètes disponibles</li>
                        <li>• Chat, génération de cours et QCM opérationnels</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">💡 Suggestions pour commencer :</h4>
                      <ul className="text-sm space-y-1">
                        <li>• "Crée un module sur la sécurité électrique"</li>
                        <li>• "Génère un cours à partir de mes modules"</li>
                        <li>• "Ajoute une section QCM à la fin"</li>
                        <li>• "Exporte le cours en PDF"</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">IA Conversationnelle</div>
                  <div className="text-xs text-muted-foreground">Dialogue naturel</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">Modules pédagogiques</div>
                  <div className="text-xs text-muted-foreground">Création structurée</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">Génération automatique</div>
                  <div className="text-xs text-muted-foreground">Cours complets</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">Moteurs IA</div>
                  <div className="text-xs text-muted-foreground">Local ou distant</div>
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
  return (
    <div className="min-h-screen bg-background">
        <Tabs defaultValue="dashboard" className="h-screen flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container">
          <div className="flex items-center justify-between">
            <TabsList className="h-12 grid-cols-9 w-full max-w-4xl">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Tableau de bord
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Chat IA
                  </TabsTrigger>
                  <TabsTrigger value="modules" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Modules
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="generator" className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Générateur
                  </TabsTrigger>
                  <TabsTrigger value="qcm" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    QCM
                  </TabsTrigger>
                  <TabsTrigger value="guide" className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4" />
                    Guide
                  </TabsTrigger>
                  <TabsTrigger value="status" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    État
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Administration
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-3">
                  <StatusIndicator />
                  <div className="text-sm text-muted-foreground">
                    Professeur KEBE v2.0
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="dashboard" className="m-0 h-full">
              <Dashboard />
            </TabsContent>
            
            <TabsContent value="chat" className="m-0 h-full p-6">
              <div className="max-w-4xl mx-auto h-full">
                <ChatInterface />
              </div>
            </TabsContent>
            
            <TabsContent value="modules" className="m-0 h-full">
              <ModuleManager />
            </TabsContent>
            
            <TabsContent value="documents" className="m-0 h-full">
              <DocumentManager />
            </TabsContent>
            
            <TabsContent value="generator" className="m-0 h-full">
              <CourseGenerator />
            </TabsContent>
            
            <TabsContent value="qcm" className="m-0 h-full">
              <QCMManager />
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
