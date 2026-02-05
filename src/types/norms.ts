/**
 * Types pour les données normatives NS 01-001
 */

export interface NormRule {
  id: string;
  titre: string;
  article: string;
  content: string;
  page: number;
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
}

export interface NormDatabase {
  rules: NormRule[];
  sommaire: SommaireNode[];
  loaded: boolean;
  ruleCount: number;
}

export interface NormContext {
  selectedRules: NormRule[];
  searchQuery: string;
  selectedTitre: string | null;
  selectedArticle: string | null;
}
