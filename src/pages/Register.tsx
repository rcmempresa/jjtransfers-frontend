import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';

// ----------------------------------------------------------------------
// MOCK para useLanguage e useLanguage: RESOLUÇÃO DE ERRO DE COMPILAÇÃO
// ----------------------------------------------------------------------

// Função de mock para useLanguage, que assume uma tradução simples em Português (t)
const useLanguage = () => {
  // Simula a função de tradução (t) para lidar com as chaves do frontend
  const t = (key) => {
    const translations = {
      'register.title': 'Criar Nova Conta',
      'register.subtitle': 'Junte-se a nós para aceder a reservas exclusivas.',
      'form.name': 'Nome Completo',
      'form.email': 'Endereço de Email',
      'form.password': 'Palavra-Passe (Mín. 8 cár., c/ Maiúsc., Minúsc. e Núm.)',
      'register.registrationFailed': 'O registo falhou. Tente outro email.',
      'register.registering': 'A Registar...',
      'register.button': 'Criar Conta',
      'register.haveAccount': 'Já tem conta? ',
      'register.loginHere': 'Entre aqui.',
    };
    return translations[key] || key; // Retorna a tradução ou a chave se não for encontrada
  };
  return { t, language: 'pt' };
};

// ----------------------------------------------------------------------
// SIMULAÇÃO DO HOOK DE AUTENTICAÇÃO
// ----------------------------------------------------------------------

// Este hook simula as chamadas de API para o registo.
const useAuth = () => {
    // Usando type assertions para simplificar, já que estamos num ambiente JS/JSX
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); 
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Função de Registo
    const register = async (name, email, password) => { // Mantido o 'name', mas veja a nota abaixo!
        setIsLoading(true);
        setError(null);

        // NOTA IMPORTANTE: O seu backend (authController.js) atualmente ignora o campo 'name'.
        // Ele apenas desestrutura { email, password } de req.body.
        // A validação Joi (signupSchema) também precisa ser atualizada para aceitar o 'name'.

        try {
            // Assumindo que VITE_BACKEND_URL aponta para o servidor
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Tratar erros de registo (400, 403, 409, 500)
                throw new Error(data.message || t('register.registrationFailed') || 'O registo falhou. Tente novamente.');
            }
            
            // Verifica se há token na resposta (se for o caso de autologin)
            if (data.result && data.result.token) {
                 localStorage.setItem('jwtToken', data.result.token); 
            }
           
            // Redirecionar para a Home ou para a página de perfil após sucesso
            navigate('/');
            
            return data.result; 

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading, error };
};
// ----------------------------------------------------------------------


const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useLanguage();
  const { register, isLoading, error } = useAuth(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    // A função register no hook simula o envio do nome, email e password
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
          <h1 className="text-3xl font-extrabold text-white">{t('register.title')}</h1>
          <p className="text-gray-400 mt-2">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo Nome */}
          <div className="relative group">
            <User className={iconClasses} />
            <input
              type="text"
              placeholder={t('form.name')}
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
              placeholder={t('form.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClasses} peer`}
              required
            />
          </div>

          {/* Campo Password - CORRIGIDO minLength e Placeholder */}
          <div className="relative group">
            <Lock className={iconClasses} />
            <input
              type="password"
              placeholder={t('form.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClasses} peer`}
              required
              minLength={8} 
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
                {t('register.registering')}
              </>
            ) : (
              <>
                {t('register.button')}
                <ArrowLeft className="w-5 h-5 ml-2 transform rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Link para Login */}
        <div className="mt-8 text-center text-gray-400">
          <Link to="/login" className={`text-sm ${goldColor} hover:text-amber-300 transition-colors font-medium`}>
            {t('register.haveAccount')}
            <span className="underline">{t('register.loginHere')}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;