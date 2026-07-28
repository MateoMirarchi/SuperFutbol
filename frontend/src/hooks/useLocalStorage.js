/**
 * useLocalStorage.js
 * Hook genérico para sincronizar estado con localStorage.
 * Garantiza persistencia entre recargas y reinicios del navegador.
 * 
 * @param {string} key - Clave en localStorage
 * @param {*} initialValue - Valor inicial si no existe la clave
 * @returns {[value, setValue, removeValue]}
 */

import { useState, useCallback } from 'react';

function useLocalStorage(key, initialValue) {
  // Inicializar desde localStorage o usar el valor por defecto
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.warn(`useLocalStorage: error al leer "${key}"`, err);
      return initialValue;
    }
  });

  // Guardar en estado y en localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Acepta función (como el setter de useState) o valor directo
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.warn(`useLocalStorage: error al guardar "${key}"`, err);
      }
    },
    [key, storedValue]
  );

  // Eliminar la clave del localStorage y resetear al valor inicial
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      console.warn(`useLocalStorage: error al eliminar "${key}"`, err);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
