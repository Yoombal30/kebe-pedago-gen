import { AIEngine, AIEngineConfig } from '@/types';

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

  getActiveEngine(): AIEngine | null {
    return this.activeEngine;
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
      return await this.sendToAPI(message, this.activeEngine.config);
    } catch (error) {
      console.error('Erreur de connexion au moteur IA:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion au moteur IA'
      };
    }
  }

  private async sendToAPI(message: string, config: AIEngineConfig): Promise<AIResponse> {
    try {
      console.log('Connexion à:', config.endpoint, 'Modèle:', config.model);
      
      // Configuration des headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Headers pour ngrok
      if (config.endpoint.includes('ngrok')) {
        headers['ngrok-skip-browser-warning'] = 'true';
        headers['User-Agent'] = 'ProfesseurKEBE/2.0';
      }

      // Ajouter la clé API si présente
      if (config.apiKey && config.apiKey.trim() !== '') {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const systemPrompt = `Tu es le Professeur KEBE, un expert pédagogique spécialisé dans la création de contenus de formation professionnelle. 

Tes capacités :
- Création de modules de formation structurés
- Génération de cours complets avec introduction, sections et conclusion
- Conception de QCM et évaluations
- Analyse et synthèse de documents pédagogiques
- Recommandations méthodologiques

Réponds de manière claire, structurée et professionnelle.`;

      // Construire le payload selon le format API
      const payload = this.buildPayload(config, systemPrompt, message);

      const timeout = config.timeout || 60000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Timeout atteint:', timeout, 'ms');
        controller.abort();
      }, timeout);

      // Déterminer l'endpoint exact
      const apiEndpoint = this.getAPIEndpoint(config.endpoint);

      console.log('Envoi à:', apiEndpoint);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      console.log('Statut réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erreur inconnue');
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Réponse reçue:', data);
      
      const content = this.extractContent(data);
      
      return {
        content,
        success: true
      };

    } catch (error) {
      console.error('Erreur API:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            content: '',
            success: false,
            error: `Timeout: Le serveur ne répond pas dans les délais (${config.timeout || 60000}ms)`
          };
        }
        
        if (error.message.includes('Failed to fetch')) {
          return {
            content: '',
            success: false,
            error: `Impossible de se connecter à ${config.endpoint}. Vérifiez que le serveur est accessible.`
          };
        }
      }
      
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      };
    }
  }

  private getAPIEndpoint(baseEndpoint: string): string {
    // Si l'endpoint contient déjà /api/ ou /v1/, l'utiliser tel quel
    if (baseEndpoint.includes('/api/') || baseEndpoint.includes('/v1/')) {
      return baseEndpoint;
    }
    
    // Pour Ollama, ajouter /api/generate
    if (baseEndpoint.includes('localhost:11434') || baseEndpoint.includes('ngrok')) {
      return `${baseEndpoint}/api/generate`;
    }
    
    // Pour les API OpenAI-compatible, ajouter /chat/completions
    if (baseEndpoint.includes('openai') || baseEndpoint.includes('groq') || 
        baseEndpoint.includes('together') || baseEndpoint.includes('mistral') ||
        baseEndpoint.includes('openrouter')) {
      return `${baseEndpoint}/chat/completions`;
    }
    
    return baseEndpoint;
  }

  private buildPayload(config: AIEngineConfig, systemPrompt: string, message: string): any {
    const endpoint = config.endpoint.toLowerCase();
    
    // Format Ollama
    if (endpoint.includes('localhost:11434') || endpoint.includes('ngrok')) {
      return {
        model: config.model,
        prompt: `${systemPrompt}\n\nQuestion: ${message}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 2000
        }
      };
    }
    
    // Format OpenAI / API standard
    return {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };
  }

  private extractContent(data: any): string {
    // Format Ollama
    if (data.response) {
      return data.response;
    }
    
    // Format OpenAI / standard
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    
    // Format Anthropic
    if (data.content?.[0]?.text) {
      return data.content[0].text;
    }
    
    // Format HuggingFace
    if (data.generated_text || data[0]?.generated_text) {
      return data.generated_text || data[0].generated_text;
    }
    
    // Fallback
    if (data.text || data.content) {
      return data.text || data.content;
    }
    
    return 'Réponse reçue mais format non reconnu';
  }

  async testEngine(engine: AIEngine): Promise<boolean> {
    try {
      const tempActiveEngine = this.activeEngine;
      this.setActiveEngine(engine);
      
      const response = await this.sendMessage("Test de connexion - réponds 'OK' en une ligne");
      
      this.activeEngine = tempActiveEngine;
      return response.success;
    } catch (error) {
      console.error('Test moteur échoué:', error);
      return false;
    }
  }
}

export const aiService = AIService.getInstance();
