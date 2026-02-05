import React, { useState } from 'react';
import { Cloud, Wifi, Settings2, Check, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAI } from '@/contexts/AIContext';
import { CLOUD_AI_MODELS, CloudAIModel } from '@/services/cloudAIService';
import { useToast } from '@/hooks/use-toast';

export const SimpleEngineConfig: React.FC = () => {
  const { 
    activeEngine, 
    isConnected, 
    adminSettings, 
    setActiveEngine, 
    testEngine,
    addEngine,
    removeEngine,
    updateAdminSettings
  } = useAI();
  
  const { toast } = useToast();
  const [testing, setTesting] = useState<string | null>(null);
  const [cloudModel, setCloudModel] = useState<CloudAIModel>('google/gemini-3-flash-preview');
  
  // Formulaire nouveau moteur
  const [newEngine, setNewEngine] = useState({
    name: '',
    endpoint: '',
    model: '',
    apiKey: ''
  });

  const handleTestEngine = async (engineId: string) => {
    setTesting(engineId);
    try {
      const success = await testEngine(engineId);
      toast({
        title: success ? '✅ Connexion réussie' : '❌ Connexion échouée',
        description: success 
          ? 'Le moteur IA répond correctement' 
          : 'Impossible de se connecter au moteur',
        variant: success ? 'default' : 'destructive'
      });
    } finally {
      setTesting(null);
    }
  };

  const handleSelectCloudEngine = () => {
    // Activer le moteur Cloud avec le modèle sélectionné
    const cloudEngine = adminSettings.engines.find(e => e.id === 'lovable-cloud');
    if (cloudEngine) {
      setActiveEngine('lovable-cloud');
    } else {
      // Créer le moteur Cloud s'il n'existe pas
      addEngine({
        name: `Lovable Cloud (${CLOUD_AI_MODELS.find(m => m.id === cloudModel)?.name || cloudModel})`,
        status: 'active',
        config: {
          endpoint: 'cloud',
          model: cloudModel,
          timeout: 60000
        }
      });
    }
    toast({
      title: '☁️ Lovable Cloud activé',
      description: `Modèle: ${CLOUD_AI_MODELS.find(m => m.id === cloudModel)?.name || cloudModel}`
    });
  };

  const handleAddEngine = () => {
    if (!newEngine.name || !newEngine.endpoint || !newEngine.model) {
      toast({
        title: 'Champs requis',
        description: 'Nom, endpoint et modèle sont obligatoires',
        variant: 'destructive'
      });
      return;
    }

    addEngine({
      name: newEngine.name,
      status: 'inactive',
      config: {
        endpoint: newEngine.endpoint,
        model: newEngine.model,
        apiKey: newEngine.apiKey || undefined,
        timeout: 60000
      }
    });

    setNewEngine({ name: '', endpoint: '', model: '', apiKey: '' });
    toast({
      title: '✅ Moteur ajouté',
      description: `${newEngine.name} a été ajouté à la liste`
    });
  };

  const handleRemoveEngine = (engineId: string) => {
    const engine = adminSettings.engines.find(e => e.id === engineId);
    if (engine) {
      removeEngine(engineId);
      toast({
        title: 'Moteur supprimé',
        description: `${engine.name} a été retiré`
      });
    }
  };

  const isCloudActive = activeEngine?.config.endpoint === 'cloud';
  
  // Filtrer les moteurs non-cloud
  const customEngines = adminSettings.engines.filter(e => e.config.endpoint !== 'cloud');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Configuration IA Simplifiée
        </CardTitle>
        <CardDescription>
          Choisissez entre Lovable Cloud (recommandé) ou configurez vos propres moteurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cloud" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Lovable Cloud
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Moteurs personnalisés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-4 mt-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Lovable Cloud AI</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accès direct aux meilleurs modèles IA (GPT-5, Gemini Pro) sans configuration.
                    Prêt à l'emploi avec clé API préconfigurée.
                  </p>
                </div>
                {isCloudActive && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Check className="w-3 h-3 mr-1" /> Actif
                  </Badge>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <Label>Modèle IA</Label>
                <Select value={cloudModel} onValueChange={(v) => setCloudModel(v as CloudAIModel)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOUD_AI_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleSelectCloudEngine}
                  className="w-full"
                  variant={isCloudActive ? "secondary" : "default"}
                >
                  {isCloudActive ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Cloud activé
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 mr-2" />
                      Activer Lovable Cloud
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
              💡 <strong>Avantages Cloud:</strong> Aucune configuration requise, modèles premium, 
              mises à jour automatiques, pas de clé API à gérer.
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            {/* Moteurs existants */}
            {customEngines.length > 0 && (
              <div className="space-y-2">
                <Label>Moteurs configurés</Label>
                {customEngines.map((engine) => (
                  <div 
                    key={engine.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      activeEngine?.id === engine.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{engine.name}</span>
                        {activeEngine?.id === engine.id && (
                          <Badge variant="secondary" className="text-xs">Actif</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {engine.config.model} • {engine.config.endpoint.substring(0, 40)}...
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestEngine(engine.id)}
                        disabled={testing === engine.id}
                      >
                        {testing === engine.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Tester'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={activeEngine?.id === engine.id ? "secondary" : "default"}
                        onClick={() => setActiveEngine(engine.id)}
                      >
                        {activeEngine?.id === engine.id ? 'Actif' : 'Activer'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveEngine(engine.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter un nouveau moteur */}
            <Accordion type="single" collapsible>
              <AccordionItem value="add-engine">
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter un moteur personnalisé
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="engine-name">Nom du moteur</Label>
                      <Input
                        id="engine-name"
                        placeholder="Ex: Mon Ollama Local"
                        value={newEngine.name}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="engine-endpoint">Endpoint API</Label>
                      <Input
                        id="engine-endpoint"
                        placeholder="Ex: http://localhost:11434 ou https://xxx.ngrok.io"
                        value={newEngine.endpoint}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, endpoint: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="engine-model">Modèle</Label>
                      <Input
                        id="engine-model"
                        placeholder="Ex: llama3.2:latest, deepseek-coder:6.7b"
                        value={newEngine.model}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, model: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="engine-apikey">Clé API (optionnel)</Label>
                      <Input
                        id="engine-apikey"
                        type="password"
                        placeholder="sk-... (laisser vide si non requis)"
                        value={newEngine.apiKey}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleAddEngine} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter ce moteur
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground p-3 bg-muted rounded space-y-1">
                    <p><strong>Exemples de configuration:</strong></p>
                    <p>• <strong>Ollama local:</strong> http://localhost:11434 + llama3.2:latest</p>
                    <p>• <strong>Ollama Colab:</strong> https://xxx.ngrok.io + deepseek-coder:6.7b</p>
                    <p>• <strong>OpenAI:</strong> https://api.openai.com/v1/chat/completions + gpt-4-turbo</p>
                    <p>• <strong>Mistral:</strong> https://api.mistral.ai/v1/chat/completions + mistral-large-latest</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        {/* Statut actuel */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Moteur actif:</span>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {activeEngine?.name || 'Aucun'}
              </Badge>
              {isConnected ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
