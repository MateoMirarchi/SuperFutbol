/**
 * hooks/useAdminAuth.js
 * Maneja la sesión del administrador en localStorage.
 */

import { useEffect, useState } from 'react';
import { loginRequest } from '../services/api';

const STORAGE_KEY = 'superfutbol_admin_session';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function useAdminAuth() {
  const [session, setSession] = useState(() => readStoredSession());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
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
