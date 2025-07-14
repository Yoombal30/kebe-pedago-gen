
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
      
      // Headers spéciaux pour ngrok et CORS
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      };

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

      // Essayer l'API Ollama standard
      let response: Response;
      try {
        response = await fetch(`${config.endpoint}/api/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          mode: 'cors',
        });
      } catch (fetchError) {
        console.log('Erreur API Ollama, essai endpoint direct:', fetchError);
        
        // Fallback: essayer l'endpoint direct avec un format différent
        const simplePayload = {
          prompt: `Tu es le Professeur KEBE, un expert pédagogique spécialisé dans la création de contenus de formation. Réponds de manière structurée et pédagogique.\n\nQuestion: ${message}`,
          max_tokens: 1500,
          temperature: 0.7
        };

        response = await fetch(config.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(simplePayload),
          mode: 'cors',
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erreur inconnue');
        console.error('Réponse HTTP non-OK:', response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Réponse reçue:', data);
      
      const content = data.response || data.text || data.content || data.choices?.[0]?.message?.content || 'Réponse reçue du modèle';
      
      return {
        content,
        success: true
      };
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
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const payload = this.buildPayload(config.provider, message, config);

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const content = this.extractContent(config.provider, data);

    return {
      content: content || 'Réponse vide',
      success: true
    };
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
          inputs: `${systemPrompt}\n\nQuestion: ${message}\nRéponse:`,
          parameters: {
            max_new_tokens: 1500,
            temperature: 0.7,
            return_full_text: false
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
        return Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
      
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
