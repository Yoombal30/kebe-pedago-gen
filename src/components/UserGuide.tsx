
import React from 'react';
import { LifeBuoy, Bot, BookOpen, Upload, Wand2, HelpCircle, Settings, Info, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const UserGuide: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <LifeBuoy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Guide d'utilisation</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="getting-started">Premiers pas</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="tips">Conseils</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue dans Professeur KEBE</CardTitle>
              <CardDescription>
                Votre assistant IA pour la création de contenus pédagogiques professionnels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Professeur KEBE est une application complète de création de contenus de formation 
                qui utilise l'intelligence artificielle pour vous accompagner dans vos projets pédagogiques.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Fonctionnalités principales :</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      Assistant IA conversationnel
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Gestion de modules pédagogiques
                    </li>
                    <li className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      Import et analyse de documents
                    </li>
                    <li className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      Génération automatique de cours
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Capacités avancées :</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Création de QCM automatisés
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      Configuration multi-moteurs IA
                    </li>
                    <li className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      Monitoring et logs système
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Export multi-formats
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Architecture de l'application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Intelligence Artificielle</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Moteurs IA locaux et distants
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Gestion de contenu</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modules, documents, cours
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Wand2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Génération automatique</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cours, QCM, exports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration initiale</CardTitle>
              <CardDescription>
                Étapes essentielles pour commencer à utiliser l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Configurer un moteur IA</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Allez dans l'onglet "Administration" pour ajouter et configurer votre premier moteur IA 
                      (Ollama local, Mistral AI, OpenRouter, etc.)
                    </p>
                    <Badge variant="outline" className="mt-2">Obligatoire</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Créer votre premier module</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dans l'onglet "Modules", créez un module pédagogique avec ses objectifs, 
                      prérequis et compétences visées.
                    </p>
                    <Badge variant="secondary" className="mt-2">Recommandé</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Tester le chat IA</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Allez dans l'onglet "Chat IA" pour interagir avec votre assistant et 
                      vérifier que la configuration fonctionne correctement.
                    </p>
                    <Badge variant="secondary" className="mt-2">Test</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premiers pas avec l'IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Exemples de commandes pour débuter :</h4>
                  <ul className="space-y-2 text-sm">
                    <li><code>"Crée un module sur la sécurité incendie"</code></li>
                    <li><code>"Génère un cours à partir de mes modules existants"</code></li>
                    <li><code>"Aide-moi à structurer une formation de 2 jours"</code></li>
                    <li><code>"Crée un QCM de 10 questions sur l'électricité"</code></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Chat IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Interface conversationnelle avec l'assistant Professeur KEBE.</p>
                <ul className="text-sm space-y-1">
                  <li>• Dialogue naturel en français</li>
                  <li>• Commandes de création de contenu</li>
                  <li>• Conseils pédagogiques personnalisés</li>
                  <li>• Historique des conversations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Modules pédagogiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Création et gestion de modules de formation structurés.</p>
                <ul className="text-sm space-y-1">
                  <li>• Définition d'objectifs pédagogiques</li>
                  <li>• Gestion des prérequis et compétences</li>
                  <li>• Estimation de durée</li>
                  <li>• Organisation par savoirs et savoir-faire</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Import et analyse automatique de vos documents existants.</p>
                <ul className="text-sm space-y-1">
                  <li>• Support PDF, DOCX, TXT</li>
                  <li>• Extraction automatique du contenu</li>
                  <li>• Indexation pour la recherche</li>
                  <li>• Aperçu et prévisualisation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Générateur de cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Création automatique de cours complets et structurés.</p>
                <ul className="text-sm space-y-1">
                  <li>• Génération basée sur vos modules</li>
                  <li>• Intégration de vos documents</li>
                  <li>• Styles de cours personnalisables</li>
                  <li>• Export multi-formats</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  QCM Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Création et gestion de questionnaires d'évaluation.</p>
                <ul className="text-sm space-y-1">
                  <li>• Génération automatique par IA</li>
                  <li>• Création manuelle personnalisée</li>
                  <li>• Catégorisation par thèmes</li>
                  <li>• Export et partage</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Configuration avancée et monitoring du système.</p>
                <ul className="text-sm space-y-1">
                  <li>• Gestion des moteurs IA</li>
                  <li>• Configuration des connexions</li>
                  <li>• Monitoring en temps réel</li>
                  <li>• Logs et diagnostics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow : Création d'un cours complet</CardTitle>
              <CardDescription>
                Processus étape par étape pour créer un cours de formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Préparation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Importez vos documents sources et créez les modules de base dans l'onglet "Modules"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Structuration</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Utilisez le chat IA pour affiner la structure et les objectifs de votre formation
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Génération</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lancez la génération automatique dans l'onglet "Générateur" avec vos paramètres
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Évaluation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Créez des QCM d'évaluation dans l'onglet "QCM" pour tester les acquis
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Export</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exportez votre cours final au format désiré (PDF, Word, PowerPoint, SCORM)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow : Configuration d'un moteur IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Moteur local (Ollama/LM Studio)</h4>
                    <ol className="text-sm space-y-2">
                      <li>1. Installez Ollama ou LM Studio</li>
                      <li>2. Téléchargez un modèle (ex: llama3.2)</li>
                      <li>3. Lancez le serveur local</li>
                      <li>4. Configurez dans l'application</li>
                      <li>5. Testez la connexion</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Moteur distant (API)</h4>
                    <ol className="text-sm space-y-2">
                      <li>1. Créez un compte chez le fournisseur</li>
                      <li>2. Obtenez votre clé API</li>
                      <li>3. Configurez l'endpoint</li>
                      <li>4. Saisissez vos identifiants</li>
                      <li>5. Activez le moteur</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>💡 Conseils d'utilisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Communication avec l'IA</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Soyez précis dans vos demandes</li>
                    <li>• Donnez du contexte sur votre domaine</li>
                    <li>• N'hésitez pas à reformuler</li>
                    <li>• Utilisez des exemples concrets</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm">Structuration des modules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Définissez des objectifs clairs</li>
                    <li>• Listez les prérequis nécessaires</li>
                    <li>• Estimez la durée réaliste</li>
                    <li>• Séparez savoirs et savoir-faire</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚠️ Bonnes pratiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Sécurité des données</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Vérifiez vos clés API</li>
                    <li>• Ne partagez pas vos identifiants</li>
                    <li>• Sauvegardez vos contenus</li>
                    <li>• Testez avant production</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm">Performance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Préférez les moteurs locaux pour la vitesse</li>
                    <li>• Surveillez les logs d'erreurs</li>
                    <li>• Limitez la taille des documents</li>
                    <li>• Vérifiez régulièrement les connexions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🚀 Fonctionnalités avancées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Personnalisation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Ajustez les paramètres de génération</li>
                    <li>• Créez des templates personnalisés</li>
                    <li>• Configurez plusieurs moteurs IA</li>
                    <li>• Adaptez le style de cours</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm">Intégration</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Exportez vers vos outils préférés</li>
                    <li>• Utilisez les formats SCORM</li>
                    <li>• Intégrez dans vos LMS</li>
                    <li>• Partagez facilement vos créations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔧 Dépannage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Problèmes courants</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Moteur IA déconnecté → Vérifiez l'état</li>
                    <li>• Génération lente → Changez de moteur</li>
                    <li>• Erreur d'API → Vérifiez les clés</li>
                    <li>• Export échoué → Consultez les logs</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm">Diagnostic</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Consultez l'onglet "État" régulièrement</li>
                    <li>• Vérifiez les logs d'administration</li>
                    <li>• Testez vos moteurs individuellement</li>
                    <li>• Redémarrez en cas de problème</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
