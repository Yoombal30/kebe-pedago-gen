
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatMessage, AIEngine, AdminSettings } from '@/types';

interface AIContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  activeEngine: AIEngine | null;
  adminSettings: AdminSettings;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  testEngine: (engineId: string) => Promise<boolean>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

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
  const [activeEngine, setActiveEngine] = useState<AIEngine | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    activeEngine: '',
    engines: [
      {
        id: 'ollama-local',
        name: 'Ollama (Local)',
        type: 'local',
        status: 'inactive',
        config: {
          model: 'llama2',
          port: 11434,
          endpoint: 'http://localhost:11434'
        }
      },
      {
        id: 'mistral-api',
        name: 'Mistral API',
        type: 'remote',
        status: 'inactive',
        config: {
          provider: 'mistral',
          apiKey: '',
          model: 'mistral-medium',
          endpoint: 'https://api.mistral.ai/v1'
        }
      }
    ],
    logs: []
  });

  const simulateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    // Simulation d'une réponse IA contextuelle
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (userMessage.toLowerCase().includes('module')) {
      return `D'accord, je peux vous aider à créer ou modifier des modules pédagogiques. 

Pour créer un nouveau module, j'ai besoin de :
- Un titre clair
- Les prérequis nécessaires
- Les savoirs à transmettre
- Les savoir-faire à développer
- La durée estimée

Souhaitez-vous que je vous guide dans la création d'un module spécifique ?`;
    }
    
    if (userMessage.toLowerCase().includes('cours')) {
      return `Parfait ! Je peux générer un cours complet à partir de vos modules et documents sources.

Je vais structurer le cours avec :
- Une introduction contextualisée
- Des sections détaillées avec exemples
- Des mises en garde réglementaires
- Un QCM d'évaluation
- Des ressources complémentaires

Avez-vous déjà sélectionné les modules et documents à utiliser ?`;
    }

    return `Je comprends votre demande. En tant que Professeur KEBE, je suis spécialisé dans la création de contenus pédagogiques. 

Je peux vous aider à :
- Créer et structurer des modules
- Générer des cours complets
- Analyser vos documents sources
- Créer des QCM et évaluations
- Adapter le contenu selon votre public

Que souhaitez-vous faire en priorité ?`;
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
      const response = await simulateAIResponse(content);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [simulateAIResponse]);

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
  }, []);

  const updateAdminSettings = useCallback((settings: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const testEngine = useCallback(async (engineId: string): Promise<boolean> => {
    // Simulation du test d'un moteur IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.3; // 70% de chance de succès
  }, []);

  return (
    <AIContext.Provider value={{
      messages,
      isTyping,
      activeEngine,
      adminSettings,
      sendMessage,
      clearChat,
      updateAdminSettings,
      testEngine
    }}>
      {children}
    </AIContext.Provider>
  );
};
