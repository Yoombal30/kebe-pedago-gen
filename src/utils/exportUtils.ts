
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'pptx' | 'scorm' | 'json';
  title: string;
  content: string;
  metadata?: {
    author?: string;
    description?: string;
    keywords?: string[];
    language?: string;
  };
}

export class ExportUtils {
  static async exportContent(options: ExportOptions): Promise<void> {
    const { format, title, content, metadata } = options;

    switch (format) {
      case 'pdf':
        await this.exportToPDF(title, content, metadata);
        break;
      case 'docx':
        await this.exportToWord(title, content, metadata);
        break;
      case 'pptx':
        await this.exportToPowerPoint(title, content, metadata);
        break;
      case 'scorm':
        await this.exportToSCORM(title, content, metadata);
        break;
      case 'json':
        await this.exportToJSON(title, content, metadata);
        break;
      default:
        throw new Error(`Format d'export non supporté: ${format}`);
    }
  }

  private static async exportToPDF(title: string, content: string, metadata?: any): Promise<void> {
    // Simulation d'export PDF - en production, utiliser une librairie comme jsPDF
    const htmlContent = this.convertMarkdownToHTML(content);
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #0066cc; }
            h2 { color: #666; margin-top: 30px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; }
            .example { background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; }
            .qcm { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; margin: 15px 0; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
    
    this.downloadFile(`${title}.html`, fullHTML, 'text/html');
  }

  private static async exportToWord(title: string, content: string, metadata?: any): Promise<void> {
    // Simulation d'export Word - en production, utiliser une librairie comme docx
    const htmlContent = this.convertMarkdownToHTML(content);
    const wordContent = `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr><w:pStyle w:val="Title"/></w:pPr>
            <w:r><w:t>${title}</w:t></w:r>
          </w:p>
          ${this.convertHTMLToWordML(htmlContent)}
        </w:body>
      </w:document>
    `;
    
    this.downloadFile(`${title}.xml`, wordContent, 'application/xml');
  }

  private static async exportToPowerPoint(title: string, content: string, metadata?: any): Promise<void> {
    // Simulation d'export PowerPoint - créer des slides basées sur les sections
    const sections = content.split(/^##\s+/m).filter(section => section.trim());
    
    let pptContent = `# ${title}\n\n`;
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n');
      const sectionTitle = lines[0] || `Slide ${index + 1}`;
      const sectionContent = lines.slice(1).join('\n');
      
      pptContent += `---\n\n## ${sectionTitle}\n\n${sectionContent}\n\n`;
    });
    
    this.downloadFile(`${title}.md`, pptContent, 'text/markdown');
  }

  private static async exportToSCORM(title: string, content: string, metadata?: any): Promise<void> {
    // Simulation d'export SCORM - créer un package conforme
    const scormManifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="SCORM_${Date.now()}" version="1.0" 
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
    <adlcp:location>metadata.xml</adlcp:location>
  </metadata>
  <organizations default="ORG-001">
    <organization identifier="ORG-001">
      <title>${title}</title>
      <item identifier="ITEM-001" identifierref="RES-001">
        <title>${title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-001" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;

    const indexHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <script src="SCORM_API_wrapper.js"></script>
</head>
<body>
    <h1>${title}</h1>
    ${this.convertMarkdownToHTML(content)}
    <script>
        SCORM_CallInitialize();
        SCORM_CallSetValue("cmi.core.lesson_status", "completed");
        SCORM_CallCommit();
        SCORM_CallTerminate();
    </script>
</body>
</html>`;

    // En production, créer un vrai package ZIP
    this.downloadFile(`${title}_manifest.xml`, scormManifest, 'application/xml');
  }

  private static async exportToJSON(title: string, content: string, metadata?: any): Promise<void> {
    const jsonData = {
      title,
      content,
      metadata: {
        exportDate: new Date().toISOString(),
        format: 'json',
        ...metadata
      },
      sections: this.parseContentSections(content)
    };
    
    this.downloadFile(`${title}.json`, JSON.stringify(jsonData, null, 2), 'application/json');
  }

  private static convertMarkdownToHTML(markdown: string): string {
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/⚠️ (.+)$/gm, '<div class="warning">⚠️ $1</div>')
      .replace(/^\*\*Question \d+:\*\* (.+)$/gm, '<div class="qcm"><strong>$1</strong>')
      .replace(/^\*\*Réponse correcte:\*\* (.+)$/gm, '<p><strong>Réponse correcte:</strong> $1</p>')
      .replace(/^\*\*Explication:\*\* (.+)$/gm, '<p><strong>Explication:</strong> $1</p></div>')
      .replace(/\n/g, '<br>');
  }

  private static convertHTMLToWordML(html: string): string {
    // Simple conversion HTML vers WordML
    return html
      .replace(/<h1>/g, '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>')
      .replace(/<\/h1>/g, '</w:t></w:r></w:p>')
      .replace(/<h2>/g, '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>')
      .replace(/<\/h2>/g, '</w:t></w:r></w:p>')
      .replace(/<p>/g, '<w:p><w:r><w:t>')
      .replace(/<\/p>/g, '</w:t></w:r></w:p>')
      .replace(/<br>/g, '<w:br/>');
  }

  private static parseContentSections(content: string): any[] {
    const sections = content.split(/^##\s+/m).filter(section => section.trim());
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      return {
        id: `section-${index + 1}`,
        title: lines[0] || `Section ${index + 1}`,
        content: lines.slice(1).join('\n').trim()
      };
    });
  }

  private static downloadFile(filename: string, content: string, mimeType: string): void {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
