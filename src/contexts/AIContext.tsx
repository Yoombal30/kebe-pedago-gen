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

const DEFAULT_ENGINES: AIEngine[] = [
  {
    id: 'demo-ai',
    name: 'Assistant IA (Demo)',
    type: 'remote',
    status: 'active',
    config: {
      provider: 'demo',
      apiKey: '',
      model: 'demo-model',
      endpoint: 'https://httpbin.org/json'
    }
  },
  // Colab/Ngrok Engines
  {
    id: 'professeur-kebe-colab',
    name: 'Professeur KEBE (Colab)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'internlm2:latest',
      port: 11434,
      endpoint: 'https://64a78917a92d.ngrok-free.app'
    }
  },
  {
    id: 'deepseek-colab',
    name: 'DeepSeek Coder (Colab)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'deepseek-coder:6.7b',
      port: 11434,
      endpoint: 'https://64a78917a92d.ngrok-free.app'
    }
  },
  {
    id: 'llama3-colab',
    name: 'Llama 3.2 (Colab)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'llama3.2:latest',
      port: 11434,
      endpoint: 'https://64a78917a92d.ngrok-free.app'
    }
  },
  {
    id: 'codellama-colab',
    name: 'Code Llama (Colab)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'codellama:7b',
      port: 11434,
      endpoint: 'https://64a78917a92d.ngrok-free.app'
    }
  },
  {
    id: 'mistral-colab',
    name: 'Mistral 7B (Colab)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'mistral:7b',
      port: 11434,
      endpoint: 'https://64a78917a92d.ngrok-free.app'
    }
  },
  // Local Ollama Engines
  {
    id: 'ollama-llama3',
    name: 'Ollama - Llama 3.2 (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'llama3.2:latest',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  {
    id: 'ollama-deepseek',
    name: 'Ollama - DeepSeek Coder (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'deepseek-coder:6.7b',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  {
    id: 'ollama-codellama',
    name: 'Ollama - Code Llama (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'codellama:7b',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  {
    id: 'ollama-mistral',
    name: 'Ollama - Mistral 7B (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'mistral:7b',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  {
    id: 'ollama-phi3',
    name: 'Ollama - Phi-3 (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'phi3:latest',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  {
    id: 'ollama-gemma',
    name: 'Ollama - Gemma 2B (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'gemma:2b',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  {
    id: 'ollama-qwen',
    name: 'Ollama - Qwen 2.5 (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'qwen2.5:7b',
      port: 11434,
      endpoint: 'http://localhost:11434'
    }
  },
  // Other Local Providers
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
    id: 'textgen-webui',
    name: 'Text Generation WebUI (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'local-model',
      port: 5000,
      endpoint: 'http://localhost:5000/v1'
    }
  },
  {
    id: 'koboldcpp-local',
    name: 'KoboldCpp (Local)',
    type: 'local',
    status: 'inactive',
    config: {
      model: 'kobold-model',
      port: 5001,
      endpoint: 'http://localhost:5001/v1'
    }
  },
  // Remote API Providers
  {
    id: 'openai-api',
    name: 'OpenAI GPT',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      endpoint: 'https://api.openai.com/v1/chat/completions'
    }
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic Claude',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'anthropic',
      apiKey: '',
      model: 'claude-3-haiku-20240307',
      endpoint: 'https://api.anthropic.com/v1/messages'
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
    id: 'groq-api',
    name: 'Groq',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'groq',
      apiKey: '',
      model: 'mixtral-8x7b-32768',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions'
    }
  },
  {
    id: 'together-api',
    name: 'Together AI',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'together',
      apiKey: '',
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      endpoint: 'https://api.together.xyz/v1/chat/completions'
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
  },
  {
    id: 'perplexity-api',
    name: 'Perplexity AI',
    type: 'remote',
    status: 'inactive',
    config: {
      provider: 'perplexity',
      apiKey: '',
      model: 'llama-3.1-sonar-small-128k-online',
      endpoint: 'https://api.perplexity.ai/chat/completions'
    }
  }
];

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis le Professeur KEBE, votre assistant IA pédagogique.\n\n🎯 **Prêt à travailler ensemble !**\n\nJe peux vous aider à :\n- Créer des modules de formation\n- Générer des cours complets\n- Concevoir des QCM\n- Structurer vos contenus pédagogiques\n\nComment puis-je vous assister aujourd\'hui ?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngineState] = useState<AIEngine | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('professeur-kebe-admin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          engines: parsed.engines?.length > 0 ? parsed.engines : DEFAULT_ENGINES,
          logs: parsed.logs || [],
          activeEngine: parsed.activeEngine || 'demo-ai'
        };
      } catch {
        return {
          activeEngine: 'demo-ai',
          engines: DEFAULT_ENGINES,
          logs: []
        };
      }
    }
    return {
      activeEngine: 'demo-ai',
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
      logs: [newLog, ...prev.logs].slice(0, 100) // Garder seulement les 100 derniers logs
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setAdminSettings(prev => ({
      ...prev,
      logs: []
    }));
    addLog('info', 'Logs supprimés');
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

  // Sauvegarder les paramètres dans localStorage
  useEffect(() => {
    localStorage.setItem('professeur-kebe-admin', JSON.stringify(adminSettings));
  }, [adminSettings]);

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
      setActiveEngine,
      clearLogs
    }}>
      {children}
    </AIContext.Provider>
  );
};
