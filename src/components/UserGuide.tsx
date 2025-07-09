
import React from 'react';
import { BookOpen, Bot, Upload, Wand2, HelpCircle, FileText, Settings, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const UserGuide: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Guide d'utilisation - Professeur KEBE</h1>
        <p className="text-muted-foreground text-lg">
          Votre assistant IA pédagogique pour la création de contenus de formation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Démarrage rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Configuration initiale</h4>
              <p className="text-sm text-muted-foreground">
                Allez dans l'onglet Administration pour configurer votre moteur IA préféré
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Créer vos modules</h4>
              <p className="text-sm text-muted-foreground">
                Définissez vos objectifs pédagogiques dans l'onglet Modules
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Import de documents</h4>
              <p className="text-sm text-muted-foreground">
                Uploadez vos documents sources (PDF, DOCX, TXT)
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">4. Génération automatique</h4>
              <p className="text-sm text-muted-foreground">
                Laissez Professeur KEBE créer vos cours complets
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuration des moteurs IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Moteurs locaux disponibles :</h4>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline">Ollama</Badge>
              <Badge variant="outline">LM Studio</Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium">Moteurs distants disponibles :</h4>
            <div className="grid grid-cols-3 gap-2">
              <Badge variant="outline">Mistral AI</Badge>
              <Badge variant="outline">OpenRouter</Badge>
              <Badge variant="outline">Hugging Face</Badge>
              <Badge variant="outline">Anthropic Claude</Badge>
              <Badge variant="outline">Groq</Badge>
              <Badge variant="outline">Together AI</Badge>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Recommandation :</strong> Pour une utilisation hors ligne, configurez Ollama avec un modèle local comme Mistral 7B ou Llama 2.
              Pour de meilleures performances, utilisez Claude ou GPT-4 via OpenRouter.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat avec Professeur KEBE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Utilisez le chat pour interagir naturellement avec l'IA. Voici des exemples de commandes :
          </p>
          
          <div className="space-y-3">
            <div className="bg-muted p-3 rounded-lg">
              <h5 className="font-medium text-sm mb-1">Création de modules :</h5>
              <p className="text-sm text-muted-foreground">
                "Crée un module sur la sécurité électrique de 4 heures"
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <h5 className="font-medium text-sm mb-1">Génération de cours :</h5>
              <p className="text-sm text-muted-foreground">
                "Génère un cours complet à partir de mes modules sur la sécurité"
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <h5 className="font-medium text-sm mb-1">Modification de l'application :</h5>
              <p className="text-sm text-muted-foreground">
                "Ajoute une section QCM à la fin de chaque cours"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Gestion des modules pédagogiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Structure d'un module :</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• <strong>Titre :</strong> Nom du module</li>
              <li>• <strong>Durée :</strong> En heures</li>
              <li>• <strong>Prérequis :</strong> Connaissances nécessaires</li>
              <li>• <strong>Savoirs :</strong> Connaissances théoriques à acquérir</li>
              <li>• <strong>Savoir-faire :</strong> Compétences pratiques à développer</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Astuce :</strong> Séparez chaque prérequis, savoir et savoir-faire sur une ligne différente 
              pour une meilleure organisation automatique.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload et analyse de documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Formats acceptés :</h4>
            <div className="flex gap-2">
              <Badge variant="secondary">PDF</Badge>
              <Badge variant="secondary">DOCX</Badge>
              <Badge variant="secondary">TXT</Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Processus d'analyse :</h4>
            <ol className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>1. Upload du document</li>
              <li>2. Extraction automatique du contenu</li>
              <li>3. Analyse par Professeur KEBE</li>
              <li>4. Indexation pour génération de cours</li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Important :</strong> Les documents volumineux peuvent prendre quelques minutes à analyser.
              L'IA extrait les informations pertinentes pour enrichir vos cours.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Génération automatique de cours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Le générateur crée automatiquement :</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• <strong>Introduction contextuelle</strong> adaptée aux objectifs</li>
              <li>• <strong>Sections détaillées</strong> avec explications claires</li>
              <li>• <strong>Exemples concrets</strong> et cas pratiques</li>
              <li>• <strong>Mises en garde</strong> réglementaires</li>
              <li>• <strong>QCM automatique</strong> pour évaluation</li>
              <li>• <strong>Ressources complémentaires</strong></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Formats d'export disponibles :</h4>
            <div className="grid grid-cols-4 gap-2">
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">Word</Badge>
              <Badge variant="outline">PowerPoint</Badge>
              <Badge variant="outline">SCORM</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Système de QCM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Fonctionnalités :</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Création manuelle de questions</li>
              <li>• Génération automatique basée sur les modules</li>
              <li>• 4 options de réponse par question</li>
              <li>• Explications détaillées pour chaque réponse</li>
              <li>• Export intégré dans les cours</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Auto-génération :</strong> L'IA peut créer automatiquement des QCM pertinents 
              basés sur le contenu de vos modules et documents sources.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Bonnes pratiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Pour les modules :</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                <li>• Définissez des objectifs clairs et mesurables</li>
                <li>• Estimez réalistement la durée de formation</li>
                <li>• Listez tous les prérequis nécessaires</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Pour les documents sources :</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                <li>• Utilisez des documents officiels et à jour</li>
                <li>• Privilégiez les formats texte bien structurés</li>
                <li>• Nommez vos fichiers de manière explicite</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Pour la génération :</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                <li>• Combinez plusieurs modules pour des cours complets</li>
                <li>• Relisez et adaptez le contenu généré si nécessaire</li>
                <li>• Testez les QCM avant diffusion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-6">
        <p className="text-muted-foreground">
          Pour toute question, utilisez le chat avec Professeur KEBE qui vous guidera en temps réel.
        </p>
      </div>
    </div>
  );
};
