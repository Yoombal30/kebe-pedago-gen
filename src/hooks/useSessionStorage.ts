
import { useState, useEffect } from 'react';

export function useSessionStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Récupérer depuis sessionStorage par clé
      const item = window.sessionStorage.getItem(key);
      // Parser le JSON stocké ou si aucun retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si erreur retourner initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Retourner une version wrapped de useState's setter function qui persiste la nouvelle valeur en sessionStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à value d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder en sessionStorage
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Une implémentation plus robuste logguerait l'erreur
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
