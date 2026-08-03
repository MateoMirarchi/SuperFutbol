/**
 * hooks/useAdminAuth.js
 * Maneja la sesión del administrador en localStorage.
 */

import { useEffect, useState } from 'react';
import { loginRequest } from '../services/api';
import { loadData, removeData, saveData } from '../utils/storage';

const STORAGE_KEY = 'superfutbol_admin_session';

function useAdminAuth() {
  const [session, setSession] = useState(() => loadData(STORAGE_KEY, null));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      saveData(STORAGE_KEY, session);
    } else {
      removeData(STORAGE_KEY);
    }
  }, [session]);

  async function login(credentials) {
    setIsLoading(true);
    try {
      const data = await loginRequest(credentials);
      setSession(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setSession(null);
  }

  return {
    token: session?.token ?? null,
    admin: session?.admin ?? null,
    isAdmin: session?.admin?.rol === 'admin',
    isLoading,
    login,
    logout,
  };
}

export default useAdminAuth;
