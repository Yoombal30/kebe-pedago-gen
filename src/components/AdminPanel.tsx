import React, { useState } from 'react';
import { Settings, Plus, Trash2, TestTube, Power, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    setActiveEngine 
  } = useAI();
  
  const [isAddEngineOpen, setIsAddEngineOpen] = useState(false);
  const [newEngine, setNewEngine] = useState({
    name: '',
    type: 'local' as 'local' | 'remote',
    model: '',
    endpoint: '',
    port: '11434',
    apiKey: '',
    provider: ''
  });
  const { toast } = useToast();

  const handleAddEngine = () => {
    if (!newEngine.name || !newEngine.model || !newEngine.endpoint) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Validation spéciale pour les moteurs distants
    if (newEngine.type === 'remote' && (!newEngine.apiKey || newEngine.apiKey.trim() === '')) {
      toast({
        title: "Clé API requise",
        description: "Une clé API est obligatoire pour les moteurs distants",
        variant: "destructive"
      });
      return;
    }

    const engineData: Omit<AIEngine, 'id'> = {
      name: newEngine.name,
      type: newEngine.type,
      status: 'inactive',
      config: newEngine.type === 'local' 
        ? {
            model: newEngine.model,
            port: parseInt(newEngine.port),
            endpoint: newEngine.endpoint
          }
        : {
            provider: newEngine.provider,
            apiKey: newEngine.apiKey,
            model: newEngine.model,
            endpoint: newEngine.endpoint
          }
    };

    addEngine(engineData);
    setIsAddEngineOpen(false);
    setNewEngine({
      name: '',
      type: 'local',
      model: '',
      endpoint: '',
      port: '11434',
      apiKey: '',
      provider: ''
    });

    toast({
      title: "Moteur ajouté",
      description: `Le moteur ${newEngine.name} a été ajouté avec succès`
    });
  };

  const handleTestEngine = async (engineId: string) => {
    const success = await testEngine(engineId);
    toast({
      title: success ? "Test réussi" : "Test échoué",
      description: success 
        ? "Le moteur répond correctement" 
        : "Impossible de se connecter au moteur. Vérifiez la configuration et la connectivité.",
      variant: success ? "default" : "destructive"
    });
  };

  const handlePromptUpdate = (prompt: string) => {
    // Ici on pourrait sauvegarder le prompt dans le localStorage ou un service
    localStorage.setItem('coursePrompt', prompt);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Administration</h1>
      </div>

      <Tabs defaultValue="engines" className="space-y-6">
        <TabsList>
          <TabsTrigger value="engines">Moteurs IA</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="logs">Logs système</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="engines" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Moteurs IA disponibles</h2>
              <p className="text-muted-foreground">Gérez vos connexions aux différents moteurs d'IA</p>
            </div>
            
            <Dialog open={isAddEngineOpen} onOpenChange={setIsAddEngineOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un moteur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau moteur IA</DialogTitle>
                  <DialogDescription>
                    Configurez un nouveau moteur d'IA local ou distant
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom du moteur</Label>
                      <Input
                        id="name"
                        value={newEngine.name}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Mon moteur IA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newEngine.type}
                        onValueChange={(value: 'local' | 'remote') => setNewEngine(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="remote">Distant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model">Modèle</Label>
                      <Input
                        id="model"
                        value={newEngine.model}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="llama3.2, mistral-medium..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="endpoint">Point d'accès</Label>
                      <Input
                        id="endpoint"
                        value={newEngine.endpoint}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="http://localhost:11434"
                      />
                    </div>
                  </div>

                  {newEngine.type === 'local' ? (
                    <div>
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        value={newEngine.port}
                        onChange={(e) => setNewEngine(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="11434"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="provider">Fournisseur</Label>
                        <Select
                          value={newEngine.provider}
                          onValueChange={(value) => setNewEngine(prev => ({ ...prev, provider: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mistral">Mistral AI</SelectItem>
                            <SelectItem value="openrouter">OpenRouter</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="huggingface">Hugging Face</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="apiKey">Clé API *</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={newEngine.apiKey}
                          onChange={(e) => setNewEngine(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder="sk-... (obligatoire)"
                        />
                      </div>
                    </div>
                  )}

                  {newEngine.type === 'remote' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        <strong>Important :</strong> Une clé API valide est requise pour les moteurs distants.
                        Assurez-vous d'avoir les bonnes permissions pour le modèle sélectionné.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddEngine} className="flex-1">
                      Ajouter le moteur
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

          <div className="grid gap-4">
            {adminSettings.engines.map((engine) => (
              <Card key={engine.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {activeEngine?.id === engine.id && isConnected ? (
                          <Wifi className="h-4 w-4 text-green-600" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-400" />
                        )}
                        <CardTitle className="text-lg">{engine.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(engine.status)}>
                        {engine.status === 'active' && activeEngine?.id === engine.id ? 'Actif' : 'Inactif'}
                      </Badge>
                      {engine.type === 'local' && <Badge variant="outline">Local</Badge>}
                      {engine.type === 'remote' && <Badge variant="outline">Distant</Badge>}
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
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Modèle:</span> {'config' in engine && 'model' in engine.config ? engine.config.model : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Endpoint:</span> {'config' in engine && 'endpoint' in engine.config ? engine.config.endpoint : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Configuration des prompts</h2>
            <p className="text-muted-foreground">Personnalisez les instructions données aux moteurs IA</p>
          </div>

          <PromptSettings onPromptUpdate={handlePromptUpdate} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Logs système</h2>
            <p className="text-muted-foreground">Historique des événements et erreurs</p>
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
                              {log.timestamp.toLocaleString()}
                            </span>
                            {log.engine && (
                              <Badge variant="outline" className="text-xs">
                                {adminSettings.engines.find(e => e.id === log.engine)?.name || log.engine}
                              </Badge>
                            )}
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

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Configuration générale</h2>
            <p className="text-muted-foreground">Paramètres de l'application</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Statut du système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Moteur actif</span>
                <Badge variant={activeEngine ? "default" : "secondary"}>
                  {activeEngine ? activeEngine.name : 'Aucun'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Connexion</span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Moteurs configurés</span>
                <Badge variant="outline">
                  {adminSettings.engines.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Logs système</span>
                <Badge variant="outline">
                  {adminSettings.logs.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
