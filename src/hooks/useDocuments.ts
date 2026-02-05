import { useState, useCallback, useMemo } from 'react';
import { Document } from '@/types';
import { toast } from 'sonner';
import { DocumentProcessor } from '@/services/documentProcessor';

/**
 * Hook personnalisé pour gérer les documents avec optimisations de performance
 */
export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ajouter des documents (memoized pour éviter les re-renders)
  const addDocuments = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    const newDocuments: Document[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const content = await DocumentProcessor.extractText(file);

          const doc: Document = {
            id: `${Date.now()}-${i}`,
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : 'txt',
            size: file.size,
            uploadedAt: new Date(),
            content,
            processed: true
          };

          newDocuments.push(doc);
          toast.success(`Document "${file.name}" importé avec succès`);
        } catch (error) {
          toast.error(`Erreur lors de l'import de "${file.name}"`);
          console.error('File upload error:', error);
        }
      }

      setDocuments(prev => [...prev, ...newDocuments]);
    } finally {
      setIsProcessing(false);
    }

    return newDocuments;
  }, []);

  // Supprimer un document (memoized)
  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Document supprimé');
  }, []);

  // Vider tous les documents (memoized)
  const clearDocuments = useCallback(() => {
    setDocuments([]);
    toast.info('Tous les documents ont été supprimés');
  }, []);

  // Statistiques calculées avec useMemo (évite recalcul inutile)
  const stats = useMemo(() => ({
    count: documents.length,
    totalSize: documents.reduce((acc, doc) => acc + doc.size, 0),
    types: [...new Set(documents.map(doc => doc.type))],
    processedCount: documents.filter(doc => doc.processed).length
  }), [documents]);

  // Recherche de documents (memoized)
  const searchDocuments = useCallback((query: string) => {
    if (!query.trim()) return documents;

    const lowerQuery = query.toLowerCase();
    return documents.filter(doc =>
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.content?.toLowerCase().includes(lowerQuery)
    );
  }, [documents]);

  return {
    documents,
    isProcessing,
    stats,
    addDocuments,
    removeDocument,
    clearDocuments,
    searchDocuments
  };
};
