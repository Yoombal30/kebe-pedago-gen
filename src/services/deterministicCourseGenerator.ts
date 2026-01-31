/**
 * Service de génération de cours DÉTERMINISTE - Fonctionne SANS IA
 * 
 * Ce service implémente toute la logique métier pour créer des cours structurés
 * à partir de documents importés, sans aucune dépendance à un moteur IA externe.
 * 
 * Intègre désormais les 1994 règles de la norme NS 01-001 pour enrichir
 * automatiquement les formations en sécurité électrique.
 */

import { Course, CourseSection, Module, Document, QCMQuestion, GenerationSettings } from '@/types';
import { NormRule } from '@/types/norms';
import { normService } from '@/services/normService';

export interface ParsedDocument {
  title: string;
  sections: ParsedSection[];
  concepts: string[];
  keywords: string[];
  metadata: DocumentMetadata;
}

export interface ParsedSection {
  level: number; // 1 = titre principal, 2 = sous-titre, etc.
  title: string;
  content: string;
  bulletPoints: string[];
  tables: string[][];
  isDefinition: boolean;
  isWarning: boolean;
  isExample: boolean;
}

export interface DocumentMetadata {
  wordCount: number;
  paragraphCount: number;
  hasTableOfContents: boolean;
  estimatedReadingTime: number; // minutes
  language: 'fr' | 'en';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface GenerationResult {
  course: Course;
  generatedWithAI: boolean;
  warnings: string[];
  normRulesUsed: number;
  processingStats: {
    documentsProcessed: number;
    sectionsCreated: number;
    qcmGenerated: number;
    processingTimeMs: number;
  };
}

export class DeterministicCourseGenerator {
  
  /**
   * Analyse structurée d'un document texte
   */
  static parseDocument(content: string, fileName: string): ParsedDocument {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;
    
    // Patterns de détection
    const titlePatterns = [
      /^#{1,3}\s+(.+)$/,                    // Markdown headers
      /^(CHAPITRE|PARTIE|SECTION|MODULE)\s+\d*\s*[:.\-]?\s*(.+)/i,
      /^(\d+\.)+\s+(.+)/,                    // Numbered sections
      /^[A-Z][A-Z\s]{5,}$/,                  // ALL CAPS titles
      /^[IVX]+\.\s+(.+)/i,                   // Roman numerals
    ];
    
    const warningPatterns = [
      /⚠️|⚡|🚨|attention|avertissement|important|danger|précaution/i,
      /^ATTENTION\s*[:!]/i,
      /^IMPORTANT\s*[:!]/i,
    ];
    
    const examplePatterns = [
      /exemple\s*[:]/i,
      /par exemple/i,
      /cas pratique/i,
      /illustration/i,
    ];
    
    const definitionPatterns = [
      /^définition\s*[:]/i,
      /signifie\s*[:]/i,
      /désigne\s*[:]/i,
    ];
    
    const bulletPattern = /^[\-•*]\s+(.+)/;
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      
      // Détecter les titres
      let isTitle = false;
      let titleLevel = 0;
      let titleText = trimmed;
      
      for (const pattern of titlePatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          isTitle = true;
          titleText = match[match.length - 1] || trimmed;
          titleLevel = trimmed.startsWith('###') ? 3 : trimmed.startsWith('##') ? 2 : 1;
          break;
        }
      }
      
      if (isTitle) {
        // Sauvegarder la section précédente
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          level: titleLevel,
          title: titleText,
          content: '',
          bulletPoints: [],
          tables: [],
          isDefinition: false,
          isWarning: false,
          isExample: false,
        };
      } else if (currentSection) {
        // Détecter les points
        const bulletMatch = trimmed.match(bulletPattern);
        if (bulletMatch) {
          currentSection.bulletPoints.push(bulletMatch[1]);
        } else {
          currentSection.content += trimmed + ' ';
        }
        
        // Détecter les types spéciaux
        if (warningPatterns.some(p => p.test(trimmed))) {
          currentSection.isWarning = true;
        }
        if (examplePatterns.some(p => p.test(trimmed))) {
          currentSection.isExample = true;
        }
        if (definitionPatterns.some(p => p.test(trimmed))) {
          currentSection.isDefinition = true;
        }
      } else {
        // Première section sans titre explicite
        currentSection = {
          level: 1,
          title: 'Introduction',
          content: trimmed + ' ',
          bulletPoints: [],
          tables: [],
          isDefinition: false,
          isWarning: false,
          isExample: false,
        };
      }
    });
    
    // Ajouter la dernière section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // Extraire les concepts clés
    const concepts = this.extractConcepts(content);
    const keywords = this.extractKeywords(content);
    const metadata = this.analyzeMetadata(content);
    
    return {
      title: this.extractTitle(fileName, sections),
      sections,
      concepts,
      keywords,
      metadata,
    };
  }
  
  /**
   * Extraction des concepts clés par analyse fréquentielle
   */
  private static extractConcepts(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^a-zàâäéèêëïîôùûüÿç\s]/gi, ' ')
      .split(/\s+/)
      .filter(word => word.length > 6);
    
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Filtrer les mots communs
    const stopWords = ['également', 'cependant', 'toutefois', 'notamment', 'concernant', 'différents', 'plusieurs', 'certains', 'ensemble', 'toujours'];
    
    return Object.entries(frequency)
      .filter(([word]) => !stopWords.includes(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }
  
  /**
   * Extraction des mots-clés techniques
   */
  private static extractKeywords(content: string): string[] {
    const technicalTerms = [
      'sécurité', 'procédure', 'réglementation', 'norme', 'conformité',
      'formation', 'compétence', 'évaluation', 'objectif', 'méthode',
      'technique', 'protocole', 'processus', 'système', 'gestion',
      'qualité', 'risque', 'prévention', 'contrôle', 'audit',
      'certification', 'accréditation', 'habilitation', 'autorisation'
    ];
    
    const contentLower = content.toLowerCase();
    return technicalTerms.filter(term => contentLower.includes(term));
  }
  
  /**
   * Analyse des métadonnées du document
   */
  private static analyzeMetadata(content: string): DocumentMetadata {
    const words = content.split(/\s+/).length;
    const paragraphs = content.split(/\n\s*\n/).length;
    const hasTableOfContents = /table\s+des\s+mati[eè]res|sommaire/i.test(content);
    
    // Estimation du temps de lecture (250 mots/minute)
    const readingTime = Math.ceil(words / 250);
    
    // Détection de la langue
    const frenchIndicators = (content.match(/\b(le|la|les|du|des|un|une|et|est|dans|pour|sur|avec)\b/gi) || []).length;
    const englishIndicators = (content.match(/\b(the|a|an|is|are|in|on|with|for|to|and)\b/gi) || []).length;
    const language = frenchIndicators > englishIndicators ? 'fr' : 'en';
    
    // Estimation de la difficulté
    const technicalTermCount = this.extractKeywords(content).length;
    const avgWordLength = words > 0 ? content.replace(/\s/g, '').length / words : 0;
    
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    if (technicalTermCount < 5 && avgWordLength < 6) difficulty = 'beginner';
    if (technicalTermCount > 12 || avgWordLength > 8) difficulty = 'advanced';
    
    return {
      wordCount: words,
      paragraphCount: paragraphs,
      hasTableOfContents,
      estimatedReadingTime: readingTime,
      language,
      difficulty,
    };
  }
  
  /**
   * Extraire le titre du document
   */
  private static extractTitle(fileName: string, sections: ParsedSection[]): string {
    // Chercher un titre de niveau 1
    const mainTitle = sections.find(s => s.level === 1);
    if (mainTitle && mainTitle.title.length > 5 && mainTitle.title.length < 100) {
      return mainTitle.title;
    }
    
    // Utiliser le nom de fichier nettoyé
    return fileName
      .replace(/\.(pdf|docx?|txt)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  
  /**
   * GÉNÉRATION DE COURS COMPLÈTE SANS IA
   * Enrichit automatiquement avec les règles normatives NS 01-001
   */
  static generateCourse(
    documents: Document[],
    settings: GenerationSettings,
    customInstructions?: string,
    selectedNormRules?: NormRule[]
  ): GenerationResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    let normRulesUsed = 0;
    
    // Parser tous les documents
    const parsedDocs = documents.map(doc => 
      this.parseDocument(doc.content || '', doc.name)
    );
    
    // Fusionner et analyser
    const allSections = parsedDocs.flatMap(d => d.sections);
    const allConcepts = [...new Set(parsedDocs.flatMap(d => d.concepts))];
    const allKeywords = [...new Set(parsedDocs.flatMap(d => d.keywords))];
    
    // Enrichissement normatif automatique si le service est chargé
    let normRules: NormRule[] = selectedNormRules || [];
    if (normRules.length === 0 && normService.isLoaded()) {
      // Rechercher automatiquement des règles pertinentes
      const searchTerms = [...allConcepts, ...allKeywords].slice(0, 5);
      for (const term of searchTerms) {
        const results = normService.searchRules(term, 3);
        normRules.push(...results.map(r => r.rule));
      }
      // Dédupliquer
      normRules = normRules.filter((rule, idx, arr) => 
        arr.findIndex(r => r.id === rule.id) === idx
      );
      normRulesUsed = normRules.length;
    }
    
    // Créer les modules
    const modules = this.createModules(parsedDocs, allConcepts);
    
    // Créer les sections du cours (enrichies avec les normes)
    let courseSections = this.createCourseSections(allSections, settings);
    
    // Enrichir avec les règles normatives
    if (normRules.length > 0) {
      courseSections = this.enrichSectionsWithNorms(courseSections, normRules);
    }
    
    // Générer le QCM (inclure des questions sur les normes)
    let qcm = settings.includeQCM 
      ? this.generateQCM(allSections, allConcepts, settings.qcmQuestionCount)
      : [];
    
    if (normRules.length > 0 && settings.includeQCM) {
      const normQCM = this.generateNormQCM(normRules, Math.min(5, settings.qcmQuestionCount));
      qcm = [...qcm.slice(0, settings.qcmQuestionCount - normQCM.length), ...normQCM];
    }
    
    // Générer l'introduction
    const introduction = settings.includeIntroduction
      ? this.generateIntroduction(parsedDocs, allConcepts, allKeywords, normRules.length)
      : '';
    
    // Générer la conclusion
    const conclusion = settings.includeConclusion
      ? this.generateConclusion(parsedDocs, allConcepts)
      : '';
    
    // Créer les ressources
    const resources = this.generateResources(allKeywords, allConcepts, normRules);
    
    // Construire le cours
    const course: Course = {
      id: `course-${Date.now()}`,
      title: this.generateCourseTitle(parsedDocs),
      modules,
      documents,
      content: {
        introduction,
        sections: courseSections,
        conclusion,
        qcm,
        resources,
      },
      generatedAt: new Date(),
      lastModified: new Date(),
    };
    
    const processingTime = Date.now() - startTime;
    
    return {
      course,
      generatedWithAI: false,
      warnings,
      normRulesUsed,
      processingStats: {
        documentsProcessed: documents.length,
        sectionsCreated: courseSections.length,
        qcmGenerated: qcm.length,
        processingTimeMs: processingTime,
      },
    };
  }
  
  /**
   * Enrichit les sections avec les règles normatives NS 01-001
   */
  private static enrichSectionsWithNorms(
    sections: CourseSection[], 
    normRules: NormRule[]
  ): CourseSection[] {
    return sections.map((section, idx) => {
      // Trouver des règles pertinentes pour cette section
      const sectionContent = `${section.title} ${section.explanation}`.toLowerCase();
      const relevantRules = normRules.filter(rule => 
        sectionContent.includes(rule.article.toLowerCase()) ||
        rule.content.toLowerCase().split(' ').some(word => 
          word.length > 5 && sectionContent.includes(word)
        )
      ).slice(0, 2);
      
      if (relevantRules.length === 0) return section;
      
      // Ajouter les références normatives
      const normReferences = relevantRules.map(rule => 
        `📋 Art. ${rule.article} (NS 01-001, p.${rule.page}): ${rule.content.substring(0, 150)}...`
      );
      
      return {
        ...section,
        explanation: section.explanation + 
          '\n\n**Références normatives :**\n' + 
          normReferences.join('\n\n'),
        warnings: [
          ...section.warnings,
          ...relevantRules
            .filter(r => r.content.toLowerCase().includes('danger') || r.content.toLowerCase().includes('attention'))
            .map(r => `⚠️ ${r.content.substring(0, 100)}... (Art. ${r.article})`)
        ]
      };
    });
  }
  
  /**
   * Génère des questions QCM basées sur les règles normatives
   */
  private static generateNormQCM(normRules: NormRule[], count: number): QCMQuestion[] {
    const questions: QCMQuestion[] = [];
    const selectedRules = normRules.slice(0, count);
    
    selectedRules.forEach((rule, idx) => {
      // Extraire le concept clé de la règle
      const content = rule.content.substring(0, 200);
      
      questions.push({
        id: `qcm-norm-${idx}`,
        question: `Selon l'article ${rule.article} de la norme NS 01-001, quelle affirmation est correcte ?`,
        options: [
          content.split('.')[0] + '.',
          'Cette règle ne s\'applique qu\'aux installations industrielles.',
          'Cette disposition est optionnelle selon le contexte.',
          'L\'article mentionné traite d\'un autre sujet.'
        ],
        correctAnswer: 0,
        explanation: `Article ${rule.article} (page ${rule.page}) - ${rule.titre}: "${content}"`,
      });
    });
    
    return questions;
  }
  
  /**
   * Créer les modules de formation
   */
  private static createModules(parsedDocs: ParsedDocument[], concepts: string[]): Module[] {
    const modules: Module[] = [];
    
    parsedDocs.forEach((doc, docIndex) => {
      // Grouper les sections par niveau 1
      const mainSections = doc.sections.filter(s => s.level === 1);
      
      if (mainSections.length > 0) {
        mainSections.forEach((section, sectionIndex) => {
          modules.push({
            id: `module-${docIndex}-${sectionIndex}`,
            title: section.title,
            prerequisites: sectionIndex > 0 ? [mainSections[sectionIndex - 1].title] : [],
            knowledge: concepts.slice(sectionIndex * 3, (sectionIndex + 1) * 3),
            skills: this.generateSkills(section),
            duration: Math.max(1, Math.ceil(section.content.length / 2000)),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      } else {
        // Document sans sections claires = 1 module
        modules.push({
          id: `module-${docIndex}`,
          title: doc.title,
          prerequisites: [],
          knowledge: concepts.slice(0, 5),
          skills: ['Comprendre les concepts fondamentaux', 'Appliquer les principes de base'],
          duration: Math.max(1, doc.metadata.estimatedReadingTime / 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
    
    return modules;
  }
  
  /**
   * Générer les compétences à partir d'une section
   */
  private static generateSkills(section: ParsedSection): string[] {
    const skills: string[] = [];
    const content = section.content.toLowerCase();
    
    const skillPatterns = [
      { pattern: /savoir|connaître/i, skill: 'Connaître et maîtriser les concepts clés' },
      { pattern: /appliquer|mettre en œuvre/i, skill: 'Appliquer les procédures en situation réelle' },
      { pattern: /analyser|évaluer/i, skill: 'Analyser et évaluer les situations' },
      { pattern: /créer|concevoir/i, skill: 'Concevoir des solutions adaptées' },
      { pattern: /identifier|reconnaître/i, skill: 'Identifier les éléments critiques' },
      { pattern: /gérer|organiser/i, skill: 'Gérer et organiser efficacement' },
    ];
    
    skillPatterns.forEach(({ pattern, skill }) => {
      if (pattern.test(content) && skills.length < 4) {
        skills.push(skill);
      }
    });
    
    if (skills.length === 0) {
      skills.push(`Maîtriser les fondamentaux de ${section.title.toLowerCase()}`);
    }
    
    return skills;
  }
  
  /**
   * Créer les sections du cours
   */
  private static createCourseSections(
    parsedSections: ParsedSection[], 
    settings: GenerationSettings
  ): CourseSection[] {
    return parsedSections
      .filter(s => s.content.length > 50 || s.bulletPoints.length > 0)
      .map((section, index) => ({
        id: `section-${index}`,
        title: section.title,
        explanation: this.formatExplanation(section),
        examples: settings.addExamples 
          ? this.extractExamples(section)
          : [],
        warnings: settings.addWarnings
          ? this.extractWarnings(section)
          : [],
        illustrations: [],
      }));
  }
  
  /**
   * Formater l'explication d'une section
   */
  private static formatExplanation(section: ParsedSection): string {
    let explanation = section.content.trim();
    
    if (section.bulletPoints.length > 0) {
      explanation += '\n\n**Points clés :**\n';
      section.bulletPoints.forEach(point => {
        explanation += `• ${point}\n`;
      });
    }
    
    return explanation;
  }
  
  /**
   * Extraire les exemples d'une section
   */
  private static extractExamples(section: ParsedSection): string[] {
    const examples: string[] = [];
    
    if (section.isExample) {
      // La section entière est un exemple
      examples.push(section.content.substring(0, 200));
    }
    
    // Chercher des exemples dans le contenu
    const exampleMatches = section.content.match(/exemple\s*:\s*([^.]+\.)/gi);
    if (exampleMatches) {
      examples.push(...exampleMatches.map(m => m.replace(/^exemple\s*:\s*/i, '').trim()));
    }
    
    // Ajouter des exemples génériques si nécessaire
    if (examples.length === 0 && section.content.length > 100) {
      examples.push(`Application pratique des concepts de ${section.title.toLowerCase()}`);
    }
    
    return examples.slice(0, 3);
  }
  
  /**
   * Extraire les avertissements
   */
  private static extractWarnings(section: ParsedSection): string[] {
    const warnings: string[] = [];
    
    if (section.isWarning) {
      warnings.push(section.content.substring(0, 150));
    }
    
    // Chercher des mises en garde dans le contenu
    const warningMatches = section.content.match(/(attention|important|ne pas|éviter|danger)\s*:\s*([^.]+\.)/gi);
    if (warningMatches) {
      warnings.push(...warningMatches.slice(0, 2));
    }
    
    return warnings;
  }
  
  /**
   * GÉNÉRATION DE QCM DÉTERMINISTE
   */
  static generateQCM(
    sections: ParsedSection[], 
    concepts: string[], 
    questionCount: number
  ): QCMQuestion[] {
    const questions: QCMQuestion[] = [];
    
    // Questions basées sur les sections
    sections.slice(0, Math.min(sections.length, questionCount)).forEach((section, index) => {
      if (section.content.length > 100) {
        questions.push(this.createQuestionFromSection(section, index));
      }
    });
    
    // Compléter avec des questions sur les concepts
    while (questions.length < questionCount && concepts.length > questions.length) {
      const concept = concepts[questions.length];
      questions.push(this.createQuestionFromConcept(concept, questions.length));
    }
    
    return questions.slice(0, questionCount);
  }
  
  /**
   * Créer une question à partir d'une section
   */
  private static createQuestionFromSection(section: ParsedSection, index: number): QCMQuestion {
    const title = section.title;
    
    // Générer des options basées sur le contenu
    const mainConcepts = section.content
      .split(/[.,;]/)
      .filter(s => s.trim().length > 20 && s.trim().length < 100)
      .slice(0, 4);
    
    let options = [
      `Comprendre et appliquer les principes de ${title.toLowerCase()}`,
      `Ignorer les règles de ${title.toLowerCase()}`,
      `Appliquer partiellement les concepts`,
      `Reporter l'application à plus tard`,
    ];
    
    if (mainConcepts.length >= 2) {
      options[0] = mainConcepts[0].trim();
    }
    
    return {
      id: `qcm-${index}`,
      question: `Concernant "${title}", quelle est la bonne pratique ?`,
      options,
      correctAnswer: 0,
      explanation: `La bonne réponse est la première option car elle correspond aux principes établis dans la section "${title}".`,
    };
  }
  
  /**
   * Créer une question à partir d'un concept
   */
  private static createQuestionFromConcept(concept: string, index: number): QCMQuestion {
    return {
      id: `qcm-concept-${index}`,
      question: `Que signifie le concept de "${concept}" dans ce contexte ?`,
      options: [
        `Un élément fondamental de la formation`,
        `Un détail optionnel`,
        `Une notion dépassée`,
        `Un terme sans importance`,
      ],
      correctAnswer: 0,
      explanation: `"${concept}" est un concept clé identifié dans les documents sources, constituant un élément fondamental de la formation.`,
    };
  }
  
  /**
   * Générer l'introduction du cours
   */
  private static generateIntroduction(
    parsedDocs: ParsedDocument[], 
    concepts: string[], 
    keywords: string[],
    normRulesCount: number = 0
  ): string {
    const mainDoc = parsedDocs[0];
    const totalReadingTime = parsedDocs.reduce((acc, doc) => acc + doc.metadata.estimatedReadingTime, 0);
    
    let intro = `## Bienvenue dans cette formation

Cette formation professionnelle a été créée à partir de ${parsedDocs.length} document(s) source(s) pour vous permettre d'acquérir les compétences essentielles.

### Objectifs pédagogiques

À l'issue de cette formation, vous serez capable de :
${concepts.slice(0, 5).map(c => `- Maîtriser les concepts liés à **${c}**`).join('\n')}

### Durée estimée

- **Temps de lecture** : ${totalReadingTime} minutes
- **Niveau** : ${mainDoc.metadata.difficulty === 'beginner' ? 'Débutant' : mainDoc.metadata.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}`;

    if (normRulesCount > 0) {
      intro += `\n- **Références normatives** : ${normRulesCount} articles NS 01-001 intégrés`;
    }

    intro += `

### Mots-clés

${keywords.slice(0, 8).map(k => `\`${k}\``).join(' • ')}

---

Naviguez dans les sections ci-dessous pour découvrir le contenu de la formation.`;

    return intro;
  }
  
  /**
   * Générer la conclusion du cours
   */
  private static generateConclusion(parsedDocs: ParsedDocument[], concepts: string[]): string {
    return `## Conclusion

Vous avez maintenant parcouru l'ensemble du contenu de cette formation.

### Récapitulatif des acquis

Les concepts clés abordés dans cette formation :
${concepts.slice(0, 6).map(c => `- ${c}`).join('\n')}

### Prochaines étapes

1. **Réviser** les points essentiels de chaque section
2. **Passer le QCM** pour valider vos acquis
3. **Appliquer** les connaissances en situation réelle
4. **Consulter** les ressources complémentaires

### Certification

Une fois le QCM validé avec un score minimum de 80%, vous pourrez télécharger votre attestation de formation.

---

*Formation générée automatiquement par Professeur KEBE*`;
  }
  
  /**
   * Générer les ressources complémentaires
   */
  private static generateResources(keywords: string[], concepts: string[], normRules?: NormRule[]): string[] {
    const resources: string[] = [
      'Documentation technique approfondie',
      'Guide des bonnes pratiques',
    ];
    
    keywords.slice(0, 3).forEach(keyword => {
      resources.push(`Référentiel ${keyword}`);
    });
    
    if (normRules && normRules.length > 0) {
      resources.push('Norme NS 01-001 - Sécurité des installations électriques');
      resources.push(`${normRules.length} articles normatifs référencés`);
    }
    
    resources.push('Support de cours téléchargeable');
    resources.push('FAQ et assistance');
    
    return resources;
  }
  
  /**
   * Générer le titre du cours
   */
  private static generateCourseTitle(parsedDocs: ParsedDocument[]): string {
    if (parsedDocs.length === 1) {
      return `Formation : ${parsedDocs[0].title}`;
    }
    
    const commonConcepts = parsedDocs[0].concepts.filter(c => 
      parsedDocs.every(doc => doc.concepts.includes(c))
    );
    
    if (commonConcepts.length > 0) {
      return `Formation ${commonConcepts[0]} - Programme complet`;
    }
    
    return `Formation professionnelle complète (${parsedDocs.length} modules)`;
  }
}
