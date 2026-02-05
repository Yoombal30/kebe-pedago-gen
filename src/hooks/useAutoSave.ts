/**
 * Hook de sauvegarde automatique
 * Sauvegarde les données en localStorage avec debounce
 */

import { useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions {
  key: string;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>(data: T, options: AutoSaveOptions) {
  const { key, debounceMs = 2000, enabled = true } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSaveRef = useRef<Date | null>(null);

  const save = useCallback(() => {
    if (!enabled) return;
    
    try {
      const saveData = {
        data,
        savedAt: new Date().toISOString(),
        version: 1,
      };
      localStorage.setItem(key, JSON.stringify(saveData));
      lastSaveRef.current = new Date();
      console.log(`[AutoSave] Sauvegarde: ${key}`);
    } catch (error) {
      console.error('[AutoSave] Erreur:', error);
    }
  }, [data, key, enabled]);

  // Sauvegarde avec debounce
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, debounceMs, enabled]);

  // Sauvegarder avant de quitter
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        save();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [save, enabled]);

  // Charger les données sauvegardées
  const load = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data;
      }
    } catch (error) {
      console.error('[AutoSave] Erreur lecture:', error);
    }
    return null;
  }, [key]);

  // Supprimer la sauvegarde
  const clear = useCallback(() => {
    localStorage.removeItem(key);
    lastSaveRef.current = null;
  }, [key]);

  return {
    save,
    load,
    clear,
    lastSaveTime: lastSaveRef.current,
  };
}

// Fonction utilitaire pour récupérer toutes les sauvegardes
export function getAllAutoSaves(): Record<string, { data: unknown; savedAt: string }> {
  const saves: Record<string, { data: unknown; savedAt: string }> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('autosave-') || key?.startsWith('course-')) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          saves[key] = JSON.parse(value);
        }
      } catch {
        // Ignorer les erreurs de parsing
      }
    }
  }
  
  return saves;
}
