import React, { useState } from 'react';
import { Settings, Plus, Trash2, TestTube, Power, AlertCircle, CheckCircle, Wifi, WifiOff, Copy, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAI } from '@/contexts/AIContext';
import { useToast } from '@/hooks/use-toast';
import { AIEngine, LogEntry } from '@/types';
import { PromptSettings } from './PromptSettings';

export const AdminPanel: React.FC = () => {
  const { 
    adminSettings, 
    activeEngine, 
    isConnected,
    testEngine, 
    addEngine, 
    removeEngine, 
    setActiveEngine,
    clearLogs
  } = useAI();
  
  const [isAddEngineOpen, setIsAddEngineOpen] = useState(false);
  const [newEngine, setNewEngine] = useState({
    name: '',
    endpoint: '',
    model: '',
    apiKey: '',
    timeout: '60000'
  });
  const { toast } = useToast();

  const handleAddEngine = () => {
    if (!newEngine.name || !newEngine.endpoint || !newEngine.model) {
      toast({
        title: "Champs requis",
        description: "Nom, Endpoint et Modèle sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    const engineData: Omit<AIEngine, 'id'> = {
      name: newEngine.name,
      status: 'inactive',
      config: {
        endpoint: newEngine.endpoint,
        model: newEngine.model,
        apiKey: newEngine.apiKey || undefined,
        timeout: parseInt(newEngine.timeout) || 60000
      }
    };

    addEngine(engineData);
    setIsAddEngineOpen(false);
    setNewEngine({
      name: '',
      endpoint: '',
      model: '',
      apiKey: '',
      timeout: '60000'
    });

    toast({
      title: "Moteur ajouté",
      description: `${newEngine.name} a été ajouté avec succès`
    });
  };

  const handleTestEngine = async (engineId: string) => {
    const success = await testEngine(engineId);
    toast({
      title: success ? "Test réussi ✓" : "Test échoué ✗",
      description: success 
        ? "Le moteur répond correctement" 
        : "Impossible de se connecter. Vérifiez la configuration.",
      variant: success ? "default" : "destructive"
    });
  };

  const handlePromptUpdate = (prompt: string) => {
    localStorage.setItem('coursePrompt', prompt);
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Administration</h1>
      </div>

      <Tabs defaultValue="engines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engines">Moteurs IA</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="help">Aide</TabsTrigger>
        </TabsList>

        <TabsContent value="engines" className="space-y-6">
          {/* Statut actuel */}
          <Card className={isConnected ? "border-green-500/50 bg-green-50/30" : "border-orange-500/50 bg-orange-50/30"}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-orange-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      {activeEngine ? activeEngine.name : 'Aucun moteur actif'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isConnected ? 'Connecté et opérationnel' : 'Non connecté'}
                    </p>
                  </div>
                </div>
                {activeEngine && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEngine(activeEngine.id)}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Tester
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Moteurs configurés</h2>
              <p className="text-muted-foreground">Configuration simplifiée : Endpoint + Modèle + Clé API (optionnel)</p>
            </div>
            
            <Dialog open={isAddEngineOpen} onOpenChange={setIsAddEngineOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un moteur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nouveau moteur IA</DialogTitle>
                  <DialogDescription>
                    Configurez un nouveau moteur avec son API
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du moteur *</Label>
                    <Input
                      id="name"
                      value={newEngine.name}
                      onChange={(e) => setNewEngine(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Mon Ollama Colab"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endpoint">Endpoint API *</Label>
                    <Input
                      id="endpoint"
                      value={newEngine.endpoint}
                      onChange={(e) => setNewEngine(prev => ({ ...prev, endpoint: e.target.value }))}
                      placeholder="Ex: https://xxxx.ngrok-free.app"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL complète du serveur (ngrok, localhost, API cloud...)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="model">Modèle *</Label>
                    <Input
                      id="model"
                      value={newEngine.model}
                      onChange={(e) => setNewEngine(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Ex: llama3.2:latest, gpt-4, mistral-large"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apiKey">Clé API (optionnel)</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={newEngine.apiKey}
                      onChange={(e) => setNewEngine(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-... (laisser vide pour Ollama)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={newEngine.timeout}
                      onChange={(e) => setNewEngine(prev => ({ ...prev, timeout: e.target.value }))}
                      placeholder="60000"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddEngine} className="flex-1">
                      <Zap className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddEngineOpen(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Liste des moteurs */}
          <div className="grid gap-4">
            {adminSettings.engines.map((engine) => (
              <Card key={engine.id} className={activeEngine?.id === engine.id ? "border-primary" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {activeEngine?.id === engine.id && isConnected ? (
                        <Wifi className="h-4 w-4 text-green-600" />
                      ) : activeEngine?.id === engine.id ? (
                        <WifiOff className="h-4 w-4 text-orange-500" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      <CardTitle className="text-lg">{engine.name}</CardTitle>
                      {activeEngine?.id === engine.id && (
                        <Badge className="bg-primary">Actif</Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestEngine(engine.id)}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      
                      {activeEngine?.id === engine.id ? (
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveEngine(engine.id)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEngine(engine.id)}
                        disabled={activeEngine?.id === engine.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Endpoint:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1">
                          {engine.config.endpoint}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(engine.config.endpoint)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Modèle:</span>
                      <p className="mt-1">{engine.config.model}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Clé API:</span>
                      <p className="mt-1">{engine.config.apiKey ? '••••••••' : 'Non requise'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <PromptSettings onPromptUpdate={handlePromptUpdate} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Logs système</h2>
              <p className="text-muted-foreground">Historique des événements</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                clearLogs();
                toast({ title: "Logs supprimés" });
              }}
              disabled={adminSettings.logs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vider
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {adminSettings.logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun log disponible
                    </div>
                  ) : (
                    adminSettings.logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                        <div className="flex-shrink-0 mt-1">
                          {log.level === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                          {log.level === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                          {log.level === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-xs uppercase ${getLogLevelColor(log.level)}`}>
                              {log.level}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm">{log.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guide de configuration</CardTitle>
              <CardDescription>Comment configurer un moteur IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🐪 Ollama (Local ou Colab)</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>Endpoint:</strong> http://localhost:11434 (local) ou votre URL ngrok</li>
                    <li><strong>Modèle:</strong> llama3.2:latest, deepseek-coder:6.7b, mistral:7b...</li>
                    <li><strong>Clé API:</strong> Non requise</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🤖 OpenAI</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>Endpoint:</strong> https://api.openai.com/v1/chat/completions</li>
                    <li><strong>Modèle:</strong> gpt-4-turbo-preview, gpt-3.5-turbo</li>
                    <li><strong>Clé API:</strong> sk-... (requise)</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🌪️ Mistral AI</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>Endpoint:</strong> https://api.mistral.ai/v1/chat/completions</li>
                    <li><strong>Modèle:</strong> mistral-large-latest, mistral-medium</li>
                    <li><strong>Clé API:</strong> Requise</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">⚡ Groq</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>Endpoint:</strong> https://api.groq.com/openai/v1/chat/completions</li>
                    <li><strong>Modèle:</strong> mixtral-8x7b-32768, llama2-70b-4096</li>
                    <li><strong>Clé API:</strong> Requise</li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">💡 Conseils</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Pour Colab + ngrok: utilisez le timeout de 60000ms minimum</li>
                  <li>• Testez toujours la connexion avant utilisation</li>
                  <li>• Les logs vous aident à diagnostiquer les problèmes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
