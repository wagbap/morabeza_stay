// src/components/LoginGoogle.jsx
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginGoogle = ({ onLoginSuccess }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Buscar dados do usuário no Google
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        const googleUser = userInfo.data;
        
        // Enviar para o backend
        const response = await axios.post('https://welovepalop.com/api/auth_google.php', {
          action: 'google_login',
          google_id: googleUser.sub,
          email: googleUser.email,
          nome: googleUser.name,
          foto: googleUser.picture
        });
        
        if (response.data.status === 'success') {
          // Salvar no localStorage
          const userForStorage = {
            id: response.data.user.id,
            sub: response.data.user.id,
            name: response.data.user.nome,
            email: response.data.user.email,
            picture: response.data.user.foto || googleUser.picture,
            full_name: response.data.user.nome
          };
          
          localStorage.setItem('user', JSON.stringify(userForStorage));
          
          if (onLoginSuccess) {
            onLoginSuccess(userForStorage);
          }
          
          window.location.reload();
        } else {
          alert('Erro ao fazer login: ' + response.data.message);
        }
      } catch (err) {
        console.error('Erro no login com Google:', err);
        alert('Erro ao fazer login com Google. Tente novamente.');
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      alert('Erro ao fazer login com Google.');
    },
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition w-full"
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
        alt="Google" 
        className="w-5 h-5"
      />
      <span className="text-sm font-medium text-gray-700">Continuar com Google</span>
    </button>
  );
};

export default LoginGoogle;