/**
 * Hook pour les raccourcis clavier globaux
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

const defaultShortcuts: KeyboardShortcut[] = [];

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = defaultShortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorer si on tape dans un input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Raccourcis prédéfinis pour l'application
export const APP_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'h',
    ctrl: true,
    action: () => console.log('Aide'),
    description: 'Afficher l\'aide',
  },
  {
    key: 's',
    ctrl: true,
    action: () => console.log('Sauvegarde'),
    description: 'Sauvegarder',
  },
  {
    key: 'n',
    ctrl: true,
    action: () => console.log('Nouveau'),
    description: 'Nouveau cours',
  },
  {
    key: 'e',
    ctrl: true,
    action: () => console.log('Export'),
    description: 'Exporter',
  },
  {
    key: 'p',
    ctrl: true,
    action: () => console.log('Présentation'),
    description: 'Mode présentation',
  },
];
