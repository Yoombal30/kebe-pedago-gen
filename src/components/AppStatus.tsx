
import React from 'react';
import { Info, CheckCircle, AlertCircle, XCircle, Wifi, WifiOff, Bot, Database, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAI } from '@/contexts/AIContext';

export const AppStatus: React.FC = () => {
  const { activeEngine, isConnected, adminSettings } = useAI();

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getConnectionBadge = (connected: boolean) => {
    return (
      <Badge variant={connected ? "default" : "destructive"} className="ml-2">
        {connected ? 'Connecté' : 'Déconnecté'}
      </Badge>
    );
  };

  const calculateSystemHealth = () => {
    let score = 0;
    if (activeEngine) score += 40;
    if (isConnected) score += 40;
    if (adminSettings.engines.length > 0) score += 20;
    return score;
  };

  const systemHealth = calculateSystemHealth();
  const recentErrors = adminSettings.logs.filter(log => log.level === 'error').slice(0, 5);
  const recentLogs = adminSettings.logs.slice(0, 10);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">État du système</h1>
      </div>

      {/* Vue d'ensemble du système */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Moteur IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {activeEngine ? activeEngine.name : 'Aucun'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeEngine ? `Type: ${activeEngine.type}` : 'Non configuré'}
                </p>
              </div>
              {getStatusIcon(!!activeEngine)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              Connexion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {isConnected ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  État de la connexion IA
                </p>
              </div>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Moteurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {adminSettings.engines.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Moteurs configurés
                </p>
              </div>
              <Database className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Santé système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{systemHealth}%</span>
                {systemHealth >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : systemHealth >= 60 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <Progress value={systemHealth} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails des services */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Services système</CardTitle>
            <CardDescription>État des différents composants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bot className="h-4 w-4" />
                <span>Assistant IA</span>
              </div>
              {getConnectionBadge(isConnected)}
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4" />
                <span>Base de données locale</span>
              </div>
              <Badge variant="default">Actif</Badge>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4" />
                <span>Génération de contenu</span>
              </div>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Disponible' : 'Indisponible'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration active</CardTitle>
            <CardDescription>Paramètres actuels du système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Moteur actif:</span>
              <span className="text-sm">{activeEngine?.name || 'Aucun'}</span>
            </div>
            
            {activeEngine && 'config' in activeEngine && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Modèle:</span>
                  <span className="text-sm">{'model' in activeEngine.config ? activeEngine.config.model : 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <span className="text-sm capitalize">{activeEngine.type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Endpoint:</span>
                  <span className="text-sm text-muted-foreground">
                    {'endpoint' in activeEngine.config ? activeEngine.config.endpoint : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs récents */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Erreurs récentes
            </CardTitle>
            <CardDescription>Les 5 dernières erreurs du système</CardDescription>
          </CardHeader>
          <CardContent>
            {recentErrors.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                Aucune erreur récente
              </div>
            ) : (
              <div className="space-y-3">
                {recentErrors.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Les 10 derniers événements du système</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Aucune activité récente
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {log.level === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      {log.level === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      {log.level === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
