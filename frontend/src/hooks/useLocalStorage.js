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
import { loadData, removeData, saveData } from '../utils/storage';

function useLocalStorage(key, initialValue) {
  // Inicializar desde localStorage o usar el valor por defecto
  const [storedValue, setStoredValue] = useState(() => loadData(key, initialValue));

  // Guardar en estado y en localStorage
  const setValue = useCallback(
    (value) => {
      // Acepta función (como el setter de useState) o valor directo
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      saveData(key, valueToStore);
    },
    [key, storedValue]
  );

  // Eliminar la clave del localStorage y resetear al valor inicial
  const removeValue = useCallback(() => {
    removeData(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
