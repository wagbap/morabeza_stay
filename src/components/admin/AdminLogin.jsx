// components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Lock, Mail, AlertCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // URL da API a partir de variável de ambiente, com fallback
  const API_URL = process.env.REACT_APP_API_URL || 'https://welovepalop.com/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      // Log para diagnóstico
      console.log('Status da resposta:', response.status);
      console.log('Headers:', response.headers);

      // Tentar ler a resposta mesmo se não for OK
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Se não for JSON, ler como texto para debug
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        throw new Error(`Resposta não é JSON (status ${response.status}): ${text.substring(0, 200)}`);
      }

      // Se a resposta não for OK (ex: 500, 404)
      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }

      // Verificar se a resposta tem a estrutura esperada
      if (!data.success) {
        throw new Error(data.message || 'Erro desconhecido na API');
      }

      // Verificar permissões de admin
      const user = data.user;
      const isAdmin = 
        user.role === 'admin' || 
        user.tipo === 'admin' ||
        (user.roles && user.roles.includes('admin')) ||
        user.isAdmin === true ||
        user.email === 'admin@morabezastay.com';

      if (!isAdmin) {
        throw new Error('Acesso negado: Não tens permissões de administrador.');
      }

      // Guardar dados do admin
      const adminData = {
        id: user.id,
        nome: user.nome || user.name || 'Admin',
        email: user.email,
        role: 'admin',
        isAdmin: true,
        foto: user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome || 'Admin')}&background=003580&color=fff`,
        token: data.token || null
      };

      localStorage.setItem('morabeza_admin', JSON.stringify(adminData));

      // Redirecionar
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Erro no login:', error);
      // Mostrar mensagem mais específica
      let mensagem = 'Erro de ligação ao servidor. Tenta novamente.';
      if (error.message) {
        // Se a mensagem de erro não for muito técnica, mostra-a
        if (!error.message.includes('Resposta não é JSON')) {
          mensagem = error.message;
        } else {
          // Se for erro de parse, sugerir verificar a API
          mensagem = 'A API retornou uma resposta inválida. Contacta o suporte.';
        }
      }
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1974&auto=format')",
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {/* Overlay Escuro/Azul para dar contraste */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/80 to-[#001a40]/90 backdrop-blur-sm"></div>

      {/* Container central com espaçamento entre os elementos */}
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

        {/* Botão Voltar FORA do card - abaixo */}
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