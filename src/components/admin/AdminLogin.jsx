// components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo || !senha) {
      setErro('Preenche o email e a palavra-passe.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErro('Introduz um email válido.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://welovepalop.com/api/admin/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: emailLimpo,
          senha,
        }),
      });

      if (response.status === 429) {
        setErro('Demasiadas tentativas. Tenta novamente em 15 minutos.');
        return;
      }

      // Lê como texto primeiro para não explodir se vier HTML
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error('Resposta não-JSON do servidor:', raw.slice(0, 200));
        setErro('Resposta inválida do servidor. Verifica a API.');
        return;
      }

      if (!data?.success) {
        setErro(data?.message || 'Email ou palavra-passe incorretos.');
        return;
      }

      const isAdmin =
        data.user?.role === 'admin' ||
        data.user?.tipo === 'admin' ||
        data.user?.isAdmin === true ||
        (Array.isArray(data.user?.roles) && data.user.roles.includes('admin')) ||
        data.user?.email === 'admin@morabezastay.com';

      if (!isAdmin) {
        setErro('Acesso negado: Não tens permissões de administrador.');
        return;
      }

      const adminData = {
        id: data.user.id,
        nome: data.user.nome || data.user.name || 'Admin',
        email: data.user.email,
        role: 'admin',
        isAdmin: true,
        foto:
          data.user.foto ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            data.user.nome || 'Admin'
          )}&background=003580&color=fff`,
        token: data.token || null,
      };

      localStorage.setItem('morabeza_admin', JSON.stringify(adminData));

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      setErro('Erro de ligação ao servidor. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1974&auto=format')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/80 to-[#001a40]/90 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md px-4">
        {/* Glassmorphism Card */}
        <div className="w-full p-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white/20 p-4 rounded-full mb-3 shadow-inner backdrop-blur-sm">
              <Shield className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              MORABEZA<span className="font-light">.STAY</span>
            </h2>
            <p className="text-white/80 mt-1 text-sm">Área Restrita - Administração</p>
          </div>

          {erro && (
            <div className="mb-6 p-3 bg-red-500/80 backdrop-blur-md text-white rounded-xl flex items-center gap-2 text-sm shadow-md">
              <AlertCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Email do Administrador"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"
                  size={20}
                />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Palavra-passe"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  aria-label={mostrarSenha ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-white text-[#003580] hover:bg-gray-100 font-bold rounded-xl py-3 shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>A entrar...</span>
                </>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/admin/recuperar"
              className="text-white/70 hover:text-white text-xs underline underline-offset-2 transition-colors"
            >
              Esqueci-me da palavra-passe
            </Link>
            <p className="text-white/60 text-xs">
              Acesso restrito a administradores autorizados
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 shadow-lg"
        >
          <ArrowLeft size={18} />
          Voltar ao Site Principal
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;