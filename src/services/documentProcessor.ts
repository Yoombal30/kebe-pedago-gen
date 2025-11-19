import { Document } from '@/types';

export class DocumentProcessor {
  /**
   * Extrait le contenu textuel d'un fichier
   */
  static async extractText(file: File): Promise<string> {
    const fileType = file.type;

    if (fileType === 'text/plain') {
      return await this.extractFromText(file);
    } else if (fileType === 'application/pdf') {
      return await this.extractFromPDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      return await this.extractFromWord(file);
    }

    throw new Error(`Type de fichier non supporté: ${fileType}`);
  }

  private static async extractFromText(file: File): Promise<string> {
    return await file.text();
  }

  private static async extractFromPDF(file: File): Promise<string> {
    try {
      // Pour une vraie extraction PDF, utiliser pdf-parse ou pdf.js
      // Ici on simule l'extraction
      const arrayBuffer = await file.arrayBuffer();
      
      // Simulation: dans un vrai cas, utiliser une bibliothèque comme pdf-parse
      // const pdf = require('pdf-parse');
      // const data = await pdf(Buffer.from(arrayBuffer));
      // return data.text;

      return `Contenu extrait du PDF: ${file.name}\n\nNote: L'extraction complète du PDF nécessite une bibliothèque côté serveur.\nPour l'instant, utilisez la fonctionnalité d'analyse avec l'IA pour traiter le document.`;
    } catch (error) {
      console.error('Erreur extraction PDF:', error);
      throw new Error('Impossible d\'extraire le contenu du PDF');
    }
  }

  private static async extractFromWord(file: File): Promise<string> {
    try {
      // Pour une vraie extraction Word, utiliser mammoth.js
      // Ici on simule l'extraction
      const arrayBuffer = await file.arrayBuffer();

      // Simulation: dans un vrai cas, utiliser mammoth
      // const mammoth = require('mammoth');
      // const result = await mammoth.extractRawText({ arrayBuffer });
      // return result.value;

      return `Contenu extrait du document Word: ${file.name}\n\nNote: L'extraction complète du Word nécessite une bibliothèque dédiée.\nPour l'instant, utilisez la fonctionnalité d'analyse avec l'IA pour traiter le document.`;
    } catch (error) {
      console.error('Erreur extraction Word:', error);
      throw new Error('Impossible d\'extraire le contenu du document Word');
    }
  }

  /**
   * Analyse le contenu pour identifier les structures pédagogiques
   */
  static analyzeContent(content: string): {
    concepts: string[];
    keywords: string[];
    suggestedModules: string[];
  } {
    // Analyse basique par mots-clés
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    const words = content.toLowerCase().split(/\s+/);

    // Identifier les concepts (mots de plus de 5 lettres fréquents)
    const wordFrequency: Record<string, number> = {};
    words.forEach((word) => {
      const cleaned = word.replace(/[^a-zàâäéèêëïîôùûüÿç]/gi, '');
      if (cleaned.length > 5) {
        wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
      }
    });

    const concepts = Object.entries(wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // Identifier les mots-clés techniques
    const technicalKeywords = [
      'sécurité',
      'procédure',
      'méthode',
      'technique',
      'formation',
      'compétence',
      'connaissance',
      'pratique',
      'théorie',
      'application',
    ];

    const keywords = technicalKeywords.filter((keyword) =>
      content.toLowerCase().includes(keyword)
    );

    // Suggérer des modules basés sur les titres et structures
    const suggestedModules: string[] = [];
    lines.forEach((line) => {
      // Identifier les lignes qui ressemblent à des titres (courtes, en majuscules, etc.)
      if (
        line.length < 100 &&
        (line === line.toUpperCase() || /^(Chapitre|Module|Partie|Section)/i.test(line))
      ) {
        suggestedModules.push(line.trim());
      }
    });

    return {
      concepts: concepts.slice(0, 5),
      keywords,
      suggestedModules: suggestedModules.slice(0, 5),
    };
  }

  /**
   * Prépare un prompt pour l'IA basé sur les documents
   */
  static prepareAIPrompt(documents: Document[], analysis: ReturnType<typeof DocumentProcessor.analyzeContent>): string {
    let prompt = `Créer une formation professionnelle complète basée sur les documents suivants:\n\n`;

    documents.forEach((doc) => {
      prompt += `Document: ${doc.name}\n`;
      if (doc.content) {
        prompt += `Contenu: ${doc.content.substring(0, 500)}...\n\n`;
      }
    });

    prompt += `\nConcepts identifiés: ${analysis.concepts.join(', ')}\n`;
    prompt += `Mots-clés: ${analysis.keywords.join(', ')}\n`;

    if (analysis.suggestedModules.length > 0) {
      prompt += `\nModules suggérés:\n${analysis.suggestedModules.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n`;
    }

    prompt += `\nVeuillez créer une formation structurée avec:
- Une introduction engageante
- Des modules progressifs avec objectifs pédagogiques clairs
- Des sections détaillées avec explications, exemples et points d'attention
- Un QCM de 10 questions pour valider les acquis
- Une conclusion synthétique
- Des ressources complémentaires

Format de réponse attendu en JSON avec la structure suivante:
{
  "title": "Titre de la formation",
  "introduction": "Introduction détaillée",
  "modules": [
    {
      "title": "Titre du module",
      "duration": 2,
      "prerequisites": ["prérequis"],
      "knowledge": ["connaissances acquises"],
      "skills": ["compétences développées"]
    }
  ],
  "sections": [
    {
      "title": "Titre de la section",
      "explanation": "Explication détaillée",
      "examples": ["exemple 1", "exemple 2"],
      "warnings": ["point d'attention"]
    }
  ],
  "qcm": [
    {
      "question": "Question",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "Explication de la réponse"
    }
  ],
  "conclusion": "Conclusion",
  "resources": ["ressource 1", "ressource 2"]
}`;

    return prompt;
  }
}
