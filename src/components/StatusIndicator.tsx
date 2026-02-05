import React from 'react';
import { Wifi, WifiOff, Zap, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

  // Mode sans IA = toujours fonctionnel
  if (!activeEngine || !isConnected) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={cn(
              "flex items-center gap-1.5 cursor-help",
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
              className
            )}
          >
            <Zap className="h-3 w-3" />
            {showText && "Mode robuste"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Application 100% fonctionnelle</p>
            <p className="text-xs text-muted-foreground">
              Génération de cours par analyse structurée des documents.
              L'IA est optionnelle et non-bloquante.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Mode avec IA disponible
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={cn(
              "flex items-center gap-1.5 cursor-help",
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            )}
          >
            <CheckCircle className="h-3 w-3" />
            {showText && "IA active"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Enrichissement IA disponible</p>
            <p className="text-xs text-muted-foreground">
              Le cours est généré par logique déterministe, puis enrichi par l'IA si activée.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
      
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          <div>{activeEngine.name}</div>
          <div className="flex items-center gap-1">
            <span>{activeEngine.config.model}</span>
          </div>
        </div>
      )}
    </div>
  );
};
