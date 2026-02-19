import { createContext, useContext, useEffect, useState, useCallback, type PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { setApiToken } from '@/services/api';
import { getMe, type User } from '@/services/auth';

const TOKEN_KEY = 'ignite_auth_token';

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState>({
  token: null,
  user: null,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function storeToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStoredToken().then(async (stored) => {
      if (stored) {
        setApiToken(stored);
        const res = await getMe();
        if (res.ok) {
          setToken(stored);
          setUser(res.data);
        } else {
          setApiToken(null);
          await removeToken();
        }
      }
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback((newToken: string, newUser: User) => {
    setApiToken(newToken);
    setToken(newToken);
    setUser(newUser);
    storeToken(newToken);
  }, []);

  const signOut = useCallback(() => {
    setApiToken(null);
    setToken(null);
    setUser(null);
    removeToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
