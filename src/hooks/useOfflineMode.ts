/**
 * Hook pour gérer le mode hors-ligne
 */

import { useState, useEffect, useCallback } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  isServiceWorkerActive: boolean;
  lastSyncTime: Date | null;
}

export function useOfflineMode() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isServiceWorkerActive: false,
    lastSyncTime: null,
  });

  // Enregistrer le Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Offline] Service Worker enregistré');
          setStatus((prev) => ({ ...prev, isServiceWorkerActive: true }));

          // Vérifier les mises à jour périodiquement
          setInterval(() => {
            registration.update();
          }, 60000);
        })
        .catch((error) => {
          console.error('[Offline] Erreur SW:', error);
        });
    }
  }, []);

  // Écouter les changements de connectivité
  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true, lastSyncTime: new Date() }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Forcer la synchronisation du cache
  const syncCache = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      setStatus((prev) => ({ ...prev, lastSyncTime: new Date() }));
    }
  }, []);

  return {
    ...status,
    syncCache,
  };
}
