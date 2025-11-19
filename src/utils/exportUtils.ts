import { Course } from "@/types";
import { WordExportService } from "@/services/wordExportService";
import { PowerPointExportService } from "@/services/pptxExportService";
import { toast } from "sonner";

export const exportToPDF = async (course: Course) => {
  try {
    toast.info("Export PDF en cours de développement...");
    console.log("Exporting to PDF:", course);
  } catch (error) {
    toast.error("Erreur lors de l'export PDF");
    console.error("PDF export error:", error);
  }
};

export const exportToWord = async (course: Course) => {
  try {
    toast.loading("Génération du document Word...");
    await WordExportService.exportCourse(course);
    toast.success("Document Word généré avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export Word");
    console.error("Word export error:", error);
  }
};

export const exportToPowerPoint = async (course: Course) => {
  try {
    toast.loading("Génération de la présentation PowerPoint...");
    await PowerPointExportService.exportCourse(course);
    toast.success("Présentation PowerPoint générée avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export PowerPoint");
    console.error("PowerPoint export error:", error);
  }
};

export const exportToSCORM = async (course: Course) => {
  try {
    toast.info("Export SCORM en cours de développement...");
    console.log("Exporting to SCORM:", course);
  } catch (error) {
    toast.error("Erreur lors de l'export SCORM");
    console.error("SCORM export error:", error);
  }
};
