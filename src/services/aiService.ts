import { AIEngine, LocalAIConfig, RemoteAIConfig, ChatMessage } from '@/types';

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export class AIService {
  private static instance: AIService;
  private activeEngine: AIEngine | null = null;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  setActiveEngine(engine: AIEngine) {
    this.activeEngine = engine;
  }

  async sendMessage(message: string): Promise<AIResponse> {
    if (!this.activeEngine) {
      return {
        content: '',
        success: false,
        error: 'Aucun moteur IA actif configuré'
      };
    }

    try {
      if (this.activeEngine.type === 'local') {
        return await this.sendToLocalEngine(message, this.activeEngine.config as LocalAIConfig);
      } else {
        return await this.sendToRemoteEngine(message, this.activeEngine.config as RemoteAIConfig);
      }
    } catch (error) {
      console.error('Erreur de connexion au moteur IA:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion au moteur IA'
      };
    }
  }

  private async sendToLocalEngine(message: string, config: LocalAIConfig): Promise<AIResponse> {
    try {
      console.log('Tentative de connexion à:', config.endpoint);
      
      // Configuration des headers avec timeout plus long
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Headers spéciaux pour ngrok
      if (config.endpoint.includes('ngrok')) {
        headers['ngrok-skip-browser-warning'] = 'true';
        headers['User-Agent'] = 'ProfesseurKEBE/1.0';
      }

      // Payload pour Ollama
      const payload = {
        model: config.model,
        prompt: `Tu es le Professeur KEBE, un expert pédagogique spécialisé dans la création de contenus de formation. Réponds de manière structurée et pédagogique.\n\nQuestion: ${message}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      };

      console.log('Payload envoyé:', payload);

      // Essayer d'abord l'API Ollama standard
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

      try {
        const response = await fetch(`${config.endpoint}/api/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
          mode: 'cors',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Réponse reçue:', data);
        
        const content = data.response || data.text || data.content || data.choices?.[0]?.message?.content || 'Réponse reçue du modèle';
        
        return {
          content,
          success: true
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.log('Erreur API Ollama, essai endpoint direct:', fetchError);
        
        // Fallback: essayer l'endpoint direct avec un format différent
        const simplePayload = {
          prompt: `Tu es le Professeur KEBE, un expert pédagogique spécialisé dans la création de contenus de formation. Réponds de manière structurée et pédagogique.\n\nQuestion: ${message}`,
          max_tokens: 1500,
          temperature: 0.7
        };

        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 20000);

        try {
          const fallbackResponse = await fetch(config.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(simplePayload),
            signal: fallbackController.signal,
            mode: 'cors',
          });

          clearTimeout(fallbackTimeoutId);

          if (!fallbackResponse.ok) {
            throw new Error(`Erreur HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
          }

          const fallbackData = await fallbackResponse.json();
          const content = fallbackData.response || fallbackData.text || fallbackData.content || 'Réponse reçue du modèle';
          
          return {
            content,
            success: true
          };
        } catch (fallbackError) {
          clearTimeout(fallbackTimeoutId);
          throw new Error(`Connexion impossible - Vérifiez que le serveur ${config.endpoint} est accessible`);
        }
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion au moteur IA'
      };
    }
  }

  private async sendToRemoteEngine(message: string, config: RemoteAIConfig): Promise<AIResponse> {
    // Pour Hugging Face, l'API key est optionnelle pour certains modèles publics
    if (config.provider !== 'huggingface' && (!config.apiKey || config.apiKey.trim() === '')) {
      throw new Error(`Clé API manquante pour ${config.provider}. Veuillez configurer votre clé API.`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Configuration des headers selon le provider
    if (config.provider === 'mistral') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.provider === 'openrouter') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'Professeur KEBE';
    } else if (config.provider === 'anthropic') {
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (config.provider === 'huggingface') {
      if (config.apiKey && config.apiKey.trim() !== '') {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }
    }

    const payload = this.buildPayload(config.provider, message, config);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erreur inconnue');
        if (response.status === 401) {
          throw new Error(`Clé API invalide pour ${config.provider}. Vérifiez votre clé API.`);
        }
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = this.extractContent(config.provider, data);

      return {
        content: content || 'Réponse vide',
        success: true
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout de connexion - Le serveur met trop de temps à répondre');
      }
      throw error;
    }
  }

  private buildPayload(provider: string, message: string, config: RemoteAIConfig) {
    const systemPrompt = "Tu es le Professeur KEBE, un expert pédagogique spécialisé dans la création de contenus de formation. Réponds de manière structurée et pédagogique.";

    switch (provider) {
      case 'mistral':
        return {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1500
        };

      case 'openrouter':
        return {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1500
        };

      case 'anthropic':
        return {
          model: config.model,
          max_tokens: 1500,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${message}` }
          ]
        };

      case 'huggingface':
        return {
          inputs: {
            past_user_inputs: [],
            generated_responses: [],
            text: `${systemPrompt}\n\nQuestion: ${message}`
          },
          parameters: {
            max_length: 1500,
            temperature: 0.7,
            do_sample: true
          }
        };

      default:
        return {
          prompt: `${systemPrompt}\n\nQuestion: ${message}`,
          max_tokens: 1500,
          temperature: 0.7
        };
    }
  }

  private extractContent(provider: string, data: any): string {
    switch (provider) {
      case 'mistral':
      case 'openrouter':
        return data.choices?.[0]?.message?.content || '';
      
      case 'anthropic':
        return data.content?.[0]?.text || '';
      
      case 'huggingface':
        return data.generated_text || data.response || '';
      
      default:
        return data.response || data.text || data.content || '';
    }
  }

  async testEngine(engine: AIEngine): Promise<boolean> {
    try {
      const tempActiveEngine = this.activeEngine;
      this.setActiveEngine(engine);
      
      const response = await this.sendMessage("Test de connexion - réponds simplement 'OK'");
      
      this.activeEngine = tempActiveEngine;
      return response.success;
    } catch (error) {
      console.error('Test moteur échoué:', error);
      return false;
    }
  }
}

export const aiService = AIService.getInstance();
