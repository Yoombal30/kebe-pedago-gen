import React from 'react';
import { Wifi, WifiOff, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAI } from '@/contexts/AIContext';

interface StatusIndicatorProps {
  className?: string;
  showText?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  className, 
  showText = true 
}) => {
  const { activeEngine, isConnected } = useAI();

  if (!activeEngine) {
    return (
      <Badge variant="secondary" className={cn("flex items-center gap-1", className)}>
        <AlertTriangle className="h-3 w-3" />
        {showText && "Aucun moteur"}
      </Badge>
    );
  }

  const isSimulationMode = activeEngine.config && 
    'endpoint' in activeEngine.config && 
    activeEngine.config.endpoint === 'local://simulation';

  if (isSimulationMode) {
    return (
      <Badge variant="default" className={cn("flex items-center gap-1 bg-blue-100 text-blue-800", className)}>
        <Activity className="h-3 w-3" />
        {showText && "Mode Simulation"}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className={cn("flex items-center gap-1", className)}
    >
      {isConnected ? (
        <>
          <CheckCircle className="h-3 w-3" />
          {showText && "Connecté"}
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          {showText && "Déconnecté"}
        </>
      )}
    </Badge>
  );
};