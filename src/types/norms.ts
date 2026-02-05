/**
 * Types pour les données normatives multi-normes
 * Support: NS 01-001, NF C 15-100, IEC 60364, etc.
 */

export interface NormRule {
  id: string;
  titre: string;
  article: string;
  content: string;
  page: number;
  normId?: string; // Identifiant de la norme parente
  category?: string; // Catégorie optionnelle
  keywords?: string[]; // Mots-clés pour recherche
}

export interface SommaireNode {
  index: string;
  label: string;
  level: number;
  children: SommaireNode[];
}

export interface NormSearchResult {
  rule: NormRule;
  score: number;
  matchType: 'exact' | 'partial' | 'keyword';
  normId?: string;
}

export interface NormDatabase {
  rules: NormRule[];
  sommaire: SommaireNode[];
  loaded: boolean;
  ruleCount: number;
}

/**
 * Métadonnées d'une norme importée
 */
export interface NormMetadata {
  id: string; // Identifiant unique (ex: "ns-01-001", "nf-c-15-100")
  name: string; // Nom complet (ex: "NS 01-001")
  description: string; // Description courte
  version?: string; // Version de la norme
  country?: string; // Pays d'origine
  domain: string; // Domaine (ex: "Sécurité électrique")
  importedAt: string; // Date d'import ISO
  ruleCount: number; // Nombre de règles
  source?: string; // Source du fichier
}

/**
 * Structure d'import JSON générique pour une norme
 */
export interface NormImportFormat {
  metadata: {
    id: string;
    name: string;
    description: string;
    version?: string;
    country?: string;
    domain: string;
  };
  sommaire?: SommaireNode[];
  rules: Array<{
    id?: string;
    titre: string;
    article: string;
    content: string;
    page?: number;
    category?: string;
    keywords?: string[];
  }>;
}

/**
 * Base de données multi-normes
 */
export interface MultiNormDatabase {
  norms: Map<string, NormDatabase>;
  metadata: Map<string, NormMetadata>;
  activeNormId: string | null;
  totalRuleCount: number;
}

export interface NormContext {
  selectedRules: NormRule[];
  searchQuery: string;
  selectedTitre: string | null;
  selectedArticle: string | null;
  activeNormId?: string;
}

/**
 * Résultat de validation d'import
 */
export interface NormImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview?: {
    name: string;
    ruleCount: number;
    sampleRules: NormRule[];
  };
}
