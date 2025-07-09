
import React, { useState } from 'react';
import { Settings, Server, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAI } from '@/contexts/AIContext';
import { AIEngine } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const AdminPanel: React.FC = () => {
  const { adminSettings, updateAdminSettings, testEngine } = useAI();
  const [testingEngine, setTestingEngine] = useState<string | null>(null);

  const handleEngineTest = async (engineId: string) => {
    setTestingEngine(engineId);
    try {
      const success = await testEngine(engineId);
      if (success) {
        toast({
          title: "Test réussi",
          description: "Le moteur IA répond correctement",
        });
        
        // Mettre à jour le statut
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

  const setActiveEngine = (engineId: string) => {
    updateAdminSettings({ activeEngine: engineId });
    toast({
      title: "Moteur activé",
      description: `Le moteur ${engineId} est maintenant actif`,
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
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Administration - Moteurs IA</h1>
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
                          value={(engine.config as any).model}
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
                          value={(engine.config as any).port}
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
                          value={(engine.config as any).endpoint}
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
                          value={(engine.config as any).apiKey}
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
                            value={(engine.config as any).model}
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
                            value={(engine.config as any).endpoint}
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
                      onClick={() => setActiveEngine(engine.id)}
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
              <div className="space-y-2">
                {adminSettings.logs.length > 0 ? (
                  adminSettings.logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleString()}
                      </span>
                      <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'}>
                        {log.level}
                      </Badge>
                      <span className="text-sm">{log.message}</span>
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
