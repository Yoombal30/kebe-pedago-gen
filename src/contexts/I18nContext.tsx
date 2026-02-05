/**
 * Contexte d'internationalisation (i18n)
 * Support: Français, Anglais, Arabe
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

type Locale = 'fr' | 'en' | 'ar';

interface Translations {
  [key: string]: string;
}

const translations: Record<Locale, Translations> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.chat': 'Chat IA',
    'nav.templates': 'Templates',
    'nav.generator': 'Générateur',
    'nav.modules': 'Modules',
    'nav.documents': 'Documents',
    'nav.qcm': 'QCM',
    'nav.normative': 'Cours Normatif',
    'nav.explorer': 'Explorer',
    'nav.history': 'Historique',
    'nav.stats': 'Stats',
    'nav.guide': 'Guide',
    'nav.status': 'État',
    'nav.admin': 'Admin',
    
    // Dashboard
    'dashboard.title': 'Professeur KEBE',
    'dashboard.subtitle': 'Générateur de cours professionnel - Fonctionne avec ou sans IA',
    'dashboard.robustMode': 'Mode robuste actif',
    'dashboard.robustModeDesc': "L'application génère des cours complets par analyse structurée des documents. L'IA est un enrichissement optionnel, jamais bloquant.",
    'dashboard.demo': 'Démo Présentation',
    
    // Actions
    'action.generate': 'Générer',
    'action.export': 'Exporter',
    'action.save': 'Sauvegarder',
    'action.cancel': 'Annuler',
    'action.close': 'Fermer',
    'action.download': 'Télécharger',
    'action.preview': 'Prévisualiser',
    
    // Statuts
    'status.online': 'En ligne',
    'status.offline': 'Hors ligne',
    'status.connected': 'Connecté',
    'status.disconnected': 'Déconnecté',
    'status.generating': 'Génération en cours...',
    'status.success': 'Succès',
    'status.error': 'Erreur',
    
    // QCM
    'qcm.question': 'Question',
    'qcm.answer': 'Réponse',
    'qcm.correct': 'Bonne réponse',
    'qcm.incorrect': 'Mauvaise réponse',
    'qcm.score': 'Score',
    'qcm.time': 'Temps',
    'qcm.next': 'Suivant',
    'qcm.previous': 'Précédent',
    'qcm.submit': 'Valider',
    'qcm.finish': 'Terminer',
    
    // Export
    'export.word': 'Export Word',
    'export.ppt': 'Export PowerPoint',
    'export.pdf': 'Export PDF',
    'export.scorm': 'Export SCORM',
    'export.trainer': 'Livret formateur',
    'export.learner': 'Livret apprenant',
    'export.audit': 'Fiche audit',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.chat': 'AI Chat',
    'nav.templates': 'Templates',
    'nav.generator': 'Generator',
    'nav.modules': 'Modules',
    'nav.documents': 'Documents',
    'nav.qcm': 'Quiz',
    'nav.normative': 'Normative Course',
    'nav.explorer': 'Explorer',
    'nav.history': 'History',
    'nav.stats': 'Stats',
    'nav.guide': 'Guide',
    'nav.status': 'Status',
    'nav.admin': 'Admin',
    
    // Dashboard
    'dashboard.title': 'Professor KEBE',
    'dashboard.subtitle': 'Professional course generator - Works with or without AI',
    'dashboard.robustMode': 'Robust mode active',
    'dashboard.robustModeDesc': 'The application generates complete courses through structured document analysis. AI is an optional enhancement, never blocking.',
    'dashboard.demo': 'Demo Presentation',
    
    // Actions
    'action.generate': 'Generate',
    'action.export': 'Export',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.download': 'Download',
    'action.preview': 'Preview',
    
    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.connected': 'Connected',
    'status.disconnected': 'Disconnected',
    'status.generating': 'Generating...',
    'status.success': 'Success',
    'status.error': 'Error',
    
    // QCM
    'qcm.question': 'Question',
    'qcm.answer': 'Answer',
    'qcm.correct': 'Correct answer',
    'qcm.incorrect': 'Wrong answer',
    'qcm.score': 'Score',
    'qcm.time': 'Time',
    'qcm.next': 'Next',
    'qcm.previous': 'Previous',
    'qcm.submit': 'Submit',
    'qcm.finish': 'Finish',
    
    // Export
    'export.word': 'Word Export',
    'export.ppt': 'PowerPoint Export',
    'export.pdf': 'PDF Export',
    'export.scorm': 'SCORM Export',
    'export.trainer': 'Trainer booklet',
    'export.learner': 'Learner booklet',
    'export.audit': 'Audit sheet',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.chat': 'محادثة الذكاء الاصطناعي',
    'nav.templates': 'القوالب',
    'nav.generator': 'المولد',
    'nav.modules': 'الوحدات',
    'nav.documents': 'المستندات',
    'nav.qcm': 'اختبار',
    'nav.normative': 'دورة معيارية',
    'nav.explorer': 'مستكشف',
    'nav.history': 'التاريخ',
    'nav.stats': 'الإحصائيات',
    'nav.guide': 'دليل',
    'nav.status': 'الحالة',
    'nav.admin': 'إدارة',
    
    // Dashboard
    'dashboard.title': 'البروفيسور KEBE',
    'dashboard.subtitle': 'مولد دورات احترافي - يعمل مع أو بدون ذكاء اصطناعي',
    'dashboard.robustMode': 'الوضع القوي نشط',
    'dashboard.robustModeDesc': 'يولد التطبيق دورات كاملة من خلال التحليل المنظم للوثائق. الذكاء الاصطناعي تحسين اختياري، وليس ضروريًا.',
    'dashboard.demo': 'عرض توضيحي',
    
    // Actions
    'action.generate': 'توليد',
    'action.export': 'تصدير',
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.close': 'إغلاق',
    'action.download': 'تحميل',
    'action.preview': 'معاينة',
    
    // Status
    'status.online': 'متصل',
    'status.offline': 'غير متصل',
    'status.connected': 'متصل',
    'status.disconnected': 'غير متصل',
    'status.generating': 'جاري التوليد...',
    'status.success': 'نجاح',
    'status.error': 'خطأ',
    
    // QCM
    'qcm.question': 'سؤال',
    'qcm.answer': 'جواب',
    'qcm.correct': 'إجابة صحيحة',
    'qcm.incorrect': 'إجابة خاطئة',
    'qcm.score': 'النتيجة',
    'qcm.time': 'الوقت',
    'qcm.next': 'التالي',
    'qcm.previous': 'السابق',
    'qcm.submit': 'إرسال',
    'qcm.finish': 'إنهاء',
    
    // Export
    'export.word': 'تصدير Word',
    'export.ppt': 'تصدير PowerPoint',
    'export.pdf': 'تصدير PDF',
    'export.scorm': 'تصدير SCORM',
    'export.trainer': 'كتيب المدرب',
    'export.learner': 'كتيب المتعلم',
    'export.audit': 'ورقة تدقيق',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'fr' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('professeur-kebe-locale') as Locale) || defaultLocale;
    }
    return defaultLocale;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('professeur-kebe-locale', newLocale);
    
    // Mettre à jour la direction du document pour l'arabe
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] || translations.fr[key] || key;
    },
    [locale]
  );

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}
