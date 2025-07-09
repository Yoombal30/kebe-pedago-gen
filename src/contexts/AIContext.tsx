import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatMessage, AIEngine, AdminSettings, LogEntry } from '@/types';
import { aiService, AIResponse } from '@/services/aiService';

interface AIContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  activeEngine: AIEngine | null;
  isConnected: boolean;
  adminSettings: AdminSettings;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  testEngine: (engineId: string) => Promise<boolean>;
  addEngine: (engine: Omit<AIEngine, 'id'>) => void;
  removeEngine: (engineId: string) => void;
  setActiveEngine: (engineId: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

const DEFAULT_ENGINES: AIEngine[] = [
  {
    id: 'ollama-local',
    name: 'Ollama (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'llama3.2',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  {
    id: 'lmstudio-local',
    name: 'LM Studio (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'llama-3.2-3b-instruct',
      port: 1234,
      endpoint: 'http://localhost:1234/v1'
    }
  },
  {
    id: 'mistral-api',
    name: 'Mistral AI',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'mistral',
      apiKey: '',
      model: 'mistral-medium',
      endpoint: 'https://api.mistral.ai/v1/chat/completions'
    }
  },
  {
    id: 'openrouter-api',
    name: 'OpenRouter',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'openrouter',
      apiKey: '',
      model: 'mistralai/mistral-7b-instruct',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions'
    }
  },
  {
    id: 'huggingface-api',
    name: 'Hugging Face',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'huggingface',
      apiKey: '',
      model: 'microsoft/DialoGPT-large',
      endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large'
    }
  }
];

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis le Professeur KEBE, votre assistant IA pédagogique. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngineState] = useState<AIEngine | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    activeEngine: '',
    engines: DEFAULT_ENGINES,
    logs: []
  });
  const [isConnected, setIsConnected] = useState(false);

  const addLog = useCallback((level: LogEntry['level'], message: string, engine?: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      engine
    };
    
    setAdminSettings(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 100) // Garder seulement les 100 derniers logs
    }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      if (!activeEngine) {
        throw new Error('Aucun moteur IA actif configuré');
      }

      addLog('info', `Message envoyé: ${content.substring(0, 50)}...`, activeEngine.id);
      
      const response: AIResponse = await aiService.sendMessage(content);
      
      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '_ai',
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        addLog('info', 'Réponse reçue avec succès', activeEngine.id);
      } else {
        throw new Error(response.error || 'Erreur inconnue');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: `Erreur: ${error instanceof Error ? error.message : 'Une erreur s\'est produite'}`,
        timestamp: new Date(),
        type: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      addLog('error', `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, activeEngine?.id);
    } finally {
      setIsTyping(false);
    }
  }, [activeEngine, addLog]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat effacé. Comment puis-je vous aider ?',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    addLog('info', 'Chat effacé');
  }, [addLog]);

  const updateAdminSettings = useCallback((settings: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // Fonction pour vérifier la connexion du moteur actif
  const checkConnection = useCallback(async () => {
    if (!activeEngine) {
      setIsConnected(false);
      return;
    }

    try {
      const success = await aiService.testEngine(activeEngine);
      setIsConnected(success);
      
      if (success) {
        addLog('info', `Connexion vérifiée pour ${activeEngine.name}`, activeEngine.id);
      } else {
        addLog('warning', `Connexion échouée pour ${activeEngine.name}`, activeEngine.id);
      }
    } catch (error) {
      setIsConnected(false);
      addLog('error', `Erreur de connexion pour ${activeEngine.name}`, activeEngine.id);
    }
  }, [activeEngine, addLog]);

  const testEngine = useCallback(async (engineId: string): Promise<boolean> => {
    const engine = adminSettings.engines.find(e => e.id === engineId);
    if (!engine) return false;

    addLog('info', `Test du moteur ${engine.name}`, engineId);
    
    try {
      const success = await aiService.testEngine(engine);
      
      if (success) {
        addLog('info', `Test réussi pour ${engine.name}`, engineId);
        // Si c'est le moteur actif, mettre à jour le statut de connexion
        if (activeEngine?.id === engineId) {
          setIsConnected(true);
        }
      } else {
        addLog('error', `Test échoué pour ${engine.name}`, engineId);
        // Si c'est le moteur actif, mettre à jour le statut de connexion
        if (activeEngine?.id === engineId) {
          setIsConnected(false);
        }
      }
      
      return success;
    } catch (error) {
      addLog('error', `Erreur test ${engine.name}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, engineId);
      // Si c'est le moteur actif, mettre à jour le statut de connexion
      if (activeEngine?.id === engineId) {
        setIsConnected(false);
      }
      return false;
    }
  }, [adminSettings.engines, activeEngine, addLog]);

  const addEngine = useCallback((engineData: Omit<AIEngine, 'id'>) => {
    const newEngine: AIEngine = {
      ...engineData,
      id: `engine-${Date.now()}`,
      status: 'inactive'
    };
    
    setAdminSettings(prev => ({
      ...prev,
      engines: [...prev.engines, newEngine]
    }));
    
    addLog('info', `Nouveau moteur ajouté: ${newEngine.name}`, newEngine.id);
  }, [addLog]);

  const removeEngine = useCallback((engineId: string) => {
    const engine = adminSettings.engines.find(e => e.id === engineId);
    if (!engine) return;

    setAdminSettings(prev => ({
      ...prev,
      engines: prev.engines.filter(e => e.id !== engineId),
      activeEngine: prev.activeEngine === engineId ? '' : prev.activeEngine
    }));

    if (activeEngine?.id === engineId) {
      setActiveEngineState(null);
      aiService.setActiveEngine(null as any);
    }

    addLog('info', `Moteur supprimé: ${engine.name}`, engineId);
  }, [adminSettings.engines, activeEngine, addLog]);

  const setActiveEngine = useCallback((engineId: string) => {
    const engine = adminSettings.engines.find(e => e.id === engineId);
    if (!engine) return;

    setActiveEngineState(engine);
    aiService.setActiveEngine(engine);
    
    setAdminSettings(prev => ({
      ...prev,
      activeEngine: engineId
    }));

    addLog('info', `Moteur activé: ${engine.name}`, engineId);
    
    // Vérifier la connexion du nouveau moteur actif
    checkConnection();
  }, [adminSettings.engines, addLog, checkConnection]);

  // Vérifier la connexion périodiquement
  useEffect(() => {
    if (activeEngine) {
      checkConnection();
      
      // Vérifier la connexion toutes les 30 secondes
      const interval = setInterval(checkConnection, 30000);
      return () => clearInterval(interval);
    } else {
      setIsConnected(false);
    }
  }, [activeEngine, checkConnection]);

  // Initialiser le moteur actif au démarrage
  useEffect(() => {
    if (adminSettings.activeEngine && !activeEngine) {
      const engine = adminSettings.engines.find(e => e.id === adminSettings.activeEngine);
      if (engine) {
        setActiveEngineState(engine);
        aiService.setActiveEngine(engine);
      }
    }
  }, [adminSettings.activeEngine, adminSettings.engines, activeEngine]);

  return (
    <AIContext.Provider value={{
      messages,
      isTyping,
      activeEngine,
      isConnected,
      adminSettings,
      sendMessage,
      clearChat,
      updateAdminSettings,
      testEngine,
      addEngine,
      removeEngine,
      setActiveEngine
    }}>
      {children}
    </AIContext.Provider>
  );
};
