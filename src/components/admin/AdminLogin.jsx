// components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Lock, Mail, AlertCircle, Loader2, Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Tentar autenticação via API
      const response = await fetch('/api/admin/login.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          senha: senha
        })
      });

      // Verificar se a resposta é OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Verificar se o utilizador tem permissões de admin
        const isAdmin = 
          data.user.role === 'admin' || 
          data.user.tipo === 'admin' ||
          (data.user.roles && data.user.roles.includes('admin')) ||
          data.user.isAdmin === true ||
          data.user.email === 'admin@morabezastay.com';

        if (isAdmin) {
          // Guardar dados do admin no localStorage
          const adminData = {
            id: data.user.id,
            nome: data.user.nome || data.user.name,
            email: data.user.email,
            role: 'admin',
            isAdmin: true,
            foto: data.user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.nome || 'Admin')}&background=003580&color=fff`,
            token: data.token || null
          };
          
          localStorage.setItem('morabeza_admin', JSON.stringify(adminData));
          
          // Redirecionar para o dashboard
          navigate('/admin/dashboard');
        } else {
          setErro('Acesso negado: Não tens permissões de administrador.');
        }
      } else {
        setErro(data.message || 'Email ou palavra-passe incorretos.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErro('Erro de ligação ao servidor. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1974&auto=format')",
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {/* Overlay Escuro/Azul para dar contraste */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/80 to-[#001a40]/90 backdrop-blur-sm"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl">
        
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white/20 p-4 rounded-full mb-3 shadow-inner backdrop-blur-sm">
            <Shield className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            MORABEZA<span className="font-light">.STAY</span>
          </h2>
          <p className="text-white/80 mt-1 text-sm">Área Restrita - Administração</p>
        </div>

        {/* Mensagem de Erro Dinâmica */}
        {erro && (
          <div className="mb-6 p-3 bg-red-500/80 backdrop-blur-md text-white rounded-xl flex items-center gap-2 text-sm shadow-md">
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
              <input 
                type="email" 
                placeholder="Email do Administrador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
              <input 
                type="password" 
                placeholder="Palavra-passe"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-white text-[#003580] hover:bg-gray-100 font-bold rounded-xl py-3 shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            Acesso restrito a administradores autorizados
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;