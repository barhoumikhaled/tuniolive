// Simple authentication utilities
export const AUTH_CONFIG = {
  username: 'admin',
  password: 'olive123'
};

export const AUTH_STORAGE_KEY = 'olive-grove-auth';

export const login = (username: string, password: string): boolean => {
  if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
    const authData = {
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      username: username
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    console.log('is isAuthenticated: ', authData)
    if (!authData) return false;

    const parsed = JSON.parse(authData);
    console.log('in parsed.isAuthenticated: ', parsed)

    return parsed.isAuthenticated === true;
  } catch {
    console.log('in catch')
    return false;
  }
};

export const getAuthData = () => {
  console.log("get auth")
  // if (typeof window === 'undefined') return null;

  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;

    return JSON.parse(authData);
  } catch {
    return null;
  }
};