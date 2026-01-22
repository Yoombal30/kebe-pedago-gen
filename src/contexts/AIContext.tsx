import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatMessage, AIEngine, AdminSettings, LogEntry, AIEngineConfig } from '@/types';
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
  clearLogs: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

// Configuration par défaut simplifiée - uniquement endpoint + model + apiKey optionnel
const DEFAULT_ENGINES: AIEngine[] = [
  {
    id: 'ollama-colab',
    name: 'Ollama Colab (DeepSeek)',
    status: 'active',
    config: {
      endpoint: 'https://427fce534125.ngrok-free.app',
      model: 'deepseek-coder:6.7b',
      timeout: 60000
    }
  },
  {
    id: 'ollama-local',
    name: 'Ollama Local',
    status: 'inactive',
    config: {
      endpoint: 'http://localhost:11434',
      model: 'llama3.2:latest',
      timeout: 30000
    }
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    status: 'inactive',
    config: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4-turbo-preview',
      apiKey: '',
      timeout: 30000
    }
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    status: 'inactive',
    config: {
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
      model: 'mistral-large-latest',
      apiKey: '',
      timeout: 30000
    }
  },
  {
    id: 'groq',
    name: 'Groq (Mixtral)',
    status: 'inactive',
    config: {
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'mixtral-8x7b-32768',
      apiKey: '',
      timeout: 30000
    }
  }
];

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 **Bonjour ! Je suis le Professeur KEBE**\n\nVotre assistant IA pédagogique spécialisé dans la création de formations.\n\n**Mes capacités :**\n- 📚 Création de modules de formation\n- 🎯 Génération de cours complets\n- 📝 Conception de QCM et évaluations\n- 📄 Export Word et PowerPoint\n\n💡 *Configurez votre moteur IA dans l\'onglet Administration pour commencer.*',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngineState] = useState<AIEngine | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('professeur-kebe-admin-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          engines: parsed.engines?.length > 0 ? parsed.engines : DEFAULT_ENGINES,
          logs: parsed.logs || [],
          activeEngine: parsed.activeEngine || 'ollama-colab'
        };
      } catch {
        return {
          activeEngine: 'ollama-colab',
          engines: DEFAULT_ENGINES,
          logs: []
        };
      }
    }
    return {
      activeEngine: 'ollama-colab',
      engines: DEFAULT_ENGINES,
      logs: []
    };
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
      logs: [newLog, ...prev.logs].slice(0, 100)
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setAdminSettings(prev => ({
      ...prev,
      logs: []
    }));
    addLog('info', 'Logs supprimés');
  }, [addLog]);

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
        content: `❌ **Erreur**: ${error instanceof Error ? error.message : 'Une erreur s\'est produite'}\n\n💡 Vérifiez la configuration du moteur IA dans l'onglet Administration.`,
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
        content: '🔄 **Chat réinitialisé**\n\nJe suis le Professeur KEBE, prêt pour une nouvelle session !\n\nComment puis-je vous aider avec vos projets pédagogiques ?',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    addLog('info', 'Chat effacé');
  }, [addLog]);

  const updateAdminSettings = useCallback((settings: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const checkConnection = useCallback(async () => {
    if (!activeEngine) {
      setIsConnected(false);
      return;
    }

    try {
      const success = await aiService.testEngine(activeEngine);
      setIsConnected(success);
      
      if (success) {
        addLog('info', `Connexion vérifiée: ${activeEngine.name}`, activeEngine.id);
      } else {
        addLog('warning', `Connexion échouée: ${activeEngine.name}`, activeEngine.id);
      }
    } catch (error) {
      setIsConnected(false);
      addLog('error', `Erreur connexion: ${activeEngine.name}`, activeEngine.id);
    }
  }, [activeEngine, addLog]);

  const testEngine = useCallback(async (engineId: string): Promise<boolean> => {
    const engine = adminSettings.engines.find(e => e.id === engineId);
    if (!engine) return false;

    addLog('info', `Test du moteur ${engine.name}`, engineId);
    
    try {
      const success = await aiService.testEngine(engine);
      
      if (success) {
        addLog('info', `Test réussi: ${engine.name}`, engineId);
        if (activeEngine?.id === engineId) {
          setIsConnected(true);
        }
      } else {
        addLog('error', `Test échoué: ${engine.name}`, engineId);
        if (activeEngine?.id === engineId) {
          setIsConnected(false);
        }
      }
      
      return success;
    } catch (error) {
      addLog('error', `Erreur test ${engine.name}: ${error instanceof Error ? error.message : 'Erreur'}`, engineId);
      if (activeEngine?.id === engineId) {
        setIsConnected(false);
      }
      return false;
    }
  }, [adminSettings.engines, activeEngine, addLog]);

  const addEngine = useCallback((engineData: Omit<AIEngine, 'id'>) => {
    const newEngine: AIEngine = {
      ...engineData,
      id: `engine-${Date.now()}`
    };

    setAdminSettings(prev => ({
      ...prev,
      engines: [...prev.engines, newEngine]
    }));

    addLog('info', `Moteur ajouté: ${newEngine.name}`);
  }, [addLog]);

  const removeEngine = useCallback((engineId: string) => {
    const engine = adminSettings.engines.find(e => e.id === engineId);
    
    setAdminSettings(prev => ({
      ...prev,
      engines: prev.engines.filter(e => e.id !== engineId)
    }));

    if (engine) {
      addLog('info', `Moteur supprimé: ${engine.name}`);
    }
  }, [adminSettings.engines, addLog]);

  const setActiveEngine = useCallback((engineId: string) => {
    const engine = adminSettings.engines.find(e => e.id === engineId);
    if (engine) {
      // Mettre à jour tous les statuts
      setAdminSettings(prev => ({
        ...prev,
        activeEngine: engineId,
        engines: prev.engines.map(e => ({
          ...e,
          status: e.id === engineId ? 'active' : 'inactive' as const
        }))
      }));

      setActiveEngineState(engine);
      aiService.setActiveEngine(engine);
      addLog('info', `Moteur activé: ${engine.name}`, engineId);
      
      // Vérifier la connexion
      setTimeout(() => checkConnection(), 500);
    }
  }, [adminSettings.engines, addLog, checkConnection]);

  // Sauvegarder les paramètres
  useEffect(() => {
    localStorage.setItem('professeur-kebe-admin-v2', JSON.stringify(adminSettings));
  }, [adminSettings]);

  // Initialiser le moteur actif
  useEffect(() => {
    const savedEngineId = adminSettings.activeEngine;
    const engine = adminSettings.engines.find(e => e.id === savedEngineId);
    
    if (engine) {
      setActiveEngineState(engine);
      aiService.setActiveEngine(engine);
    } else if (adminSettings.engines.length > 0) {
      const firstEngine = adminSettings.engines[0];
      setActiveEngineState(firstEngine);
      aiService.setActiveEngine(firstEngine);
    }
  }, []);

  // Vérifier la connexion périodiquement
  useEffect(() => {
    if (activeEngine) {
      checkConnection();
      const interval = setInterval(checkConnection, 60000);
      return () => clearInterval(interval);
    }
  }, [activeEngine, checkConnection]);

  return (
    <AIContext.Provider
      value={{
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
        setActiveEngine,
        clearLogs
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
