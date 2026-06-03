import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { login as loginService, LoginResponse } from '../services/auth';
import { saveToken, getToken, removeToken } from '../storage/authStorage';
import { setUnauthorizedHandler } from '../services/api';

type AuthContextData = {
  token: string | null;
  signed: boolean;
  loadingAuth: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  async function loadStoredToken(): Promise<void> {
    try {
      const storedToken = await getToken();

      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.log('Erro ao carregar token:', error);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function login(
    username: string,
    password: string
  ): Promise<LoginResponse> {
    const data = await loginService(username, password);

    const accessToken = data.accessToken || data.token;

    if (!accessToken) {
      throw new Error('Token não encontrado na resposta da API.');
    }

    await saveToken(accessToken);
    setToken(accessToken);

    return data;
  }

  async function logout(): Promise<void> {
    await removeToken();
    setToken(null);
  }

  useEffect(() => {
    loadStoredToken();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        signed: !!token,
        loadingAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}