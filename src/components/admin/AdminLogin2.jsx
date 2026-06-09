import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

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
      // ATENÇÃO: Substitui o URL pelo caminho correto da tua API
      const response = await fetch('https://welovepalop.com/api/auth_admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login_with_password',
          email: email,
          senha: senha
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Verifica se o utilizador tem a role de admin
        if (data.user.roles && data.user.roles.includes('admin')) {
          // Guarda os dados na sessão (LocalStorage)
          localStorage.setItem('morabeza_admin', JSON.stringify(data.user));
          // Redireciona para o painel de controlo
          navigate('/admin/dashboard');
        } else {
          setErro('Acesso negado: Não tens permissões de administrador.');
        }
      } else {
        setErro(data.message || 'Email ou palavra-passe incorretos.');
      }
    } catch (error) {
      setErro('Erro de ligação ao servidor. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/caminho-para-sua-imagem-de-praia.jpg')" }}
    >
      {/* Overlay Escuro/Azul para dar contraste */}
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl">
        
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white/30 p-3 rounded-full mb-3 shadow-inner">
            <Sun className="text-green-400" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-[#003580] tracking-wide">
            MORABEZA<span className="font-light">.STAY</span>
          </h2>
          <p className="text-white/90 mt-1">Acesso Restrito ao Administrador</p>
        </div>

        {/* Mensagem de Erro Dinâmica */}
        {erro && (
          <div className="mb-6 p-3 bg-red-500/80 backdrop-blur-md text-white rounded-xl flex items-center gap-2 text-sm shadow-md animate-pulse">
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#003580]/70" size={20} />
              <input 
                type="email" 
                placeholder="Email do Administrador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/40 border border-white/50 text-[#003580] placeholder-[#003580]/60 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#003580]/50 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#003580]/70" size={20} />
              <input 
                type="password" 
                placeholder="Palavra-passe"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-white/40 border border-white/50 text-[#003580] placeholder-[#003580]/60 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#003580]/50 transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-[#003580] hover:bg-[#002860] text-white font-semibold rounded-xl py-3 shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Painel'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;