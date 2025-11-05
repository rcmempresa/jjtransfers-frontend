import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

// ----------------------------------------------------------------------
// SIMULAÇÃO DO HOOK DE AUTENTICAÇÃO (Adicionar função register)
// ----------------------------------------------------------------------
const API_BASE_URL = 'http://localhost:3000/api'; 

// Este hook simula as chamadas de API para o registo.
const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Função de Registo
    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok || !data.token) {
                // Tratar erro de registo (e.g., email já em uso)
                throw new Error(data.message || t('register.registrationFailed') || 'O registo falhou. Tente outro email.');
            }

            // 1. Armazenar o Token JWT no localStorage após o registo (autologin)
            localStorage.setItem('jwtToken', data.token);
            
            // 2. Redirecionar para a Home ou para a página de perfil
            navigate('/');
            
            // Retornar os dados do utilizador ou um indicador de sucesso
            return data.user; 

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Apenas a função register é necessária para esta página
    return { register, isLoading, error };
};
// ----------------------------------------------------------------------


const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useLanguage();
  const { register, isLoading, error } = useAuth(); // Usar o hook simulado

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, password);
  };

  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/90 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 pl-12 transition-all duration-300";
  const buttonClasses = "w-full bg-amber-400 text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-colors flex items-center justify-center";
  const goldColor = 'text-amber-400';
  const iconClasses = "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 peer-focus:text-amber-400 transition-colors duration-300";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 pt-24">
      
      {/* Container Principal do Formulário */}
      <div className="w-full max-w-md bg-black/90 rounded-2xl shadow-2xl border border-gray-800 p-8 sm:p-10">
        
        {/* Título */}
        <div className="text-center mb-8">
          <UserPlus className={`w-10 h-10 mx-auto mb-4 ${goldColor}`} />
          <h1 className="text-3xl font-extrabold text-white">{t('register.title') || 'Criar Nova Conta'}</h1>
          <p className="text-gray-400 mt-2">{t('register.subtitle') || 'Junte-se a nós para aceder a reservas exclusivas.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo Nome */}
          <div className="relative group">
            <User className={iconClasses} />
            <input
              type="text"
              placeholder={t('form.name') || "Nome Completo"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClasses} peer`}
              required
            />
          </div>

          {/* Campo Email */}
          <div className="relative group">
            <Mail className={iconClasses} />
            <input
              type="email"
              placeholder={t('form.email') || "Endereço de Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClasses} peer`}
              required
            />
          </div>

          {/* Campo Password */}
          <div className="relative group">
            <Lock className={iconClasses} />
            <input
              type="password"
              placeholder={t('form.password') || "Palavra-Passe (mínimo 6 caracteres)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClasses} peer`}
              required
              minLength={6}
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 bg-red-800/70 text-red-100 rounded-lg text-sm border border-red-600">
              {error}
            </div>
          )}

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={isLoading}
            className={`${buttonClasses} ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                {t('register.registering') || 'A Registar...'}
              </>
            ) : (
              <>
                {t('register.button') || 'Criar Conta'}
                <ArrowLeft className="w-5 h-5 ml-2 transform rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Link para Login */}
        <div className="mt-8 text-center text-gray-400">
          <Link to="/login" className={`text-sm ${goldColor} hover:text-amber-300 transition-colors font-medium`}>
            {t('register.haveAccount') || "Já tem conta? "}
            <span className="underline">{t('register.loginHere') || "Entre aqui."}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;