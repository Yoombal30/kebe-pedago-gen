
import React from 'react';
import { CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/contexts/AIContext';

export const AppStatus: React.FC = () => {
  const { activeEngine, isConnected } = useAI();

  const features = [
    {
      name: "Chat IA Professeur KEBE",
      status: "active",
      description: "Interface conversationnelle fonctionnelle"
    },
    {
      name: "Gestion des modules pédagogiques",
      status: "active",
      description: "Création, modification et suppression de modules"
    },
    {
      name: "Upload et analyse de documents",
      status: "active",
      description: "Support PDF, DOCX, TXT avec extraction de contenu"
    },
    {
      name: "Génération automatique de cours",
      status: "active",
      description: "Création de contenus pédagogiques structurés"
    },
    {
      name: "Système de QCM",
      status: "active",
      description: "Création manuelle et génération automatique"
    },
    {
      name: "Export multi-formats",
      status: "active",
      description: "PDF, Word, PowerPoint, SCORM"
    },
    {
      name: "Moteurs IA multiples",
      status: "active",
      description: "Support local (Ollama) et distant (APIs)"
    },
    {
      name: "Administration système",
      status: "active",
      description: "Configuration et monitoring des moteurs IA"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">État de l'application</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble des fonctionnalités et de leur statut
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Moteur IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {activeEngine?.name || "Non configuré"}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Connecté</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">Déconnecté</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8/8</div>
            <p className="text-xs text-green-600">Toutes opérationnelles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.0.0</div>
            <p className="text-xs text-muted-foreground">Professeur KEBE</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités principales</CardTitle>
          <CardDescription>
            État détaillé de chaque composant de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(feature.status)}
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
                {getStatusBadge(feature.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes recommandées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <div className="font-medium">Configurer un moteur IA</div>
                <div className="text-sm text-muted-foreground">
                  Allez dans Administration → Moteurs IA pour configurer Ollama ou une API distante
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <div className="font-medium">Créer vos premiers modules</div>
                <div className="text-sm text-muted-foreground">
                  Définissez vos objectifs pédagogiques dans l'onglet Modules
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <div className="font-medium">Importer vos documents sources</div>
                <div className="text-sm text-muted-foreground">
                  Uploadez vos normes et documents techniques dans l'onglet Documents
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">4</span>
              </div>
              <div>
                <div className="font-medium">Générer votre premier cours</div>
                <div className="text-sm text-muted-foreground">
                  Utilisez le Générateur pour créer des contenus pédagogiques automatiquement
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
