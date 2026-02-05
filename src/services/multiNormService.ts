 /**
  * Service de gestion multi-normes
  * 
  * Permet d'importer, gérer et rechercher dans plusieurs bases normatives
  * (NS 01-001, NF C 15-100, IEC 60364, etc.)
  */
 
 import { 
   NormRule, 
   SommaireNode, 
   NormSearchResult, 
   NormDatabase,
   NormMetadata,
   NormImportFormat,
   MultiNormDatabase,
   NormImportValidation
 } from '@/types/norms';
 
 class MultiNormService {
   private static instance: MultiNormService;
   private database: MultiNormDatabase = {
     norms: new Map(),
     metadata: new Map(),
     activeNormId: null,
     totalRuleCount: 0
   };
   private keywordIndexes: Map<string, Map<string, Set<string>>> = new Map();
   private readonly STORAGE_KEY = 'imported_norms';
 
   static getInstance(): MultiNormService {
     if (!MultiNormService.instance) {
       MultiNormService.instance = new MultiNormService();
     }
     return MultiNormService.instance;
   }
 
   /**
    * Charge les normes sauvegardées depuis le localStorage
    */
   async loadSavedNorms(): Promise<void> {
     try {
       const saved = localStorage.getItem(this.STORAGE_KEY);
       if (saved) {
         const data = JSON.parse(saved);
         for (const [normId, normData] of Object.entries(data.norms || {})) {
           const norm = normData as { metadata: NormMetadata; database: NormDatabase };
           this.database.norms.set(normId, norm.database);
           this.database.metadata.set(normId, norm.metadata);
           this.buildKeywordIndex(normId, norm.database.rules);
         }
         this.updateTotalCount();
         console.log(`📚 ${this.database.metadata.size} norme(s) chargée(s) depuis le stockage`);
       }
     } catch (error) {
       console.error('Erreur chargement normes sauvegardées:', error);
     }
   }
 
   /**
    * Sauvegarde les normes dans le localStorage
    */
   private saveToStorage(): void {
     try {
       const data: Record<string, { metadata: NormMetadata; database: NormDatabase }> = {};
       for (const [normId, database] of this.database.norms) {
         const metadata = this.database.metadata.get(normId);
         if (metadata) {
           data[normId] = { metadata, database };
         }
       }
       localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ norms: data }));
     } catch (error) {
       console.error('Erreur sauvegarde normes:', error);
     }
   }
 
   /**
    * Valide un fichier JSON d'import
    */
   validateImport(jsonContent: string): NormImportValidation {
     const errors: string[] = [];
     const warnings: string[] = [];
 
     try {
       const data = JSON.parse(jsonContent) as NormImportFormat;
 
       // Vérification metadata
       if (!data.metadata) {
         errors.push('Champ "metadata" manquant');
       } else {
         if (!data.metadata.id) errors.push('metadata.id est requis');
         if (!data.metadata.name) errors.push('metadata.name est requis');
         if (!data.metadata.domain) errors.push('metadata.domain est requis');
         
         // Vérifier si la norme existe déjà
         if (data.metadata.id && this.database.metadata.has(data.metadata.id)) {
           warnings.push(`La norme "${data.metadata.id}" existe déjà et sera remplacée`);
         }
       }
 
       // Vérification rules
       if (!data.rules || !Array.isArray(data.rules)) {
         errors.push('Champ "rules" manquant ou invalide (doit être un tableau)');
       } else if (data.rules.length === 0) {
         errors.push('Le tableau "rules" est vide');
       } else {
         // Vérifier structure des règles
         const sampleRule = data.rules[0];
         if (!sampleRule.titre && !sampleRule.article && !sampleRule.content) {
           errors.push('Les règles doivent avoir au moins titre, article ou content');
         }
 
         // Vérifier les règles sans contenu
         const emptyRules = data.rules.filter(r => !r.content || r.content.trim() === '');
         if (emptyRules.length > 0) {
           warnings.push(`${emptyRules.length} règle(s) sans contenu détecté(s)`);
         }
       }
 
       // Avertissement sommaire
       if (!data.sommaire || data.sommaire.length === 0) {
         warnings.push('Pas de sommaire fourni - la navigation hiérarchique sera limitée');
       }
 
       if (errors.length === 0) {
         const sampleRules: NormRule[] = data.rules.slice(0, 3).map((r, i) => ({
           id: r.id || `preview-${i}`,
           titre: r.titre || 'Sans titre',
           article: r.article || '',
           content: r.content || '',
           page: r.page || 0,
           normId: data.metadata.id
         }));
 
         return {
           valid: true,
           errors: [],
           warnings,
           preview: {
             name: data.metadata.name,
             ruleCount: data.rules.length,
             sampleRules
           }
         };
       }
 
       return { valid: false, errors, warnings };
     } catch (e) {
       return {
         valid: false,
         errors: [`JSON invalide: ${e instanceof Error ? e.message : 'Erreur de parsing'}`],
         warnings: []
       };
     }
   }
 
   /**
    * Importe une norme depuis un JSON
    */
   importNorm(jsonContent: string): { success: boolean; normId?: string; error?: string } {
     const validation = this.validateImport(jsonContent);
     if (!validation.valid) {
       return { success: false, error: validation.errors.join('; ') };
     }
 
     try {
       const data = JSON.parse(jsonContent) as NormImportFormat;
       const normId = data.metadata.id;
 
       // Créer les règles avec normId
       const rules: NormRule[] = data.rules.map((r, index) => ({
         id: r.id || `${normId}-rule-${index + 1}`,
         titre: r.titre || 'Sans titre',
         article: r.article || `Art. ${index + 1}`,
         content: r.content || '',
         page: r.page || 0,
         normId,
         category: r.category,
         keywords: r.keywords
       }));
 
       // Créer la base de données
       const database: NormDatabase = {
         rules,
         sommaire: data.sommaire || [],
         loaded: true,
         ruleCount: rules.length
       };
 
       // Créer les métadonnées
       const metadata: NormMetadata = {
         id: normId,
         name: data.metadata.name,
         description: data.metadata.description || '',
         version: data.metadata.version,
         country: data.metadata.country,
         domain: data.metadata.domain,
         importedAt: new Date().toISOString(),
         ruleCount: rules.length
       };
 
       // Enregistrer
       this.database.norms.set(normId, database);
       this.database.metadata.set(normId, metadata);
       this.buildKeywordIndex(normId, rules);
       this.updateTotalCount();
 
       // Si c'est la première norme, l'activer
       if (!this.database.activeNormId) {
         this.database.activeNormId = normId;
       }
 
       // Sauvegarder
       this.saveToStorage();
 
       console.log(`✅ Norme "${metadata.name}" importée: ${rules.length} règles`);
       return { success: true, normId };
     } catch (error) {
       return { 
         success: false, 
         error: `Erreur d'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
       };
     }
   }
 
   /**
    * Construit l'index de mots-clés pour une norme
    */
   private buildKeywordIndex(normId: string, rules: NormRule[]): void {
     const index: Map<string, Set<string>> = new Map();
     
     const stopWords = new Set([
       'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'est',
       'sont', 'être', 'avoir', 'dans', 'pour', 'par', 'avec', 'sur', 'que',
       'qui', 'dont', 'où', 'ce', 'cette', 'ces', 'il', 'elle', 'ils', 'elles',
       'the', 'a', 'an', 'and', 'or', 'is', 'are', 'in', 'on', 'for', 'with'
     ]);
 
     for (const rule of rules) {
       const text = `${rule.titre} ${rule.content}`.toLowerCase();
       const words = text.split(/\s+/)
         .map(w => w.replace(/[^a-zàâäéèêëïîôùûüÿç0-9]/gi, ''))
         .filter(w => w.length > 2 && !stopWords.has(w));
 
       // Ajouter les mots-clés explicites
       if (rule.keywords) {
         words.push(...rule.keywords.map(k => k.toLowerCase()));
       }
 
       for (const word of words) {
         if (!index.has(word)) {
           index.set(word, new Set());
         }
         index.get(word)!.add(rule.id);
       }
     }
 
     this.keywordIndexes.set(normId, index);
   }
 
   /**
    * Met à jour le compteur total
    */
   private updateTotalCount(): void {
     let total = 0;
     for (const db of this.database.norms.values()) {
       total += db.ruleCount;
     }
     this.database.totalRuleCount = total;
   }
 
   /**
    * Supprime une norme
    */
   deleteNorm(normId: string): boolean {
     if (!this.database.norms.has(normId)) {
       return false;
     }
 
     this.database.norms.delete(normId);
     this.database.metadata.delete(normId);
     this.keywordIndexes.delete(normId);
     
     if (this.database.activeNormId === normId) {
       const remaining = Array.from(this.database.norms.keys());
       this.database.activeNormId = remaining.length > 0 ? remaining[0] : null;
     }
 
     this.updateTotalCount();
     this.saveToStorage();
     return true;
   }
 
   /**
    * Liste toutes les normes importées
    */
   listNorms(): NormMetadata[] {
     return Array.from(this.database.metadata.values());
   }
 
   /**
    * Définit la norme active
    */
   setActiveNorm(normId: string | null): void {
     if (normId === null || this.database.norms.has(normId)) {
       this.database.activeNormId = normId;
     }
   }
 
   /**
    * Récupère la norme active
    */
   getActiveNormId(): string | null {
     return this.database.activeNormId;
   }
 
   /**
    * Récupère une base de données de norme
    */
   getNormDatabase(normId: string): NormDatabase | null {
     return this.database.norms.get(normId) || null;
   }
 
   /**
    * Recherche dans toutes les normes ou une norme spécifique
    */
   searchRules(query: string, normId?: string, limit: number = 20): NormSearchResult[] {
     const results: NormSearchResult[] = [];
     const queryLower = query.toLowerCase().trim();
     const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
 
     const normsToSearch = normId 
       ? [normId] 
       : Array.from(this.database.norms.keys());
 
     for (const nId of normsToSearch) {
       const db = this.database.norms.get(nId);
       const index = this.keywordIndexes.get(nId);
       if (!db || !index) continue;
 
       // Recherche exacte par article
       for (const rule of db.rules) {
         if (rule.article.toLowerCase() === queryLower) {
           results.push({ rule, score: 100, matchType: 'exact', normId: nId });
         }
       }
 
       // Recherche partielle
       for (const rule of db.rules) {
         if (results.some(r => r.rule.id === rule.id)) continue;
         const content = `${rule.titre} ${rule.content}`.toLowerCase();
         if (content.includes(queryLower)) {
           const score = 80 - (content.indexOf(queryLower) * 0.1);
           results.push({ rule, score, matchType: 'partial', normId: nId });
         }
       }
 
       // Recherche par mots-clés
       const matchingIds = new Map<string, number>();
       for (const word of queryWords) {
         const ids = index.get(word);
         if (ids) {
           for (const id of ids) {
             matchingIds.set(id, (matchingIds.get(id) || 0) + 1);
           }
         }
       }
 
       for (const [id, count] of matchingIds) {
         if (results.some(r => r.rule.id === id)) continue;
         const rule = db.rules.find(r => r.id === id);
         if (rule) {
           const score = (count / queryWords.length) * 60;
           results.push({ rule, score, matchType: 'keyword', normId: nId });
         }
       }
     }
 
     return results.sort((a, b) => b.score - a.score).slice(0, limit);
   }
 
   /**
    * Statistiques globales
    */
   getStats(): { normCount: number; totalRuleCount: number; norms: NormMetadata[] } {
     return {
       normCount: this.database.norms.size,
       totalRuleCount: this.database.totalRuleCount,
       norms: this.listNorms()
     };
   }
 }
 
 export const multiNormService = MultiNormService.getInstance();