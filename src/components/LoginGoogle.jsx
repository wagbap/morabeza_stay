import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode"; // Precisas de: npm install jwt-decode

const LoginGoogle = () => {
  const onSuccess = (credentialResponse) => {
    // O Google envia um Token (JWT). Precisamos de o descodificar para ver o nome e foto.
    const userObject = jwtDecode(credentialResponse.credential);
    console.log("Utilizador logado:", userObject);
    
    // Aqui podes guardar no localStorage para manter a sessão ativa
    localStorage.setItem('user', JSON.stringify(userObject));
    
    // Faz refresh ou atualiza o estado global para mostrar a foto do user na Navbar
    window.location.reload();
  };

  const onError = () => {
    console.log('Erro ao fazer login com Google');
  };

  return (
    <div className="flex items-center justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap
        theme="outline"
        shape="pill"
        size="medium"
        text="signin_with"
      />
    </div>
  );
};

export default LoginGoogle;