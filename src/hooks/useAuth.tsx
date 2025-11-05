import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode'; 

// ----------------------------------------------------------------------
// 1. TIPOS E DEFINIÇÕES
// ----------------------------------------------------------------------

// Adicionar os campos que esperamos do payload do token
interface CustomJwtPayload extends JwtPayload {
    userId: number; // O nome da chave no seu token é 'userId' (case sensitive)
    email: string;
    verified: boolean; // Campo extra opcional
}

// Definição de tipos para o objeto User que estará no estado
interface User {
  id: number;
  name: string; // Manter name para ser usado no Header
  email: string;
}

// Definição de tipos para o Contexto de Autenticação
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  authError: string | null;
}

// Criar o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL Base da API (Ajustar conforme necessário)
const API_BASE_URL = 'http://localhost:3000/api'; 

// ----------------------------------------------------------------------
// 2. FUNÇÕES AUXILIARES (USAM O DECODER REAL)
// ----------------------------------------------------------------------

// Função para extrair dados do utilizador a partir do Token JWT
const processToken = (token: string, nameOverride?: string): User | null => {
    try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        
        // 1. Verificar expiração
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            console.warn("Token expirado. Forçando logout.");
            return null;
        }

        // 2. Extrair dados críticos (ID e Email)
        if (decoded.userId && decoded.email) {
            const userObject: User = {
                id: decoded.userId,
                // Usamos o nome do form (register) ou a parte antes do @ do email como fallback
                name: nameOverride || decoded.email.split('@')[0], 
                email: decoded.email,
            };

            // 3. Persistir os dados do utilizador
            localStorage.setItem('user', JSON.stringify(userObject));
            return userObject;
        }
        
        return null;
    } catch (e) {
        console.error("Erro ao descodificar/processar token:", e);
        return null;
    }
};

// ----------------------------------------------------------------------
// 3. PROVIDER DE CONTEXTO
// ----------------------------------------------------------------------

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); 
    const [authError, setAuthError] = useState<string | null>(null);

    // Efeito para persistência do estado (Verifica o token e dados do user ao carregar)
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const storedUser = localStorage.getItem('user'); // Usado para obter o 'name' persistido

        if (token && storedUser) {
            try {
                const userFromStorage: User = JSON.parse(storedUser);
                // Re-processamos o token para verificar a validade e obter ID/Email
                const processedUser = processToken(token, userFromStorage.name); 

                if (processedUser) {
                     setUser(processedUser);
                } else {
                     // Token inválido ou expirado
                     localStorage.removeItem('jwtToken');
                     localStorage.removeItem('user');
                }
            } catch (e) {
                 // Erro no JSON guardado
                 localStorage.removeItem('jwtToken');
                 localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    // 4. Lógica de Login (/auth/signin)
    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok || !data.token) {
                throw new Error(data.message || 'Credenciais inválidas.');
            }

            // PROCESSAR TOKEN: Extrai ID, Email e guarda o Token e User no localStorage
            const loggedInUser = processToken(data.token);
            
            if (!loggedInUser) {
                 throw new Error('Login bem-sucedido, mas falha ao extrair dados do token.');
            }
            
            localStorage.setItem('jwtToken', data.token);
            setUser(loggedInUser);
            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 5. Lógica de Registo (/auth/register)
    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setAuthError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok || !data.token) {
                throw new Error(data.message || 'O registo falhou. Tente novamente.');
            }
            
            // PROCESSAR TOKEN: Extrai ID, Email e guarda o Token e User (passando o nome)
            const registeredUser = processToken(data.token, name);

            if (!registeredUser) {
                 throw new Error('Registo bem-sucedido, mas falha ao extrair dados do token.');
            }

            localStorage.setItem('jwtToken', data.token);
            setUser(registeredUser); 
            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setAuthError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 6. Lógica de Logout
    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user'); // Limpa também os dados persistidos
        setUser(null);
        setAuthError(null);
    }, []);

    const contextValue: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        authError,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {/* Renderiza um estado de loading enquanto verifica o token */}
            {isLoading ? (
                <div className="flex justify-center items-center min-h-screen bg-gray-950 text-amber-400">A Carregar Autenticação...</div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

// ----------------------------------------------------------------------
// 4. HOOK CONSUMIDOR
// ----------------------------------------------------------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};