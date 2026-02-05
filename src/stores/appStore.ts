import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Course, Document, GenerationSettings } from '@/types';

interface AppState {
  // Documents state
  documents: Document[];
  addDocuments: (docs: Document[]) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;

  // Courses state
  courses: Course[];
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;

  // Generation settings
  generationSettings: GenerationSettings;
  updateGenerationSettings: (settings: Partial<GenerationSettings>) => void;

  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Preferences
  useAIEnhancement: boolean;
  setUseAIEnhancement: (value: boolean) => void;
  customInstructions: string;
  setCustomInstructions: (value: string) => void;
}

/**
 * Store centralisé pour l'application avec persistence
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state - Documents
      documents: [],
      addDocuments: (docs) => set((state) => ({
        documents: [...state.documents, ...docs]
      })),
      removeDocument: (id) => set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id)
      })),
      clearDocuments: () => set({ documents: [] }),

      // Initial state - Courses
      courses: [],
      addCourse: (course) => set((state) => ({
        courses: [course, ...state.courses]
      })),
      removeCourse: (id) => set((state) => ({
        courses: state.courses.filter(c => c.id !== id)
      })),
      updateCourse: (id, updates) => set((state) => ({
        courses: state.courses.map(c =>
          c.id === id ? { ...c, ...updates, lastModified: new Date() } : c
        )
      })),

      // Initial state - Generation settings
      generationSettings: {
        includeQCM: true,
        includeIntroduction: true,
        includeConclusion: true,
        addExamples: true,
        addWarnings: true,
        qcmQuestionCount: 10,
        courseStyle: 'structured'
      },
      updateGenerationSettings: (settings) => set((state) => ({
        generationSettings: { ...state.generationSettings, ...settings }
      })),

      // Initial state - UI
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Initial state - Preferences
      useAIEnhancement: false,
      setUseAIEnhancement: (value) => set({ useAIEnhancement: value }),
      customInstructions: '',
      setCustomInstructions: (value) => set({ customInstructions: value }),
    }),
    {
      name: 'kebe-app-storage',
      storage: createJSONStorage(() => localStorage),
      // Ne pas persister certaines données
      partialize: (state) => ({
        generationSettings: state.generationSettings,
        useAIEnhancement: state.useAIEnhancement,
        customInstructions: state.customInstructions,
        sidebarOpen: state.sidebarOpen,
        // On ne persiste PAS documents et courses car ils sont gérés séparément
      })
    }
  )
);

/**
 * Sélecteurs optimisés pour éviter les re-renders inutiles
 */
export const useDocuments = () => useAppStore((state) => state.documents);
export const useCourses = () => useAppStore((state) => state.courses);
export const useGenerationSettings = () => useAppStore((state) => state.generationSettings);
export const useActiveTab = () => useAppStore((state) => state.activeTab);
