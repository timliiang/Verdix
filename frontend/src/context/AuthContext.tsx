import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { LoginRequest, RegisterRequest } from '../types/Auth';
import { login as loginApi, register as registerApi } from '../api/authApi';
import { clearSession, loadSession, saveSession, type Session } from '../api/authStorage';

export interface AuthContextType {
    username: string | null;
    token: string | null;
    register: (request: RegisterRequest) => Promise<void>;
    login: (request: LoginRequest) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Lazy initializer: storage is read before the first render, so a returning user is signed in
    // from the start and the route guards never see a false "signed out".
    const [session, setSession] = useState<Session | null>(loadSession);

    const startSession = ({ token, username }: Session) => {
        saveSession({ token, username });
        setSession({ token, username });
    }

    const login = async (request: LoginRequest) => {
        startSession(await loginApi(request));
    }

    const register = async (request: RegisterRequest) => {
        startSession(await registerApi(request));
    }

    const logout = () => {
        clearSession();
        setSession(null);
    }

    const value: AuthContextType = {
        username: session?.username ?? null,
        token: session?.token ?? null,
        login,
        register,
        logout
    };

    return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
