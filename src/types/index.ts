
export interface Module {
  id: string;
  title: string;
  prerequisites: string[];
  knowledge: string[];
  skills: string[];
  duration: number; // en heures
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number;
  uploadedAt: Date;
  content?: string;
  processed: boolean;
}

export interface Course {
  id: string;
  title: string;
  modules: Module[];
  documents: Document[];
  content: CourseContent;
  generatedAt: Date;
  lastModified: Date;
}

export interface CourseContent {
  introduction: string;
  sections: CourseSection[];
  conclusion: string;
  qcm: QCMQuestion[];
  resources: string[];
}

export interface CourseSection {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
  warnings: string[];
  illustrations?: string[];
}

export interface QCMQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'command' | 'error';
}

// Configuration unifiée pour tous les moteurs IA
export interface AIEngineConfig {
  endpoint: string;
  model: string;
  apiKey?: string;
  timeout?: number;
}

export interface AIEngine {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: AIEngineConfig;
}

export interface AdminSettings {
  activeEngine: string;
  engines: AIEngine[];
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  engine?: string;
}

// Types pour l'analyse de contenu
export interface ContentAnalysis {
  wordCount: number;
  concepts: string[];
  suggestedModules: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
}

// Types pour la génération de cours
export interface GenerationSettings {
  includeQCM: boolean;
  includeIntroduction: boolean;
  includeConclusion: boolean;
  addExamples: boolean;
  addWarnings: boolean;
  qcmQuestionCount: number;
  courseStyle: 'structured' | 'conversational' | 'technical';
}
