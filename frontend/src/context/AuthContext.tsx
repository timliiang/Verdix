import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { LoginRequest, RegisterRequest } from '../types/Auth';
import { login as loginApi, register as registerApi } from '../api/authApi';

export interface AuthContextType {
    username: string | null;
    token: string | null;
    isLoading: boolean;
    register: (request: RegisterRequest) => Promise<void>;
    login: (request: LoginRequest) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [username, setUsername] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (storedToken && storedUsername) {
            setToken(storedToken);
            setUsername(storedUsername);
        }
        setIsLoading(false);
    }, []);

    const login = async (request: LoginRequest) => {
        const response = await loginApi(request);
        setToken(response.token);
        setUsername(response.username);
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
    }

    const register = async (request: RegisterRequest) => {
        const response = await registerApi(request);
        setToken(response.token);
        setUsername(response.username);
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
    }

    const logout = () => {
        setToken(null);
        setUsername(null);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }

    const value: AuthContextType = {
        username,
        token,
        isLoading,
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
