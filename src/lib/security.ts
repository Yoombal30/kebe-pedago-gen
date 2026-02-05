import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Utilitaires de sécurité pour l'application
 */

/**
 * Nettoie le HTML pour prévenir les attaques XSS
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Nettoie le texte brut (supprime tout HTML)
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

/**
 * Schémas de validation Zod
 */

// Validation du nom de fichier
export const fileNameSchema = z.string()
  .min(1, 'Le nom de fichier ne peut pas être vide')
  .max(255, 'Le nom de fichier est trop long')
  .regex(/^[^<>:"/\\|?*\x00-\x1f]+$/, 'Nom de fichier invalide');

// Validation du titre de cours
export const courseTitleSchema = z.string()
  .min(3, 'Le titre doit contenir au moins 3 caractères')
  .max(200, 'Le titre est trop long')
  .trim();

// Validation des instructions personnalisées
export const customInstructionsSchema = z.string()
  .max(2000, 'Les instructions sont trop longues')
  .optional();

// Validation de l'email
export const emailSchema = z.string()
  .email('Email invalide')
  .toLowerCase();

// Validation du contenu de document
export const documentContentSchema = z.string()
  .min(10, 'Le contenu est trop court')
  .max(1000000, 'Le contenu est trop long'); // 1MB de texte max

// Validation des paramètres de génération
export const generationSettingsSchema = z.object({
  includeQCM: z.boolean(),
  includeIntroduction: z.boolean(),
  includeConclusion: z.boolean(),
  addExamples: z.boolean(),
  addWarnings: z.boolean(),
  qcmQuestionCount: z.number().int().min(5).max(50),
  courseStyle: z.enum(['structured', 'conversational', 'technical'])
});

/**
 * Rate limiting simple côté client
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Vérifie si une action est autorisée selon le rate limit
   * @param key Identifiant unique de l'action
   * @param maxRequests Nombre maximum de requêtes
   * @param windowMs Fenêtre de temps en millisecondes
   */
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Nettoyer les anciennes timestamps
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  /**
   * Réinitialise le compteur pour une clé donnée
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Vérifie la taille du fichier uploadé
 */
export const validateFileSize = (size: number, maxSizeMB: number = 10): boolean => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
};

/**
 * Vérifie le type MIME du fichier
 */
export const validateFileType = (type: string, allowedTypes: string[]): boolean => {
  return allowedTypes.some(allowed => type.includes(allowed));
};

/**
 * Types de fichiers autorisés pour l'upload
 */
export const ALLOWED_DOCUMENT_TYPES = ['pdf', 'word', 'text'];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
];

/**
 * Vérifie la sécurité d'une URL
 */
export const isSafeURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Autorise uniquement HTTP et HTTPS
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Échappe les caractères spéciaux pour l'utilisation dans un regex
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Vérifie si une chaîne contient des scripts potentiellement dangereux
 */
export const containsScript = (str: string): boolean => {
  const scriptPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  return scriptPatterns.some(pattern => pattern.test(str));
};
