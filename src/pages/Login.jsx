import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginGoogle from '../components/LoginGoogle';

export default function Login() {
  const navigate = useNavigate();

  // Estados do fluxo
  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=Registo
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [otp, setOtp] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Estados do formulário de registo
  const [nome, setNome] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [roles, setRoles] = useState(['hospede']);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = 'https://welovepalop.com/api/auth_google.php';

  const handleRoleToggle = (roleName) => {
    if (roleName === 'hospede') return;
    if (roles.includes(roleName)) {
      setRoles(roles.filter(r => r !== roleName));
    } else {
      setRoles([...roles, roleName]);
    }
  };

  // PASSO 1: Verificar email
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
          // Email com senha - mostrar input de senha
          setShowPasswordInput(true);
          setSuccessMessage('Email encontrado! Insira sua senha.');
        } else {
          setErrorMessage('Esta conta foi criada com Google. Use o botão do Google.');
        }
      } else {
        // Novo email - enviar OTP
        await sendOtp();
      }
    } catch (err) {
      setErrorMessage('Erro ao verificar email.');
    } finally {
      setLoading(false);
    }
  };

  // Login com senha
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

  // Enviar OTP para novo registo
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
        setStep(2); // Vai para passo de validação OTP
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage('Erro ao enviar código.');
    }
  };

  // PASSO 2: Verificar OTP (ANTES do formulário)
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
        setStep(3); // Só depois de OTP válido mostra formulário
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

  // PASSO 3: Completar registo (só aparece após OTP válido)
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
        roles: roles
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
    localStorage.setItem('user', JSON.stringify(userForStorage));
    navigate('/');
    window.location.reload();
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

          {/* PASSO 1: Email */}
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

          {/* PASSO 2: Validar OTP (ANTES do formulário) */}
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

          {/* PASSO 3: Formulário de registo (SÓ APÓS OTP VÁLIDO) */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold mb-2">Criar a sua conta</h2>
              <p className="text-sm text-gray-600 mb-4">
                Complete os dados para finalizar o registo
              </p>

              <form onSubmit={handleCompleteRegister} className="space-y-4">
                {/* Roles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de conta:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRoleToggle('anfitrion')}
                      className={`p-3 border rounded-lg text-center transition ${
                        roles.includes('anfitrion') 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      🏠 Anfitrião
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleToggle('guia_experiencias')}
                      className={`p-3 border rounded-lg text-center transition ${
                        roles.includes('guia_experiencias') 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      🗺️ Guia
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleToggle('proprietario_veiculos')}
                      className={`p-3 border rounded-lg text-center transition col-span-2 ${
                        roles.includes('proprietario_veiculos') 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      🚗 Proprietário de Veículos
                    </button>
                  </div>
                </div>

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

          <p className="text-[11px] text-gray-600 text-center mt-6">
            Ao continuar, aceita os Termos e Condições e a Política de Privacidade.
          </p>
        </div>
      </main>
    </div>
  );
}