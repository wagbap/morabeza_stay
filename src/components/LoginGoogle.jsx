import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const LoginGoogle = ({ onLoginSuccess }) => {
  
  // Função que dispara o popup do Google
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // O tokenResponse dá-nos um access_token, precisamos de buscar os dados do user
      try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        const userObject = res.data;
        localStorage.setItem('user', JSON.stringify(userObject));
        if (onLoginSuccess) onLoginSuccess(userObject);
      } catch (err) {
        console.error("Erro ao buscar dados do user:", err);
      }
    },
    onError: () => console.log('Login Failed'),
  });

  return (
    <button 
      onClick={() => login()}
      className="flex items-center justify-center transition-all duration-300 group"
    >
      {/* NO MOBILE: Apenas o G circular | NO DESKTOP: Botão completo */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full p-2 md:px-4 md:py-2 shadow-sm hover:shadow-md transition-shadow">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
          alt="Google G" 
          className="w-5 h-5"
        />
        <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-700">
          Entrar com Google
        </span>
      </div>
    </button>
  );
};

export default LoginGoogle;