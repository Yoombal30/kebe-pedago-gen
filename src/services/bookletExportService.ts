/**
 * Service d'export de livrets (Formateur/Apprenant)
 * et fiches d'audit terrain
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak
} from 'docx';
import { saveAs } from 'file-saver';
import { Course, QCMQuestion, CourseSection } from '@/types';

type BookletType = 'trainer' | 'learner' | 'audit';

export class BookletExportService {
  /**
   * Export livret formateur
   */
  static async exportTrainerBooklet(course: Course): Promise<void> {
    const doc = this.createBooklet(course, 'trainer');
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${this.sanitizeFilename(course.title)}_Livret_Formateur.docx`);
  }

  /**
   * Export livret apprenant
   */
  static async exportLearnerBooklet(course: Course): Promise<void> {
    const doc = this.createBooklet(course, 'learner');
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${this.sanitizeFilename(course.title)}_Livret_Apprenant.docx`);
  }

  /**
   * Export fiche audit terrain
   */
  static async exportAuditSheet(course: Course): Promise<void> {
    const doc = this.createBooklet(course, 'audit');
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${this.sanitizeFilename(course.title)}_Fiche_Audit.docx`);
  }

  private static sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9àâäéèêëïîôùûüÿç\s]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  private static createBooklet(course: Course, type: BookletType): Document {
    const sections = [];

    // Page de titre
    sections.push(...this.createTitlePage(course, type));

    // Contenu spécifique selon le type
    if (type === 'trainer') {
      sections.push(...this.createTrainerContent(course));
    } else if (type === 'learner') {
      sections.push(...this.createLearnerContent(course));
    } else {
      sections.push(...this.createAuditContent(course));
    }

    return new Document({
      sections: [{
        properties: {},
        children: sections,
      }],
    });
  }

  private static createTitlePage(course: Course, type: BookletType): Paragraph[] {
    const typeLabels = {
      trainer: 'LIVRET FORMATEUR',
      learner: 'LIVRET APPRENANT',
      audit: 'FICHE D\'AUDIT TERRAIN',
    };

    return [
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({
            text: typeLabels[type],
            bold: true,
            size: 32,
            color: '1E40AF',
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({
            text: course.title,
            bold: true,
            size: 48,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
            size: 22,
            color: '6B7280',
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Professeur KEBE - Plateforme pédagogique',
            size: 20,
            color: '9CA3AF',
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new PageBreak()],
      }),
    ];
  }

  private static createTrainerContent(course: Course): Paragraph[] {
    const content: Paragraph[] = [];

    // Guide du formateur
    content.push(
      new Paragraph({
        text: 'GUIDE DU FORMATEUR',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Objectifs pédagogiques',
            bold: true,
          }),
        ],
      })
    );

    // Objectifs
    course.modules.forEach((module) => {
      module.skills.forEach((skill) => {
        content.push(
          new Paragraph({
            text: `• ${skill}`,
            indent: { left: 400 },
          })
        );
      });
    });

    content.push(new Paragraph({ text: '' }));

    // Déroulé pédagogique
    content.push(
      new Paragraph({
        text: 'Déroulé pédagogique',
        heading: HeadingLevel.HEADING_2,
      })
    );

    course.content.sections.forEach((section, i) => {
      content.push(
        new Paragraph({
          text: `${i + 1}. ${section.title}`,
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Points clés à aborder :',
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          text: section.explanation.substring(0, 300) + '...',
          indent: { left: 400 },
        })
      );

      // Notes pour le formateur
      if (section.warnings.length > 0) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '⚠️ Points d\'attention à souligner :',
                bold: true,
                color: 'D97706',
              }),
            ],
          })
        );
        section.warnings.forEach((w) => {
          content.push(
            new Paragraph({
              text: `• ${w}`,
              indent: { left: 400 },
            })
          );
        });
      }

      content.push(new Paragraph({ text: '' }));
    });

    // Corrigé QCM
    if (course.content.qcm.length > 0) {
      content.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
        new Paragraph({
          text: 'CORRIGÉ DU QCM',
          heading: HeadingLevel.HEADING_1,
        })
      );

      course.content.qcm.forEach((q, i) => {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Q${i + 1}. ${q.question}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Réponse correcte : `,
                bold: true,
                color: '059669',
              }),
              new TextRun({
                text: `${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}`,
              }),
            ],
            indent: { left: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Justification : ',
                italics: true,
              }),
              new TextRun({
                text: q.explanation,
                italics: true,
                color: '6B7280',
              }),
            ],
            indent: { left: 400 },
          }),
          new Paragraph({ text: '' })
        );
      });
    }

    return content;
  }

  private static createLearnerContent(course: Course): Paragraph[] {
    const content: Paragraph[] = [];

    // Introduction
    content.push(
      new Paragraph({
        text: 'INTRODUCTION',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: course.content.introduction.replace(/[#*`]/g, ''),
      }),
      new Paragraph({ text: '' })
    );

    // Contenu des sections (sans les réponses)
    content.push(
      new Paragraph({
        text: 'CONTENU DE LA FORMATION',
        heading: HeadingLevel.HEADING_1,
      })
    );

    course.content.sections.forEach((section, i) => {
      content.push(
        new Paragraph({
          text: `${i + 1}. ${section.title}`,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: section.explanation.replace(/[#*`]/g, ''),
        })
      );

      if (section.examples.length > 0) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '💡 Exemples :',
                bold: true,
              }),
            ],
          })
        );
        section.examples.forEach((ex) => {
          content.push(
            new Paragraph({
              text: `• ${ex}`,
              indent: { left: 400 },
            })
          );
        });
      }

      content.push(new Paragraph({ text: '' }));
    });

    // QCM sans réponses
    if (course.content.qcm.length > 0) {
      content.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
        new Paragraph({
          text: 'ÉVALUATION',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Répondez aux questions suivantes pour valider vos acquis.',
              italics: true,
            }),
          ],
        }),
        new Paragraph({ text: '' })
      );

      course.content.qcm.forEach((q, i) => {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Question ${i + 1}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            text: q.question,
          })
        );

        q.options.forEach((opt, j) => {
          content.push(
            new Paragraph({
              text: `☐ ${String.fromCharCode(65 + j)}. ${opt}`,
              indent: { left: 400 },
            })
          );
        });

        content.push(new Paragraph({ text: '' }));
      });
    }

    // Zone de notes
    content.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({
        text: 'NOTES PERSONNELLES',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: '____________________________________________',
      }),
      new Paragraph({
        text: '____________________________________________',
      }),
      new Paragraph({
        text: '____________________________________________',
      }),
      new Paragraph({
        text: '____________________________________________',
      }),
      new Paragraph({
        text: '____________________________________________',
      })
    );

    return content;
  }

  private static createAuditContent(course: Course): Paragraph[] {
    const content: Paragraph[] = [];

    // En-tête audit
    content.push(
      new Paragraph({
        text: 'INFORMATIONS GÉNÉRALES',
        heading: HeadingLevel.HEADING_1,
      })
    );

    // Tableau d'informations
    // Table d'informations sous forme de paragraphes
    content.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Date de l\'audit : ', bold: true }),
          new TextRun({ text: '____/____/________' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Auditeur : ', bold: true }),
          new TextRun({ text: '________________________________' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Site / Installation : ', bold: true }),
          new TextRun({ text: '________________________________' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Responsable site : ', bold: true }),
          new TextRun({ text: '________________________________' }),
        ],
      })
    );
    
    // Placeholder pour éviter les erreurs - on garde la même variable
    const infoTable = [
      this.createTableRow('Date de l\'audit :', '____/____/________'),
      this.createTableRow('Auditeur :', '________________________________'),
    ];
    // Info table rows not pushed - using paragraph version above
    void infoTable;
    content.push(new Paragraph({ text: '' }));

    // Checklist basée sur les sections
    content.push(
      new Paragraph({
        text: 'POINTS DE CONTRÔLE',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Vérifiez chaque point et cochez la case correspondante.',
            italics: true,
          }),
        ],
      }),
      new Paragraph({ text: '' })
    );

    course.content.sections.forEach((section, i) => {
      content.push(
        new Paragraph({
          text: `${i + 1}. ${section.title}`,
          heading: HeadingLevel.HEADING_2,
        })
      );

      // Points de vérification basés sur les warnings et exemples
      const checkpoints = [
        ...section.warnings.map((w) => `Vérifier : ${w.substring(0, 80)}`),
        ...section.examples.slice(0, 2).map((e) => `Contrôler : ${e.substring(0, 80)}`),
      ];

      if (checkpoints.length === 0) {
        checkpoints.push(`Vérifier la conformité : ${section.title}`);
      }

      checkpoints.forEach((checkpoint) => {
        content.push(
          new Paragraph({
            text: `☐ Conforme    ☐ Non conforme    ☐ N/A`,
            indent: { left: 400 },
          }),
          new Paragraph({
            text: checkpoint,
            indent: { left: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Observations : _______________________________',
                color: '6B7280',
              }),
            ],
            indent: { left: 400 },
          }),
          new Paragraph({ text: '' })
        );
      });
    });

    // Synthèse
    content.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({
        text: 'SYNTHÈSE DE L\'AUDIT',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({ text: '' })
    );

    content.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Points conformes : ', bold: true }),
          new TextRun({ text: '______ / ______' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Points non conformes : ', bold: true }),
          new TextRun({ text: '______ / ______' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Points N/A : ', bold: true }),
          new TextRun({ text: '______ / ______' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Score global : ', bold: true }),
          new TextRun({ text: '______ %' }),
        ],
      })
    );

    // Keep variable to avoid unused warning
    void 0;

    content.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'OBSERVATIONS GÉNÉRALES',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: '____________________________________________',
      }),
      new Paragraph({
        text: '____________________________________________',
      }),
      new Paragraph({
        text: '____________________________________________',
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'ACTIONS CORRECTIVES PRÉCONISÉES',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: '1. ________________________________________',
      }),
      new Paragraph({
        text: '2. ________________________________________',
      }),
      new Paragraph({
        text: '3. ________________________________________',
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Signature auditeur : ________________    Signature responsable site : ________________',
      })
    );

    return content;
  }

  private static createTableRow(label: string, value: string): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              text: value,
            }),
          ],
        }),
      ],
    });
  }
}
