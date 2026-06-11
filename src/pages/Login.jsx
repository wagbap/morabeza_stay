// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginGoogle from '../components/LoginGoogle';

export default function Login() {
  const navigate = useNavigate();

  // Estados do fluxo principal
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [otp, setOtp] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const [nome, setNome] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetUserId, setResetUserId] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = 'https://welovepalop.com/api/auth_google.php';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    setShowPasswordInput(false);

    try {
      const res = await axios.post(BACKEND_URL, { 
        action: 'check_email', 
        email: email.trim() 
      });
      
      if (res.data.status === 'exists') {
        if (res.data.has_password) {
          setShowPasswordInput(true);
          setSuccessMessage('Email encontrado! Insira sua senha.');
        } else {
          setErrorMessage('Esta conta foi criada com Google. Use o botão do Google.');
        }
      } else {
        await sendOtp();
      }
    } catch (err) {
      setErrorMessage('Erro ao verificar email.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.post(BACKEND_URL, {
        action: 'login_with_password',
        email: email.trim(),
        senha: senha
      });

      if (res.data.status === 'success') {
        salvarSessao(res.data.user);
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      const res = await axios.post(BACKEND_URL, {
        action: 'send_otp',
        email: email.trim()
      });

      if (res.data.status === 'otp_sent') {
        setSuccessMessage(`Enviamos um código de 6 dígitos para ${email}`);
        if (res.data.code_debug) {
          alert('Código de verificação: ' + res.data.code_debug);
        }
        setStep(2);
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao enviar código.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.post(BACKEND_URL, {
        action: 'verify_otp',
        email: email.trim(),
        otp: otp.trim()
      });

      if (res.data.status === 'success') {
        setUserId(res.data.user_id);
        setStep(3);
        setSuccessMessage('Email verificado! Complete o seu registo.');
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (nome.trim().length < 2) {
      setErrorMessage('Insira o seu nome completo.');
      setLoading(false);
      return;
    }
    if (senha.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(BACKEND_URL, {
        action: 'complete_register',
        user_id: userId,
        nome: nome.trim(),
        senha: senha,
        telefone: telefone.trim(),
        roles: ['hospede']
      });

      if (res.data.status === 'success') {
        salvarSessao(res.data.user);
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await axios.post(BACKEND_URL, {
        action: 'send_reset_otp',
        email: resetEmail.trim()
      });

      if (res.data.status === 'reset_otp_sent') {
        setSuccessMessage(`Enviamos um código de recuperação para ${resetEmail}`);
        if (res.data.code_debug) {
          alert('Código de recuperação: ' + res.data.code_debug);
        }
        setStep(5);
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao enviar código de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.post(BACKEND_URL, {
        action: 'verify_reset_otp',
        email: resetEmail.trim(),
        otp: resetOtp.trim()
      });

      if (res.data.status === 'success') {
        setResetUserId(res.data.user_id);
        setStep(6);
        setSuccessMessage('Código verificado! Defina a sua nova senha.');
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (novaSenha.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErrorMessage('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(BACKEND_URL, {
        action: 'reset_password',
        user_id: resetUserId,
        nova_senha: novaSenha
      });

      if (res.data.status === 'success') {
        setSuccessMessage('Senha alterada com sucesso! Faça login com a nova senha.');
        setTimeout(() => {
          setStep(1);
          setEmail(resetEmail);
          setResetEmail('');
          setResetOtp('');
          setNovaSenha('');
          setConfirmarNovaSenha('');
          setShowPasswordInput(true);
        }, 2000);
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };// ✅ A CORREÇÃO (O que tens de usar)
  const ProtectedRoute = ({ children }) => {
    const savedUser = localStorage.getItem('user') || localStorage.getItem('morabeza_user');
    
    // Só bloqueia se a pessoa realmente não tiver NADA no Local Storage
    if (!savedUser) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };
const salvarSessao = (user) => {
    const userForStorage = {
      id: user.id,
      sub: user.id,
      name: user.nome,
      email: user.email,
      picture: user.foto || "https://www.gravatar.com/avatar/?d=mp",
      phone: user.phone || '',
      roles: user.roles || ['hospede']
    };
    
    // Grava nas DUAS chaves
    localStorage.setItem('user', JSON.stringify(userForStorage));
    localStorage.setItem('morabeza_user', JSON.stringify(userForStorage));
    
    // Mata qualquer lixo antigo da sessão
    sessionStorage.clear();

    // 🚀 O SEGREDO ESTÁ AQUI: location.replace() apaga o histórico do /login.
    // O setTimeout dá tempo ao localStorage de gravar fisicamente no disco 
    // antes de destruir a página de login.
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };
  const handleBackToLogin = () => {
    setStep(1);
    setErrorMessage('');
    setSuccessMessage('');
    setResetEmail('');
    setResetOtp('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#003580] text-white px-6 py-4 shadow-md">
        <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
          Morabeza<span className="text-amber-400">Stay</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] bg-white p-8 rounded-lg shadow-sm border">
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
              {successMessage}
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-2">Iniciar sessão ou criar conta</h2>
              <p className="text-sm text-gray-600 mb-6">Insira o seu email para continuar</p>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Endereço de email"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#006ce4] hover:bg-[#0056b3] text-white font-medium py-2.5 rounded text-sm"
                >
                  {loading ? 'A processar...' : 'Continuar'}
                </button>
              </form>

              {showPasswordInput && (
                <form onSubmit={handlePasswordLogin} className="mt-4 space-y-4 border-t pt-4">
                  <input
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Palavra-passe"
                    className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#003580] hover:bg-[#002560] text-white font-medium py-2.5 rounded text-sm"
                  >
                    Entrar
                  </button>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(4);
                        setShowPasswordInput(false);
                        setErrorMessage('');
                      }}
                      className="text-center text-sm text-blue-600 hover:underline"
                    >
                      Esqueceu a palavra-passe?
                    </button>
                  </div>
                </form>
              )}

              <div className="relative my-6">
                <hr className="border-gray-300" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
                  ou
                </span>
              </div>

              <LoginGoogle />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-2">Verificar o seu email</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enviámos um código de 6 dígitos para <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Código de verificação"
                  className="w-full text-center text-2xl tracking-widest font-bold px-3 py-3 border border-gray-400 rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#006ce4] hover:bg-[#0056b3] text-white font-medium py-2.5 rounded text-sm"
                >
                  {loading ? 'A verificar...' : 'Verificar código'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-sm text-gray-500 hover:underline"
                >
                  Voltar
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold mb-2">Criar a sua conta</h2>
              <p className="text-sm text-gray-600 mb-4">
                Complete os dados para finalizar o registo como hóspede
              </p>

              <form onSubmit={handleCompleteRegister} className="space-y-4">
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                />

                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Número de telefone"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                />

                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Palavra-passe (mínimo 6 caracteres)"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                />

                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirmar palavra-passe"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#003580] hover:bg-[#002560] text-white font-medium py-2.5 rounded text-sm"
                >
                  {loading ? 'A criar conta...' : 'Criar conta'}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-bold mb-2">Recuperar palavra-passe</h2>
              <p className="text-sm text-gray-600 mb-4">
                Insira o seu email para receber um código de recuperação
              </p>

              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Endereço de email"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#006ce4] hover:bg-[#0056b3] text-white font-medium py-2.5 rounded text-sm"
                >
                  {loading ? 'A enviar...' : 'Enviar código'}
                </button>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-center text-sm text-gray-500 hover:underline"
                >
                  Voltar ao login
                </button>
              </form>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-xl font-bold mb-2">Verificar código</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enviámos um código de 6 dígitos para <strong>{resetEmail}</strong>
              </p>

              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  placeholder="Código de verificação"
                  className="w-full text-center text-2xl tracking-widest font-bold px-3 py-3 border border-gray-400 rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#006ce4] hover:bg-[#0056b3] text-white font-medium py-2.5 rounded text-sm"
                >
                  {loading ? 'A verificar...' : 'Verificar código'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full text-center text-sm text-gray-500 hover:underline"
                >
                  Voltar
                </button>
              </form>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-xl font-bold mb-2">Nova palavra-passe</h2>
              <p className="text-sm text-gray-600 mb-4">
                Defina uma nova senha para a sua conta
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova palavra-passe (mínimo 6 caracteres)"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                />
                <input
                  type="password"
                  required
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Confirmar nova palavra-passe"
                  className="w-full px-3 py-2.5 border border-gray-400 rounded text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#003580] hover:bg-[#002560] text-white font-medium py-2.5 rounded text-sm"
                >
                  {loading ? 'A alterar...' : 'Alterar palavra-passe'}
                </button>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-center text-sm text-gray-500 hover:underline"
                >
                  Cancelar
                </button>
              </form>
            </>
          )}

          <p className="text-[11px] text-gray-600 text-center mt-6">
            Ao continuar, aceita os Termos e Condições e a Política de Privacidade.
          </p>
        </div>
      </main>
    </div>
  );
}