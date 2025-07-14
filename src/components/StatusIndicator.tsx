
import React from 'react';
import { Wifi, WifiOff, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAI } from '@/contexts/AIContext';

interface StatusIndicatorProps {
  className?: string;
  showText?: boolean;
  showDetails?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  className, 
  showText = true,
  showDetails = false 
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

  const getStatusInfo = () => {
    if (isConnected) {
      return {
        variant: "default" as const,
        icon: CheckCircle,
        text: "Connecté",
        bgColor: "bg-green-100 text-green-800"
      };
    } else {
      return {
        variant: "destructive" as const,
        icon: WifiOff,
        text: "Déconnecté",
        bgColor: "bg-red-100 text-red-800"
      };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Badge 
        variant={status.variant} 
        className={cn("flex items-center gap-1", status.bgColor)}
      >
        <StatusIcon className="h-3 w-3" />
        {showText && status.text}
      </Badge>
      
      {showDetails && activeEngine && (
        <div className="text-xs text-muted-foreground">
          <div>{activeEngine.name}</div>
          <div className="flex items-center gap-1">
            <span>{activeEngine.type === 'local' ? '🏠' : '🌐'}</span>
            {'config' in activeEngine && 'model' in activeEngine.config && (
              <span>{activeEngine.config.model}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
