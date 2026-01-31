/**
 * Service de gestion des données normatives NS 01-001
 * 
 * Ce service charge, indexe et permet la recherche dans les 1994 règles
 * de la norme de sécurité électrique. Il fonctionne de manière déterministe
 * sans dépendance à l'IA.
 */

import { NormRule, SommaireNode, NormSearchResult, NormDatabase } from '@/types/norms';

class NormService {
  private static instance: NormService;
  private database: NormDatabase = {
    rules: [],
    sommaire: [],
    loaded: false,
    ruleCount: 0
  };
  private keywordIndex: Map<string, Set<string>> = new Map();
  private loadingPromise: Promise<void> | null = null;

  static getInstance(): NormService {
    if (!NormService.instance) {
      NormService.instance = new NormService();
    }
    return NormService.instance;
  }

  /**
   * Charge les données normatives depuis les fichiers JSON
   */
  async loadData(): Promise<void> {
    if (this.database.loaded) return;
    
    // Éviter les chargements multiples
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.performLoad();
    return this.loadingPromise;
  }

  private async performLoad(): Promise<void> {
    try {
      console.log('🔧 Chargement des données normatives NS 01-001...');
      
      const [rulesResponse, sommaireResponse] = await Promise.all([
        fetch('/data/NS01001_v2_core.json'),
        fetch('/data/sommaire_gold.json')
      ]);

      if (!rulesResponse.ok || !sommaireResponse.ok) {
        throw new Error('Erreur lors du chargement des fichiers normatifs');
      }

      const rules: NormRule[] = await rulesResponse.json();
      const sommaire: SommaireNode[] = await sommaireResponse.json();

      this.database = {
        rules,
        sommaire,
        loaded: true,
        ruleCount: rules.length
      };

      // Construire l'index de mots-clés
      this.buildKeywordIndex();

      console.log(`✅ ${rules.length} règles normatives chargées`);
    } catch (error) {
      console.error('❌ Erreur chargement données normatives:', error);
      this.database.loaded = false;
      throw error;
    }
  }

  /**
   * Construit un index inversé pour la recherche rapide
   */
  private buildKeywordIndex(): void {
    this.keywordIndex.clear();
    
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'est',
      'sont', 'être', 'avoir', 'dans', 'pour', 'par', 'avec', 'sur', 'que',
      'qui', 'dont', 'où', 'ce', 'cette', 'ces', 'il', 'elle', 'ils', 'elles'
    ]);

    for (const rule of this.database.rules) {
      const text = `${rule.titre} ${rule.content}`.toLowerCase();
      const words = text.split(/\s+/)
        .map(w => w.replace(/[^a-zàâäéèêëïîôùûüÿç0-9]/gi, ''))
        .filter(w => w.length > 2 && !stopWords.has(w));

      for (const word of words) {
        if (!this.keywordIndex.has(word)) {
          this.keywordIndex.set(word, new Set());
        }
        this.keywordIndex.get(word)!.add(rule.id);
      }
    }

    console.log(`📚 Index construit: ${this.keywordIndex.size} mots-clés`);
  }

  /**
   * Vérifie si les données sont chargées
   */
  isLoaded(): boolean {
    return this.database.loaded;
  }

  /**
   * Retourne les statistiques de la base
   */
  getStats(): { ruleCount: number; loaded: boolean } {
    return {
      ruleCount: this.database.ruleCount,
      loaded: this.database.loaded
    };
  }

  /**
   * Recherche des règles par mot-clé
   */
  searchRules(query: string, limit: number = 20): NormSearchResult[] {
    if (!this.database.loaded || !query.trim()) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    const results: Map<string, { rule: NormRule; score: number; matchType: 'exact' | 'partial' | 'keyword' }> = new Map();

    // 1. Recherche exacte par article
    for (const rule of this.database.rules) {
      if (rule.article.toLowerCase() === queryLower) {
        results.set(rule.id, { rule, score: 100, matchType: 'exact' });
      }
    }

    // 2. Recherche partielle dans le contenu
    for (const rule of this.database.rules) {
      if (results.has(rule.id)) continue;

      const content = `${rule.titre} ${rule.content}`.toLowerCase();
      
      if (content.includes(queryLower)) {
        const score = 80 - (content.indexOf(queryLower) * 0.1);
        results.set(rule.id, { rule, score, matchType: 'partial' });
      }
    }

    // 3. Recherche par mots-clés via l'index
    const matchingIds = new Map<string, number>();
    for (const word of queryWords) {
      const ids = this.keywordIndex.get(word);
      if (ids) {
        for (const id of ids) {
          matchingIds.set(id, (matchingIds.get(id) || 0) + 1);
        }
      }
    }

    for (const [id, count] of matchingIds) {
      if (results.has(id)) continue;
      
      const rule = this.database.rules.find(r => r.id === id);
      if (rule) {
        const score = (count / queryWords.length) * 60;
        results.set(id, { rule, score, matchType: 'keyword' });
      }
    }

    // Trier par score et limiter
    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Récupère une règle par son article
   */
  getRuleByArticle(article: string): NormRule | null {
    if (!this.database.loaded) return null;
    return this.database.rules.find(r => r.article === article) || null;
  }

  /**
   * Récupère les règles d'un titre spécifique
   */
  getRulesByTitre(titre: string): NormRule[] {
    if (!this.database.loaded) return [];
    return this.database.rules.filter(r => 
      r.titre.toLowerCase().includes(titre.toLowerCase())
    );
  }

  /**
   * Récupère le sommaire hiérarchique
   */
  getSommaire(): SommaireNode[] {
    return this.database.sommaire;
  }

  /**
   * Récupère toutes les règles (avec pagination optionnelle)
   */
  getAllRules(page: number = 1, pageSize: number = 50): { rules: NormRule[]; total: number; pages: number } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      rules: this.database.rules.slice(start, end),
      total: this.database.ruleCount,
      pages: Math.ceil(this.database.ruleCount / pageSize)
    };
  }

  /**
   * Génère un contexte normatif pour un sujet donné
   * Utilisé pour enrichir la génération de cours
   */
  getContextForTopic(topic: string): { relevantRules: NormRule[]; summary: string } {
    const searchResults = this.searchRules(topic, 10);
    const relevantRules = searchResults.map(r => r.rule);

    if (relevantRules.length === 0) {
      return {
        relevantRules: [],
        summary: `Aucune règle normative trouvée pour le sujet "${topic}".`
      };
    }

    // Construire un résumé des articles pertinents
    const titres = [...new Set(relevantRules.map(r => r.titre))];
    const articles = relevantRules.map(r => r.article).slice(0, 5);
    
    const summary = `📋 Contexte normatif NS 01-001 pour "${topic}":\n\n` +
      `Sections concernées: ${titres.join(', ')}\n` +
      `Articles clés: ${articles.join(', ')}\n` +
      `${relevantRules.length} règle(s) identifiée(s).`;

    return { relevantRules, summary };
  }

  /**
   * Extrait les concepts clés des règles sélectionnées
   */
  extractKeyConceptsFromRules(rules: NormRule[]): string[] {
    const concepts: Map<string, number> = new Map();
    
    const technicalTerms = [
      'protection', 'sécurité', 'installation', 'électrique', 'tension',
      'courant', 'mise à la terre', 'isolement', 'conducteur', 'circuit',
      'disjoncteur', 'fusible', 'prise', 'interrupteur', 'câble', 'gaine',
      'tableau', 'différentiel', 'court-circuit', 'surcharge', 'contact',
      'indirect', 'direct', 'classe', 'IP', 'TBT', 'BT', 'HT'
    ];

    for (const rule of rules) {
      const content = rule.content.toLowerCase();
      for (const term of technicalTerms) {
        if (content.includes(term.toLowerCase())) {
          concepts.set(term, (concepts.get(term) || 0) + 1);
        }
      }
    }

    return Array.from(concepts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term]) => term);
  }
}

export const normService = NormService.getInstance();
