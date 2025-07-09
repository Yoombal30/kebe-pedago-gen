
import React, { useState } from 'react';
import { Settings, Server, Zap, AlertCircle, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAI } from '@/contexts/AIContext';
import { AIEngine, LocalAIConfig, RemoteAIConfig } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const AdminPanel: React.FC = () => {
  const { adminSettings, testEngine, addEngine, removeEngine, setActiveEngine, updateAdminSettings } = useAI();
  const [testingEngine, setTestingEngine] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEngine, setNewEngine] = useState({
    name: '',
    type: 'local' as 'local' | 'remote',
    localConfig: {
      model: '',
      port: 11434,
      endpoint: ''
    },
    remoteConfig: {
      provider: 'mistral',
      apiKey: '',
      model: '',
      endpoint: ''
    }
  });

  const handleEngineTest = async (engineId: string) => {
    setTestingEngine(engineId);
    try {
      const success = await testEngine(engineId);
      if (success) {
        toast({
          title: "Test réussi",
          description: "Le moteur IA répond correctement",
        });
        
        const updatedEngines = adminSettings.engines.map(engine =>
          engine.id === engineId ? { ...engine, status: 'active' as const } : engine
        );
        updateAdminSettings({ engines: updatedEngines });
      } else {
        toast({
          title: "Test échoué",
          description: "Le moteur IA ne répond pas",
          variant: "destructive",
        });
        
        const updatedEngines = adminSettings.engines.map(engine =>
          engine.id === engineId ? { ...engine, status: 'error' as const } : engine
        );
        updateAdminSettings({ engines: updatedEngines });
      }
    } catch (error) {
      toast({
        title: "Erreur de test",
        description: "Impossible de tester le moteur",
        variant: "destructive",
      });
    } finally {
      setTestingEngine(null);
    }
  };

  const updateEngineConfig = (engineId: string, config: any) => {
    const updatedEngines = adminSettings.engines.map(engine =>
      engine.id === engineId ? { ...engine, config } : engine
    );
    updateAdminSettings({ engines: updatedEngines });
  };

  const handleSetActiveEngine = (engineId: string) => {
    setActiveEngine(engineId);
    toast({
      title: "Moteur activé",
      description: `Le moteur est maintenant actif`,
    });
  };

  const handleAddEngine = () => {
    if (!newEngine.name) {
      toast({
        title: "Erreur",
        description: "Le nom du moteur est requis",
        variant: "destructive",
      });
      return;
    }

    const engineConfig = newEngine.type === 'local' ? newEngine.localConfig : newEngine.remoteConfig;
    
    addEngine({
      name: newEngine.name,
      type: newEngine.type,
      status: 'inactive',
      config: engineConfig
    });

    setNewEngine({
      name: '',
      type: 'local',
      localConfig: { model: '', port: 11434, endpoint: '' },
      remoteConfig: { provider: 'mistral', apiKey: '', model: '', endpoint: '' }
    });
    setShowAddDialog(false);
    
    toast({
      title: "Moteur ajouté",
      description: "Le nouveau moteur a été ajouté avec succès",
    });
  };

  const handleRemoveEngine = (engineId: string) => {
    removeEngine(engineId);
    toast({
      title: "Moteur supprimé",
      description: "Le moteur a été supprimé",
    });
  };

  const getStatusIcon = (status: AIEngine['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: AIEngine['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Administration - Moteurs IA</h1>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                Configurez un nouveau moteur IA local ou distant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="engine-name">Nom du moteur</Label>
                <Input
                  id="engine-name"
                  value={newEngine.name}
                  onChange={(e) => setNewEngine(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Mon IA personnalisée"
                />
              </div>
              
              <div>
                <Label htmlFor="engine-type">Type</Label>
                <Select value={newEngine.type} onValueChange={(value: 'local' | 'remote') => 
                  setNewEngine(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="remote">Distant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newEngine.type === 'local' ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="local-model">Modèle</Label>
                    <Input
                      id="local-model"
                      value={newEngine.localConfig.model}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        localConfig: { ...prev.localConfig, model: e.target.value }
                      }))}
                      placeholder="Ex: llama3.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="local-port">Port</Label>
                    <Input
                      id="local-port"
                      type="number"
                      value={newEngine.localConfig.port}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        localConfig: { ...prev.localConfig, port: parseInt(e.target.value) || 11434 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="local-endpoint">Endpoint</Label>
                    <Input
                      id="local-endpoint"
                      value={newEngine.localConfig.endpoint}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        localConfig: { ...prev.localConfig, endpoint: e.target.value }
                      }))}
                      placeholder="Ex: http://localhost:11434"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="remote-provider">Provider</Label>
                    <Select 
                      value={newEngine.remoteConfig.provider} 
                      onValueChange={(value) => setNewEngine(prev => ({
                        ...prev,
                        remoteConfig: { ...prev.remoteConfig, provider: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mistral">Mistral AI</SelectItem>
                        <SelectItem value="openrouter">OpenRouter</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="remote-apikey">Clé API</Label>
                    <Input
                      id="remote-apikey"
                      type="password"
                      value={newEngine.remoteConfig.apiKey}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        remoteConfig: { ...prev.remoteConfig, apiKey: e.target.value }
                      }))}
                      placeholder="Votre clé API"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remote-model">Modèle</Label>
                    <Input
                      id="remote-model"
                      value={newEngine.remoteConfig.model}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        remoteConfig: { ...prev.remoteConfig, model: e.target.value }
                      }))}
                      placeholder="Ex: mistral-medium"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remote-endpoint">Endpoint</Label>
                    <Input
                      id="remote-endpoint"
                      value={newEngine.remoteConfig.endpoint}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        remoteConfig: { ...prev.remoteConfig, endpoint: e.target.value }
                      }))}
                      placeholder="URL de l'API"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddEngine}>
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="engines" className="space-y-6">
        <TabsList>
          <TabsTrigger value="engines">Moteurs IA</TabsTrigger>
          <TabsTrigger value="logs">Logs & Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="engines" className="space-y-6">
          <div className="grid gap-6">
            {adminSettings.engines.map((engine) => (
              <Card key={engine.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{engine.name}</CardTitle>
                        <CardDescription>
                          Type: {engine.type === 'local' ? 'Local' : 'Distant'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(engine.status)}>
                        {getStatusIcon(engine.status)}
                        {engine.status}
                      </Badge>
                      {adminSettings.activeEngine === engine.id && (
                        <Badge variant="default">Actif</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEngine(engine.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {engine.type === 'local' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`model-${engine.id}`}>Modèle</Label>
                        <Input
                          id={`model-${engine.id}`}
                          value={(engine.config as LocalAIConfig).model}
                          onChange={(e) => updateEngineConfig(engine.id, {
                            ...engine.config,
                            model: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`port-${engine.id}`}>Port</Label>
                        <Input
                          id={`port-${engine.id}`}
                          type="number"
                          value={(engine.config as LocalAIConfig).port}
                          onChange={(e) => updateEngineConfig(engine.id, {
                            ...engine.config,
                            port: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`endpoint-${engine.id}`}>Endpoint</Label>
                        <Input
                          id={`endpoint-${engine.id}`}
                          value={(engine.config as LocalAIConfig).endpoint}
                          onChange={(e) => updateEngineConfig(engine.id, {
                            ...engine.config,
                            endpoint: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor={`apikey-${engine.id}`}>Clé API</Label>
                        <Input
                          id={`apikey-${engine.id}`}
                          type="password"
                          value={(engine.config as RemoteAIConfig).apiKey}
                          onChange={(e) => updateEngineConfig(engine.id, {
                            ...engine.config,
                            apiKey: e.target.value
                          })}
                          placeholder="Saisissez votre clé API..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`model-${engine.id}`}>Modèle</Label>
                          <Input
                            id={`model-${engine.id}`}
                            value={(engine.config as RemoteAIConfig).model}
                            onChange={(e) => updateEngineConfig(engine.id, {
                              ...engine.config,
                              model: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`endpoint-${engine.id}`}>Endpoint</Label>
                          <Input
                            id={`endpoint-${engine.id}`}
                            value={(engine.config as RemoteAIConfig).endpoint}
                            onChange={(e) => updateEngineConfig(engine.id, {
                              ...engine.config,
                              endpoint: e.target.value
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleEngineTest(engine.id)}
                      disabled={testingEngine === engine.id}
                      variant="outline"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {testingEngine === engine.id ? 'Test en cours...' : 'Tester'}
                    </Button>
                    
                    <Button
                      onClick={() => handleSetActiveEngine(engine.id)}
                      disabled={adminSettings.activeEngine === engine.id}
                      variant={adminSettings.activeEngine === engine.id ? "default" : "secondary"}
                    >
                      {adminSettings.activeEngine === engine.id ? 'Moteur actif' : 'Activer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs du système</CardTitle>
              <CardDescription>
                Historique des événements et état de santé des moteurs IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adminSettings.logs.length > 0 ? (
                  adminSettings.logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                      <span className="text-xs text-muted-foreground min-w-[120px]">
                        {log.timestamp.toLocaleString()}
                      </span>
                      <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                        {log.level}
                      </Badge>
                      {log.engine && (
                        <Badge variant="outline" className="text-xs">
                          {log.engine}
                        </Badge>
                      )}
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun log disponible pour le moment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
