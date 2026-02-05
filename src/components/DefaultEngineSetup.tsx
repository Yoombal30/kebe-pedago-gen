import React, { useEffect } from 'react';
import { CheckCircle, Wifi } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/contexts/AIContext';

export const DefaultEngineSetup: React.FC = () => {
  const { activeEngine, isConnected, adminSettings } = useAI();

  const defaultEngine = adminSettings.engines.find(e => e.id === 'huggingface-free');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          {isConnected ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Wifi className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <CardTitle>Assistant IA Configuré</CardTitle>
        <CardDescription>
          Votre assistant Professeur KEBE est prêt à vous aider
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Moteur actif:</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {defaultEngine?.name || 'Aucun'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut:</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </Badge>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {isConnected ? (
            "✅ L'assistant est prêt pour la génération de cours et les réponses aux questions"
          ) : (
            "⚠️ Connexion en cours... L'assistant sera disponible dans quelques instants"
          )}
        </div>
      </CardContent>
    </Card>
  );
};