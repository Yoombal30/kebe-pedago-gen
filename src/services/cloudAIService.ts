/**
 * Service pour Lovable Cloud AI
 * Utilise l'edge function /chat pour les requêtes IA
 */

import { supabase } from "@/integrations/supabase/client";

export interface CloudAIResponse {
  success: boolean;
  content: string;
  model?: string;
  error?: string;
  code?: string;
}

export interface CloudAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Modèles disponibles via Lovable AI Gateway
export const CLOUD_AI_MODELS = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash (Recommandé)', description: 'Rapide et équilibré' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Bon rapport qualité/coût' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Haute qualité, contexte large' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Équilibré performance/coût' },
  { id: 'openai/gpt-5', name: 'GPT-5', description: 'Maximum de qualité' },
] as const;

export type CloudAIModel = typeof CLOUD_AI_MODELS[number]['id'];

export class CloudAIService {
  private static instance: CloudAIService;
  private currentModel: CloudAIModel = 'google/gemini-3-flash-preview';

  static getInstance(): CloudAIService {
    if (!CloudAIService.instance) {
      CloudAIService.instance = new CloudAIService();
    }
    return CloudAIService.instance;
  }

  setModel(model: CloudAIModel) {
    this.currentModel = model;
  }

  getModel(): CloudAIModel {
    return this.currentModel;
  }

  getAvailableModels() {
    return CLOUD_AI_MODELS;
  }

  async sendMessage(message: string, conversationHistory: CloudAIMessage[] = []): Promise<CloudAIResponse> {
    try {
      const messages: CloudAIMessage[] = [
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages,
          model: this.currentModel
        }
      });

      if (error) {
        console.error('Cloud AI error:', error);
        return {
          success: false,
          content: '',
          error: error.message || 'Erreur de connexion au service Cloud AI'
        };
      }

      if (data.error) {
        return {
          success: false,
          content: '',
          error: data.error,
          code: data.code
        };
      }

      return {
        success: true,
        content: data.content,
        model: data.model
      };
    } catch (error) {
      console.error('Cloud AI service error:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage("Réponds uniquement 'OK' en un mot.");
      return response.success && response.content.toLowerCase().includes('ok');
    } catch {
      return false;
    }
  }
}

export const cloudAIService = CloudAIService.getInstance();
