import pptxgen from 'pptxgenjs';
import { Course, CourseSection, QCMQuestion } from '@/types';

export class PowerPointExportService {
  static async exportCourse(course: Course): Promise<void> {
    const pptx = new pptxgen();

    // Configuration du thème
    pptx.layout = 'LAYOUT_16x9';
    pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });

    // Définir le thème avec des couleurs épurées
    const theme = {
      primaryColor: '2563eb', // Bleu professionnel
      secondaryColor: '475569', // Gris foncé
      accentColor: '10b981', // Vert moderne
      backgroundColor: 'ffffff',
      textColor: '1e293b',
    };

    // Slide de titre
    this.createTitleSlide(pptx, course, theme);

    // Sommaire
    this.createSummarySlide(pptx, course, theme);

    // Modules
    course.modules.forEach((module, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: theme.backgroundColor };

      slide.addText(`Module ${index + 1}`, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 0.8,
        fontSize: 36,
        color: theme.primaryColor,
        bold: true,
      });

      slide.addText(module.title, {
        x: 0.5,
        y: 1.4,
        w: '90%',
        h: 0.6,
        fontSize: 28,
        color: theme.textColor,
      });

      // Informations du module
      const moduleInfo = [
        { label: '⏱️ Durée', value: `${module.duration} heures` },
        { label: '📚 Connaissances', value: module.knowledge.slice(0, 3).join(', ') },
        { label: '🎯 Compétences', value: module.skills.slice(0, 3).join(', ') },
      ];

      let yPos = 2.5;
      moduleInfo.forEach((info) => {
        slide.addText(`${info.label}: ${info.value}`, {
          x: 1,
          y: yPos,
          w: 8,
          h: 0.4,
          fontSize: 16,
          color: theme.secondaryColor,
        });
        yPos += 0.6;
      });
    });

    // Sections du cours
    course.content.sections.forEach((section) => {
      this.createSectionSlide(pptx, section, theme);
    });

    // QCM
    if (course.content.qcm.length > 0) {
      this.createQCMSlides(pptx, course.content.qcm, theme);
    }

    // Slide de conclusion
    this.createConclusionSlide(pptx, course, theme);

    // Sauvegarder
    await pptx.writeFile({ fileName: `${course.title.replace(/[^a-z0-9]/gi, '_')}.pptx` });
  }

  private static createTitleSlide(pptx: pptxgen, course: Course, theme: any): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.primaryColor };

    slide.addText(course.title, {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 1.5,
      fontSize: 44,
      color: 'ffffff',
      bold: true,
      align: 'center',
    });

    slide.addText(`Formation générée le ${new Date(course.generatedAt).toLocaleDateString('fr-FR')}`, {
      x: 0.5,
      y: 4,
      w: '90%',
      h: 0.4,
      fontSize: 14,
      color: 'ffffff',
      align: 'center',
    });
  }

  private static createSummarySlide(pptx: pptxgen, course: Course, theme: any): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.backgroundColor };

    slide.addText('Sommaire', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.8,
      fontSize: 36,
      color: theme.primaryColor,
      bold: true,
    });

    const items = course.modules.map((m, i) => `${i + 1}. ${m.title}`);

    slide.addText(items.join('\n'), {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3.5,
      fontSize: 18,
      color: theme.textColor,
      bullet: { type: 'number' },
    });
  }

  private static createSectionSlide(pptx: pptxgen, section: CourseSection, theme: any): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.backgroundColor };

    // Titre de la section
    slide.addText(section.title, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.8,
      fontSize: 32,
      color: theme.primaryColor,
      bold: true,
    });

    // Explication
    slide.addText(section.explanation, {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: 2,
      fontSize: 16,
      color: theme.textColor,
      valign: 'top',
    });

    // Exemples (si présents)
    if (section.examples.length > 0) {
      const examplesSlide = pptx.addSlide();
      examplesSlide.background = { color: theme.backgroundColor };

      examplesSlide.addText(`${section.title} - Exemples`, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 0.8,
        fontSize: 28,
        color: theme.primaryColor,
        bold: true,
      });

      examplesSlide.addText(section.examples.slice(0, 5).join('\n'), {
        x: 1,
        y: 1.5,
        w: 8,
        h: 3.5,
        fontSize: 16,
        color: theme.textColor,
        bullet: true,
      });
    }

    // Points d'attention (si présents)
    if (section.warnings.length > 0) {
      const warningsSlide = pptx.addSlide();
      warningsSlide.background = { color: theme.backgroundColor };

      warningsSlide.addText(`⚠️ Points d'attention`, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 0.8,
        fontSize: 28,
        color: 'f59e0b',
        bold: true,
      });

      warningsSlide.addText(section.warnings.join('\n'), {
        x: 1,
        y: 1.5,
        w: 8,
        h: 3.5,
        fontSize: 16,
        color: theme.textColor,
        bullet: true,
      });
    }
  }

  private static createQCMSlides(pptx: pptxgen, questions: QCMQuestion[], theme: any): void {
    const qcmTitleSlide = pptx.addSlide();
    qcmTitleSlide.background = { color: theme.accentColor };

    qcmTitleSlide.addText('Questionnaire d\'évaluation', {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 1.5,
      fontSize: 40,
      color: 'ffffff',
      bold: true,
      align: 'center',
    });

    questions.forEach((question, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: theme.backgroundColor };

      slide.addText(`Question ${index + 1}`, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 0.6,
        fontSize: 24,
        color: theme.primaryColor,
        bold: true,
      });

      slide.addText(question.question, {
        x: 0.5,
        y: 1.2,
        w: '90%',
        h: 1,
        fontSize: 20,
        color: theme.textColor,
      });

      const options = question.options.map((opt, i) => 
        `${String.fromCharCode(65 + i)}. ${opt}`
      );

      slide.addText(options.join('\n'), {
        x: 1,
        y: 2.5,
        w: 8,
        h: 2,
        fontSize: 16,
        color: theme.textColor,
      });
    });
  }

  private static createConclusionSlide(pptx: pptxgen, course: Course, theme: any): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.backgroundColor };

    slide.addText('Conclusion', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.8,
      fontSize: 36,
      color: theme.primaryColor,
      bold: true,
    });

    slide.addText(course.content.conclusion, {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: 2.5,
      fontSize: 18,
      color: theme.textColor,
    });

    slide.addText('Merci de votre attention ! 🎓', {
      x: 0.5,
      y: 4.5,
      w: '90%',
      h: 0.5,
      fontSize: 24,
      color: theme.accentColor,
      bold: true,
      align: 'center',
    });
  }
}
