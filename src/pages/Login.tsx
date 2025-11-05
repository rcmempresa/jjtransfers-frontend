import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth'; // 🛑 IMPORTAÇÃO DO HOOK GLOBAL

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useLanguage();
  // 🛑 USAR O HOOK GLOBAL
  const { login, isLoading, error, isAuthenticated } = useAuth(); 
  const navigate = useNavigate();

  // 🛑 NOVO: Impede que o utilizador aceda a esta página se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Utilizador já autenticado. Redirecionando para /");
      navigate('/'); 
    }
  }, [isAuthenticated, navigate]); 
  
  // 🛑 Lógica de submissão atualizada
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Chama a função login do hook global
    await login(email, password);
    
    // O redirecionamento será gerido pelo useEffect, pois o estado isAuthenticated irá mudar
  };

  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/90 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 pl-12 transition-all duration-300";
  const buttonClasses = "w-full bg-amber-400 text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-colors flex items-center justify-center";
  const goldColor = 'text-amber-400';
  const iconClasses = "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 peer-focus:text-amber-400 transition-colors duration-300";

  // Se o utilizador estiver autenticado, não renderizamos o formulário (o useEffect faz o redirecionamento)
  if (isAuthenticated && !isLoading) {
      return null; 
  }
  
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 pt-24">
      
      {/* Container Principal do Formulário */}
      <div className="w-full max-w-md bg-black/90 rounded-2xl shadow-2xl border border-gray-800 p-8 sm:p-10">
        
        {/* Título */}
        <div className="text-center mb-8">
          <LogIn className={`w-10 h-10 mx-auto mb-4 ${goldColor}`} />
          <h1 className="text-3xl font-extrabold text-white">{t('login.title') || 'Aceda à Sua Conta'}</h1>
          <p className="text-gray-400 mt-2">{t('login.subtitle') || 'Use o seu email e password para continuar.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
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
              placeholder={t('form.password') || "Palavra-Passe"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClasses} peer`}
              required
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
                {t('login.loggingIn') || 'A Entrar...'}
              </>
            ) : (
              <>
                {t('login.button') || 'Entrar'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Links Adicionais */}
        <div className="mt-8 text-center text-gray-400">
          <Link to="/register" className={`text-sm ${goldColor} hover:text-amber-300 transition-colors font-medium`}>
            {t('login.noAccount') || "Não tem conta? "}
            <span className="underline">{t('login.registerHere') || "Registe-se aqui."}</span>
          </Link>
          
          <p className="text-xs mt-3">
              <Link to="/forgot-password" className="hover:underline text-gray-500">
                {t('login.forgotPassword') || "Esqueceu-se da Palavra-Passe?"}
              </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;