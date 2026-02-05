/**
 * Utilitaires d'accessibilité pour l'application
 */

/**
 * Gère le focus trap dans les modales et dialogues
 */
export class FocusTrap {
  private element: HTMLElement;
  private previouslyFocused: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * Active le focus trap
   */
  activate() {
    this.previouslyFocused = document.activeElement as HTMLElement;
    this.updateFocusableElements();

    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Désactive le focus trap
   */
  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }

  /**
   * Met à jour la liste des éléments focusables
   */
  private updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(
      this.element.querySelectorAll(focusableSelectors)
    );
  }

  /**
   * Gère la navigation au clavier
   */
  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    this.updateFocusableElements();

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };
}

/**
 * Annonce un message pour les lecteurs d'écran
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Vérifie si un élément est visible pour les technologies d'assistance
 */
export const isAccessible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    parseFloat(style.opacity) > 0 &&
    element.getAttribute('aria-hidden') !== 'true'
  );
};

/**
 * Génère un ID unique pour l'accessibilité
 */
let idCounter = 0;
export const generateA11yId = (prefix: string = 'a11y'): string => {
  return `${prefix}-${++idCounter}`;
};

/**
 * Ratio de contraste WCAG
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Simplifié - une vraie implémentation devrait parser les couleurs
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(Number);
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Vérifie si le contraste respecte WCAG AA
 */
export const meetsWCAGAA = (foreground: string, background: string, isLargeText: boolean = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Skip link pour la navigation au clavier
 */
export const createSkipLink = (targetId: string, text: string = 'Aller au contenu principal'): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground';

  return skipLink;
};

/**
 * Classe CSS pour les éléments visibles uniquement aux lecteurs d'écran
 */
export const SR_ONLY_CLASS = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Hook pour gérer les raccourcis clavier accessibles
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();

  /**
   * Enregistre un raccourci
   */
  register(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Désenregistre un raccourci
   */
  unregister(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  /**
   * Gère l'événement clavier
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    const key = this.getEventKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
      announceToScreenReader(`Raccourci activé: ${shortcut.description}`);
      return true;
    }

    return false;
  }

  /**
   * Récupère la clé unique du raccourci
   */
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    return `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.key.toLowerCase()}`;
  }

  /**
   * Récupère la clé de l'événement
   */
  private getEventKey(event: KeyboardEvent): string {
    return `${event.ctrlKey ? 'ctrl+' : ''}${event.altKey ? 'alt+' : ''}${event.shiftKey ? 'shift+' : ''}${event.key.toLowerCase()}`;
  }

  /**
   * Liste tous les raccourcis
   */
  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}
