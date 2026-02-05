/**
 * Générateur de cours normatif structuré en 5 parties
 * 
 * Chaîne complète : Norme atomisée → Module → Cours → Diaporama → QCM → Évaluation
 * 
 * Structure obligatoire :
 * 1. Introduction pédagogique
 * 2. Fondements normatifs  
 * 3. Règles clés (issues du JSON atomisé)
 * 4. Cas pratiques
 * 5. Synthèse + checklist d'audit
 */

import { Course, CourseSection, Module, QCMQuestion } from '@/types';
import { NormRule } from '@/types/norms';
import { normService } from './normService';

export interface NormativeCourseRequest {
  normReference: string; // ex: "NS 01-001"
  theme?: string; // ex: "Protection contre les chocs électriques"
  articlePrefix?: string; // ex: "411" pour tous les articles 411.x
  selectedRules?: NormRule[];
  targetAudience: 'beginner' | 'technician' | 'engineer';
  includeQCM: boolean;
  qcmCount: number;
}

export interface NormativeCourseResult {
  course: Course;
  rulesUsed: NormRule[];
  generationStats: {
    rulesAnalyzed: number;
    sectionsCreated: number;
    qcmGenerated: number;
    processingTimeMs: number;
  };
}

// Thèmes prédéfinis avec mots-clés de recherche
export const PREDEFINED_THEMES: Record<string, { label: string; keywords: string[]; articlePrefixes: string[] }> = {
  'chocs-electriques': {
    label: 'Protection contre les chocs électriques',
    keywords: ['choc', 'contact direct', 'contact indirect', 'protection', 'mise à la terre', 'DDR', 'différentiel'],
    articlePrefixes: ['411', '412', '413', '414']
  },
  'surintensites': {
    label: 'Protection contre les surintensités',
    keywords: ['surintensité', 'surcharge', 'court-circuit', 'disjoncteur', 'fusible', 'protection'],
    articlePrefixes: ['433', '434', '435']
  },
  'mise-terre': {
    label: 'Mise à la terre et conducteurs de protection',
    keywords: ['terre', 'PE', 'conducteur', 'prise de terre', 'équipotentielle', 'continuité'],
    articlePrefixes: ['541', '542', '543', '544']
  },
  'schemas-liaison': {
    label: 'Schémas de liaison à la terre (TT, TN, IT)',
    keywords: ['TT', 'TN', 'IT', 'schéma', 'liaison', 'neutre', 'régime'],
    articlePrefixes: ['312', '411', '413']
  },
  'canalisations': {
    label: 'Canalisations et câblage',
    keywords: ['canalisation', 'câble', 'conducteur', 'section', 'pose', 'conduit'],
    articlePrefixes: ['521', '522', '523', '524']
  },
  'locaux-humides': {
    label: 'Locaux humides et salles de bain',
    keywords: ['humide', 'salle de bain', 'douche', 'baignoire', 'volume', 'IP'],
    articlePrefixes: ['701', '702']
  },
  'verification': {
    label: 'Vérification et essais',
    keywords: ['vérification', 'essai', 'mesure', 'contrôle', 'continuité', 'isolement'],
    articlePrefixes: ['61', '62']
  },
  'protection-incendie': {
    label: 'Protection contre l\'incendie',
    keywords: ['incendie', 'feu', 'thermique', 'inflammable', 'propagation'],
    articlePrefixes: ['42', '422', '423']
  }
};

export class NormativeCourseGenerator {
  
  /**
   * Génère un cours structuré à partir de la norme NS 01-001
   */
  static async generateCourse(request: NormativeCourseRequest): Promise<NormativeCourseResult> {
    const startTime = Date.now();
    
    // Charger les données normatives si nécessaire
    if (!normService.isLoaded()) {
      await normService.loadData();
    }
    
    // Collecter les règles pertinentes
    let rules: NormRule[] = request.selectedRules || [];
    
    if (rules.length === 0) {
      rules = this.collectRelevantRules(request);
    }
    
    // Générer le cours structuré en 5 parties
    const sections = this.generateStructuredSections(rules, request);
    
    // Générer les QCM normatifs
    const qcm = request.includeQCM 
      ? this.generateNormativeQCM(rules, request.qcmCount)
      : [];
    
    // Créer les modules pédagogiques
    const modules = this.createPedagogicalModules(rules, request);
    
    // Construire le cours
    const courseTitle = request.theme 
      ? `Formation : ${request.theme}`
      : `Formation NS 01-001 - Articles ${request.articlePrefix || 'complet'}`;
    
    const course: Course = {
      id: `norm-course-${Date.now()}`,
      title: courseTitle,
      modules,
      documents: [],
      content: {
        introduction: sections.introduction,
        sections: sections.courseSections,
        conclusion: sections.synthesis,
        qcm,
        resources: this.generateResources(rules),
      },
      generatedAt: new Date(),
      lastModified: new Date(),
    };
    
    return {
      course,
      rulesUsed: rules,
      generationStats: {
        rulesAnalyzed: rules.length,
        sectionsCreated: sections.courseSections.length,
        qcmGenerated: qcm.length,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }
  
  /**
   * Collecte les règles pertinentes selon la demande
   */
  private static collectRelevantRules(request: NormativeCourseRequest): NormRule[] {
    const rules: NormRule[] = [];
    const addedIds = new Set<string>();
    
    // Par préfixe d'article
    if (request.articlePrefix) {
      const allRules = normService.getAllRules(1, 2000).rules;
      const filtered = allRules.filter(r => r.article.startsWith(request.articlePrefix!));
      filtered.forEach(r => {
        if (!addedIds.has(r.id)) {
          rules.push(r);
          addedIds.add(r.id);
        }
      });
    }
    
    // Par thème (mots-clés)
    if (request.theme) {
      const themeConfig = Object.values(PREDEFINED_THEMES).find(t => 
        t.label.toLowerCase().includes(request.theme!.toLowerCase())
      );
      
      const keywords = themeConfig?.keywords || request.theme.split(' ');
      
      for (const keyword of keywords) {
        const results = normService.searchRules(keyword, 15);
        results.forEach(r => {
          if (!addedIds.has(r.rule.id)) {
            rules.push(r.rule);
            addedIds.add(r.rule.id);
          }
        });
      }
    }
    
    // Limiter et trier par pertinence (numéro d'article)
    return rules
      .sort((a, b) => a.article.localeCompare(b.article, undefined, { numeric: true }))
      .slice(0, 30);
  }
  
  /**
   * Génère les 5 sections structurées obligatoires
   */
  private static generateStructuredSections(
    rules: NormRule[], 
    request: NormativeCourseRequest
  ): { introduction: string; courseSections: CourseSection[]; synthesis: string } {
    
    const courseSections: CourseSection[] = [];
    const audienceLevel = request.targetAudience;
    
    // === CHAPITRE 1 : INTRODUCTION PÉDAGOGIQUE ===
    const introduction = this.generatePedagogicalIntro(rules, request);
    
    courseSections.push({
      id: `section-intro-${Date.now()}`,
      title: '📌 Chapitre 1 - Introduction et enjeux',
      explanation: this.generateIntroChapter(rules, audienceLevel),
      examples: [
        'Accident domestique : électrocution dans une salle de bain non conforme',
        'Incident industriel : court-circuit ayant provoqué un incendie',
        'Chaque année, environ 200 décès par électrocution en France'
      ],
      warnings: [
        'La non-conformité à la norme NS 01-001 engage la responsabilité du professionnel',
        'Les accidents électriques représentent la 4ème cause d\'accidents mortels au travail'
      ],
    });
    
    // === CHAPITRE 2 : FONDEMENTS NORMATIFS ===
    courseSections.push({
      id: `section-normes-${Date.now()}`,
      title: '📌 Chapitre 2 - Rappel normatif',
      explanation: this.generateNormativeFoundations(rules),
      examples: rules.slice(0, 3).map(r => `Article ${r.article} : ${r.content.substring(0, 100)}...`),
      warnings: [
        'Les règles NS 01-001 sont obligatoires pour toute installation électrique BT',
        'Le non-respect peut entraîner le refus de mise en service par le Consuel'
      ],
    });
    
    // === CHAPITRE 3 : RÈGLES CLÉS ===
    const keyRules = this.selectKeyRules(rules, 8);
    keyRules.forEach((rule, index) => {
      courseSections.push({
        id: `section-rule-${index}-${Date.now()}`,
        title: `📌 Règle ${index + 1} : Article ${rule.article}`,
        explanation: this.formatRuleForAudience(rule, audienceLevel),
        examples: this.generateRuleExamples(rule),
        warnings: this.extractRuleWarnings(rule),
      });
    });
    
    // === CHAPITRE 4 : CAS PRATIQUES ===
    courseSections.push({
      id: `section-pratique-${Date.now()}`,
      title: '📌 Chapitre 4 - Cas pratiques',
      explanation: this.generatePracticalCases(rules, request),
      examples: [
        'Vérification de la continuité du conducteur PE avec un ohmmètre',
        'Test du DDR avec la touche test et mesure du temps de déclenchement',
        'Mesure de la résistance de la prise de terre'
      ],
      warnings: [
        'Toujours consigner l\'installation avant intervention',
        'Porter les EPI adaptés (gants isolants, lunettes, VAT)'
      ],
    });
    
    // === CHAPITRE 5 : SYNTHÈSE ET CHECKLIST ===
    const synthesis = this.generateSynthesisAndChecklist(rules);
    
    courseSections.push({
      id: `section-synthese-${Date.now()}`,
      title: '📌 Chapitre 5 - Synthèse et checklist d\'audit',
      explanation: synthesis,
      examples: [],
      warnings: ['Cette checklist doit être utilisée pour chaque vérification d\'installation'],
    });
    
    return { introduction, courseSections, synthesis };
  }
  
  /**
   * Génère l'introduction pédagogique
   */
  private static generatePedagogicalIntro(rules: NormRule[], request: NormativeCourseRequest): string {
    const titres = [...new Set(rules.map(r => r.titre))];
    const theme = request.theme || 'la sécurité électrique';
    
    return `# Introduction à ${theme}

## Objectif de cette formation

Cette formation vous permettra de maîtriser les exigences de la norme **NS 01-001** relatives à ${theme.toLowerCase()}.

## Contexte réglementaire

La norme NS 01-001 est le document de référence pour la conception, la réalisation et la vérification des installations électriques basse tension. Elle vise à protéger :
- Les **personnes** contre les risques d'électrocution
- Les **biens** contre les risques d'incendie d'origine électrique
- La **continuité de service** des installations

## Sections de la norme abordées

${titres.map(t => `- ${t}`).join('\n')}

## Ce que vous saurez faire à la fin

✅ Identifier les exigences normatives applicables
✅ Appliquer les règles de protection appropriées
✅ Vérifier la conformité d'une installation
✅ Utiliser la checklist d'audit normative

---

**Nombre de règles étudiées :** ${rules.length}
**Référence :** NS 01-001 (Installations électriques à basse tension)`;
  }
  
  /**
   * Génère le chapitre d'introduction
   */
  private static generateIntroChapter(rules: NormRule[], audience: string): string {
    const baseText = `## Problème réel

Les installations électriques défaillantes ou non conformes sont à l'origine de nombreux accidents graves chaque année. Les principaux risques sont :

- **Électrocution** : passage de courant à travers le corps humain
- **Électrisation** : effets physiologiques du passage du courant
- **Incendie** : échauffement anormal des conducteurs ou arcs électriques
- **Explosion** : dans les atmosphères à risque

## Enjeux de sécurité

La conformité aux normes électriques n'est pas optionnelle. Elle répond à :
- Une obligation légale (Code du travail, règlement de sécurité ERP)
- Une exigence des assureurs
- Une responsabilité civile et pénale du professionnel

## Lien avec les accidents électriques

L'analyse des accidents électriques révèle que dans la majorité des cas, le non-respect d'une ou plusieurs règles normatives est en cause :
- Absence ou défaillance du dispositif différentiel
- Conducteur de protection non connecté ou interrompu
- Installation non adaptée à l'environnement (humidité, risques mécaniques)`;

    if (audience === 'beginner') {
      return baseText + `\n\n**💡 Pour les débutants :** Cette formation vous guidera pas à pas dans la compréhension des règles essentielles.`;
    } else if (audience === 'engineer') {
      return baseText + `\n\n**🔬 Pour les ingénieurs :** Les aspects de dimensionnement et de calcul seront détaillés pour chaque règle.`;
    }
    
    return baseText;
  }
  
  /**
   * Génère les fondements normatifs
   */
  private static generateNormativeFoundations(rules: NormRule[]): string {
    const titres = [...new Set(rules.map(r => r.titre))];
    const articles = rules.map(r => r.article).slice(0, 15);
    
    return `## Articles NS 01-001 concernés

Cette formation couvre les articles suivants de la norme NS 01-001 :

${articles.map(a => `- **Article ${a}**`).join('\n')}

## Sections de la norme

${titres.map(t => `### ${t}`).join('\n\n')}

## Résumé des obligations

Les règles étudiées imposent les obligations suivantes :

1. **Protection des personnes** : Mise en œuvre de dispositifs de protection adaptés
2. **Protection des biens** : Prévention des risques d'incendie et de dommages
3. **Continuité de service** : Garantie du fonctionnement correct de l'installation
4. **Vérification** : Contrôle de conformité avant mise en service

## Hiérarchie des documents

- **Norme NS 01-001** : Document principal (équivalent NF C 15-100)
- **Guides UTE** : Compléments d'application
- **Réglementations** : ERP, Code du travail, etc.`;
  }
  
  /**
   * Sélectionne les règles clés les plus importantes
   */
  private static selectKeyRules(rules: NormRule[], count: number): NormRule[] {
    // Prioriser les règles avec du contenu substantiel
    return rules
      .filter(r => r.content.length > 50)
      .sort((a, b) => b.content.length - a.content.length)
      .slice(0, count);
  }
  
  /**
   * Formate une règle selon le niveau de l'audience
   */
  private static formatRuleForAudience(rule: NormRule, audience: string): string {
    const baseContent = `## Texte normatif

> ${rule.content}

**Référence :** Article ${rule.article} - Page ${rule.page}
**Section :** ${rule.titre}

---

`;

    const simpleExplanation = `## Explication simple (niveau débutant)

Cette règle signifie que ${this.simplifyRuleContent(rule.content)}.

L'objectif est de garantir la sécurité des personnes en évitant tout risque d'accident électrique.`;

    const technicalExplanation = `## Explication technique (niveau technicien)

${rule.content}

**Application pratique :** Cette règle impose une vérification systématique lors de la mise en service. Les outils nécessaires sont : multimètre, mégohmmètre, et appareil de mesure de boucle de défaut.`;

    const engineerExplanation = `## Explication ingénieur

${rule.content}

**Dimensionnement :** Les calculs de dimensionnement doivent prendre en compte les paramètres suivants :
- Courant de défaut présumé
- Temps de coupure maximal
- Impédance de boucle de défaut
- Sélectivité avec les protections amont`;

    if (audience === 'beginner') {
      return baseContent + simpleExplanation;
    } else if (audience === 'engineer') {
      return baseContent + engineerExplanation;
    }
    
    return baseContent + technicalExplanation;
  }
  
  /**
   * Simplifie le contenu d'une règle
   */
  private static simplifyRuleContent(content: string): string {
    // Simplification basique
    return content
      .replace(/doit être/gi, 'il faut')
      .replace(/doivent être/gi, 'il faut')
      .replace(/sont tenus de/gi, 'doivent')
      .replace(/conformément à/gi, 'selon')
      .substring(0, 200);
  }
  
  /**
   * Génère des exemples pour une règle
   */
  private static generateRuleExamples(rule: NormRule): string[] {
    const content = rule.content.toLowerCase();
    const examples: string[] = [];
    
    if (content.includes('protection') || content.includes('protéger')) {
      examples.push('Installation d\'un dispositif différentiel 30 mA sur les circuits prises');
    }
    if (content.includes('terre') || content.includes('pe')) {
      examples.push('Réalisation d\'une prise de terre avec piquet et mesure de résistance < 100 Ω');
    }
    if (content.includes('vérification') || content.includes('essai')) {
      examples.push('Vérification de la continuité des conducteurs de protection');
    }
    if (content.includes('disjoncteur') || content.includes('fusible')) {
      examples.push('Choix du calibre de protection adapté à la section des conducteurs');
    }
    
    if (examples.length === 0) {
      examples.push(`Application de l'article ${rule.article} sur chantier`);
    }
    
    return examples;
  }
  
  /**
   * Extrait les avertissements d'une règle
   */
  private static extractRuleWarnings(rule: NormRule): string[] {
    const warnings: string[] = [];
    const content = rule.content.toLowerCase();
    
    if (content.includes('danger') || content.includes('risque')) {
      warnings.push('⚠️ Non-respect = risque d\'accident grave');
    }
    if (content.includes('obligatoire') || content.includes('doit')) {
      warnings.push('⚠️ Règle obligatoire - application systématique requise');
    }
    if (content.includes('interdit') || content.includes('ne pas')) {
      warnings.push('⚠️ Pratique interdite par la norme');
    }
    
    if (warnings.length === 0) {
      warnings.push(`⚠️ Respecter les prescriptions de l'article ${rule.article}`);
    }
    
    return warnings;
  }
  
  /**
   * Génère les cas pratiques
   */
  private static generatePracticalCases(rules: NormRule[], request: NormativeCourseRequest): string {
    const theme = request.theme || 'sécurité électrique';
    
    return `## Cas pratique principal

**Contexte :** Dans une habitation en schéma TT, vous devez vérifier la conformité de l'installation électrique.

### Étape 1 : Vérification visuelle
- Présence du tableau de répartition
- État des connexions et serrages
- Identification des circuits

### Étape 2 : Vérification de la continuité du PE
1. Consigner l'installation (coupure générale)
2. Connecter l'ohmmètre entre PE du tableau et masse d'un appareil
3. La résistance doit être < 2 Ω

### Étape 3 : Test du DDR (Dispositif Différentiel Résiduel)
1. Appuyer sur le bouton test → le DDR doit déclencher
2. Mesurer le temps de déclenchement avec un contrôleur
3. Temps max : 40 ms pour In = 30 mA

### Étape 4 : Mesure de la résistance de terre
1. Utiliser un telluromètre
2. Planter les piquets auxiliaires
3. Résistance max : selon seuil de déclenchement du DDR

## Questions d'auto-évaluation

1. Quelle est la résistance maximale admissible pour la prise de terre en schéma TT avec DDR 30 mA ?
2. Comment vérifier la continuité du conducteur de protection ?
3. Quel est le temps de déclenchement maximal d'un DDR 30 mA ?`;
  }
  
  /**
   * Génère la synthèse et la checklist d'audit
   */
  private static generateSynthesisAndChecklist(rules: NormRule[]): string {
    const articles = rules.map(r => r.article).slice(0, 10);
    
    return `## Synthèse des points clés

Les règles étudiées imposent de respecter les principes suivants :

✅ **Protection contre les contacts directs** : Isolation, enveloppes, barrières
✅ **Protection contre les contacts indirects** : Mise à la terre + DDR
✅ **Protection contre les surintensités** : Disjoncteurs/fusibles dimensionnés
✅ **Vérification avant mise en service** : Essais et mesures obligatoires

---

## ✅ Checklist d'audit normative

### 1. Vérifications visuelles
- [ ] Tableau de répartition correctement installé
- [ ] Identification des circuits conforme
- [ ] Serrages et connexions en bon état
- [ ] Pas de conducteur apparent ou endommagé

### 2. Mesures électriques
- [ ] Continuité des conducteurs PE : < 2 Ω
- [ ] Résistance d'isolement : > 0,5 MΩ
- [ ] Résistance de terre : conforme au schéma
- [ ] Impédance de boucle : compatible avec les protections

### 3. Essais fonctionnels
- [ ] Test du bouton DDR : déclenchement OK
- [ ] Mesure temps de déclenchement DDR : < 40 ms
- [ ] Vérification de la sélectivité

### 4. Documentation
- [ ] Schémas électriques à jour
- [ ] Rapport de vérification établi
- [ ] Attestation de conformité (Consuel si applicable)

---

## Articles vérifiés

${articles.map(a => `- Article ${a} : ✓`).join('\n')}

**Rappel :** Cette checklist doit être complétée pour chaque installation vérifiée et conservée dans le dossier technique.`;
  }
  
  /**
   * Génère les QCM normatifs (10 questions, 4 choix, justification)
   */
  static generateNormativeQCM(rules: NormRule[], count: number = 10): QCMQuestion[] {
    const questions: QCMQuestion[] = [];
    const selectedRules = rules.filter(r => r.content.length > 50).slice(0, count);
    
    selectedRules.forEach((rule, idx) => {
      const question = this.createQCMFromRule(rule, idx);
      if (question) {
        questions.push(question);
      }
    });
    
    // Compléter avec des questions génériques si nécessaire
    while (questions.length < count && questions.length < 10) {
      questions.push(this.createGenericNormQuestion(questions.length));
    }
    
    return questions;
  }
  
  /**
   * Crée une question QCM à partir d'une règle
   */
  private static createQCMFromRule(rule: NormRule, index: number): QCMQuestion | null {
    const content = rule.content;
    
    // Extraire la première phrase significative
    const firstSentence = content.split('.')[0];
    if (firstSentence.length < 20) return null;
    
    return {
      id: `qcm-norm-${index}`,
      question: `Selon l'article ${rule.article} de la norme NS 01-001, quelle est l'affirmation correcte ?`,
      options: [
        firstSentence.substring(0, 150) + (firstSentence.length > 150 ? '...' : ''),
        'Cette règle s\'applique uniquement aux installations industrielles haute tension.',
        'Cette disposition est facultative et laissée à l\'appréciation de l\'installateur.',
        'L\'article mentionné a été abrogé par une révision récente de la norme.'
      ],
      correctAnswer: 0,
      explanation: `✅ Réponse correcte basée sur l'article ${rule.article} (page ${rule.page}) de la norme NS 01-001.\n\n📖 Section : ${rule.titre}\n\n📋 Texte complet : "${content.substring(0, 300)}..."`
    };
  }
  
  /**
   * Crée une question QCM générique sur les normes
   */
  private static createGenericNormQuestion(index: number): QCMQuestion {
    const genericQuestions = [
      {
        question: 'Quelle est la tension maximale couverte par la norme NS 01-001 en courant alternatif ?',
        options: ['1000 V', '400 V', '230 V', '500 V'],
        correctAnswer: 0,
        explanation: 'La norme NS 01-001 s\'applique aux installations jusqu\'à 1000 V en CA et 1500 V en CC.'
      },
      {
        question: 'Quel est le calibre de DDR obligatoire pour les circuits prises en habitation ?',
        options: ['30 mA', '300 mA', '100 mA', '500 mA'],
        correctAnswer: 0,
        explanation: 'Le DDR 30 mA (haute sensibilité) est obligatoire pour la protection des personnes.'
      },
      {
        question: 'Quelle est la résistance maximale de continuité du conducteur PE ?',
        options: ['2 Ω', '10 Ω', '0,5 Ω', '100 Ω'],
        correctAnswer: 0,
        explanation: 'La continuité du PE doit être inférieure à 2 Ω pour garantir la protection.'
      },
      {
        question: 'Quel schéma de liaison à la terre est le plus courant en France pour les habitations ?',
        options: ['TT', 'TN-S', 'IT', 'TN-C'],
        correctAnswer: 0,
        explanation: 'Le schéma TT (neutre à la terre, masses à la terre) est le standard pour les habitations.'
      },
      {
        question: 'Quel est le temps de déclenchement maximal d\'un DDR 30 mA ?',
        options: ['40 ms', '100 ms', '200 ms', '1 s'],
        correctAnswer: 0,
        explanation: 'Le DDR 30 mA doit déclencher en moins de 40 ms à In pour protéger contre la fibrillation.'
      }
    ];
    
    const q = genericQuestions[index % genericQuestions.length];
    return {
      id: `qcm-generic-${index}`,
      ...q
    };
  }
  
  /**
   * Crée les modules pédagogiques
   */
  private static createPedagogicalModules(rules: NormRule[], request: NormativeCourseRequest): Module[] {
    const titres = [...new Set(rules.map(r => r.titre))];
    
    return [
      {
        id: 'mod-intro',
        title: 'Introduction et enjeux',
        prerequisites: [],
        knowledge: ['Risques électriques', 'Cadre réglementaire', 'Responsabilités'],
        skills: ['Identifier les enjeux de sécurité', 'Comprendre le cadre normatif'],
        duration: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mod-normes',
        title: 'Fondements normatifs',
        prerequisites: ['Introduction et enjeux'],
        knowledge: ['Structure de la norme NS 01-001', 'Articles applicables'],
        skills: ['Rechercher une règle dans la norme', 'Interpréter les exigences'],
        duration: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mod-regles',
        title: 'Règles clés et application',
        prerequisites: ['Fondements normatifs'],
        knowledge: titres.slice(0, 3),
        skills: ['Appliquer les règles normatives', 'Choisir les protections adaptées'],
        duration: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mod-pratique',
        title: 'Cas pratiques et vérifications',
        prerequisites: ['Règles clés et application'],
        knowledge: ['Méthodes de mesure', 'Outils de vérification'],
        skills: ['Réaliser les mesures électriques', 'Vérifier la conformité'],
        duration: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mod-synthese',
        title: 'Synthèse et évaluation',
        prerequisites: ['Cas pratiques et vérifications'],
        knowledge: ['Checklist d\'audit', 'Points critiques'],
        skills: ['Rédiger un rapport de vérification', 'Valider une installation'],
        duration: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
  
  /**
   * Génère les ressources pédagogiques
   */
  private static generateResources(rules: NormRule[]): string[] {
    const articles = rules.map(r => r.article).slice(0, 5);
    
    return [
      'Norme NS 01-001 - Version complète',
      `Articles de référence : ${articles.join(', ')}`,
      'Guide UTE C 15-520 - Canalisations',
      'Guide UTE C 15-105 - Détermination des sections',
      'Formulaire de vérification des installations',
      'Checklist d\'audit normative (imprimable)',
    ];
  }
}

export default NormativeCourseGenerator;
