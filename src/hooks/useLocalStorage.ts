
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Récupérer depuis localStorage par clé
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou si aucun retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si erreur retourner initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Retourner une version wrapped de useState's setter function qui persiste la nouvelle valeur en localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à value d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Une implémentation plus robuste logguerait l'erreur dans un service de reporting d'erreurs
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
