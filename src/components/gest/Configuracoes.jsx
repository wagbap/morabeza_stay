import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Users, 
  Settings2, 
  CreditCard, 
  Lock, 
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  Send
} from 'lucide-react';

export default function Configuracoes() {
  const [activeMenu, setActiveMenu] = useState('Dados pessoais');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    nome: '',
    nome_exibicao: '',
    email: '',
    telefone: '',
    foto: ''
  });
  
  // Estado para segurança
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Carregar dados do usuário
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      
      // Buscar dados atualizados da API
      const response = await fetch(`https://welovepalop.com/api/usuarios/buscar.php?usuario_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const userData = data.data;
        setUsuarioLogado(userData);
        setFormData({
          nome: userData.nome || '',
          nome_exibicao: userData.nome_exibicao || userData.nome || '',
          email: userData.email || '',
          telefone: userData.phone || '',
          foto: userData.foto || ''
        });
        setEmailVerificado(userData.email_verificado === 1 || userData.email_verificado === true);
      } else {
        setUsuarioLogado(user);
        setFormData({
          nome: user.nome || '',
          nome_exibicao: user.nome || '',
          email: user.email || '',
          telefone: user.phone || '',
          foto: user.foto || ''
        });
        // Verificar status do email via API separada
        checkEmailVerification(user.id);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUsuarioLogado(user);
        setFormData({
          nome: user.nome || '',
          nome_exibicao: user.nome || '',
          email: user.email || '',
          telefone: user.phone || '',
          foto: user.foto || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEmailVerification = async (userId) => {
    try {
      const response = await fetch('https://welovepalop.com/api/auth_google.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_email_verified',
          user_id: userId
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setEmailVerificado(data.data.verificado === true);
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
    }
  };

  const handleReenviarOtp = async () => {
    setVerificandoEmail(true);
    setEmailMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('https://welovepalop.com/api/auth_google.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_verification_otp',
          user_id: usuarioLogado.id
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setShowOtpModal(true);
        setEmailMessage({ type: 'success', text: 'Código enviado para o seu email!' });
        setTimeout(() => setEmailMessage({ type: '', text: '' }), 3000);
      } else {
        setEmailMessage({ type: 'error', text: data.message || 'Erro ao enviar código' });
      }
    } catch (error) {
      setEmailMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setVerificandoEmail(false);
    }
  };

  const handleVerificarOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setEmailMessage({ type: 'error', text: 'Digite o código de 6 dígitos' });
      return;
    }
    
    setVerificandoEmail(true);
    
    try {
      const response = await fetch('https://welovepalop.com/api/auth_google.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: formData.email,
          otp: otpCode
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setEmailVerificado(true);
        setShowOtpModal(false);
        setOtpCode('');
        setEmailMessage({ type: 'success', text: 'Email verificado com sucesso!' });
        
        // Atualizar localStorage
        const updatedUser = { ...usuarioLogado, email_verificado: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUsuarioLogado(updatedUser);
        
        setTimeout(() => setEmailMessage({ type: '', text: '' }), 3000);
      } else {
        setEmailMessage({ type: 'error', text: data.message || 'Código inválido ou expirado' });
      }
    } catch (error) {
      setEmailMessage({ type: 'error', text: 'Erro ao verificar código' });
    } finally {
      setVerificandoEmail(false);
    }
  };

  const menuItems = [
    { id: 'Dados pessoais', icon: <User className="w-5 h-5" />, label: 'Dados pessoais' },
    { id: 'Segurança', icon: <ShieldCheck className="w-5 h-5" />, label: 'Definições de segurança' },
    { id: 'Viajantes', icon: <Users className="w-5 h-5" />, label: 'Outros viajantes' },
    { id: 'Personalização', icon: <Settings2 className="w-5 h-5" />, label: 'Preferências de personalização' },
    { id: 'Pagamento', icon: <CreditCard className="w-5 h-5" />, label: 'Métodos de pagamento' },
    { id: 'Privacidade', icon: <Lock className="w-5 h-5" />, label: 'Gestão de dados e de privacidade' },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('https://welovepalop.com/api/usuarios/atualizar_perfil.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioLogado.id,
          nome: formData.nome,
          phone: formData.telefone,
          nome_exibicao: formData.nome_exibicao
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updatedUser = { ...usuarioLogado, nome: formData.nome, phone: formData.telefone };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUsuarioLogado(updatedUser);
        setEditando(false);
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('https://welovepalop.com/api/auth_google.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          user_id: usuarioLogado.id,
          nova_senha: newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordFields(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao alterar senha' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full text-[#0f172a] px-4 py-6 md:px-0">
      
      {/* Modal OTP */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Verificar Email</h2>
              <button onClick={() => { setShowOtpModal(false); setOtpCode(''); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Enviamos um código de verificação para <strong>{formData.email}</strong>
            </p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Digite o código de 6 dígitos"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowOtpModal(false); setOtpCode(''); }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerificarOtp}
                disabled={verificandoEmail}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-950 transition flex items-center justify-center gap-2"
              >
                {verificandoEmail ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Verificar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* NAVEGAÇÃO LATERAL */}
        <aside className="w-full lg:w-[300px] flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide bg-white lg:bg-transparent p-2 lg:p-0 rounded-xl border border-gray-100 lg:border-0 shadow-sm lg:shadow-none">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-all whitespace-nowrap lg:whitespace-normal w-full
                  ${activeMenu === item.id 
                    ? 'bg-[#eff6ff] text-[#2563eb] shadow-sm' 
                    : 'text-[#64748b] hover:bg-gray-50'
                  }`}
              >
                <span className={activeMenu === item.id ? 'text-[#2563eb]' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          
          {/* DADOS PESSOAIS */}
          {activeMenu === 'Dados pessoais' && (
            <>
              <div className="p-6 md:p-8 flex justify-between items-start border-b border-gray-50">
                <div>
                  <h1 className="text-[24px] font-bold mb-1">Dados pessoais</h1>
                  <p className="text-[14px] text-[#64748b]">
                    Atualize a sua informação e saiba como esta é usada.
                  </p>
                </div>
                
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-[#f1f5f9] border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                    <img 
                      src={formData.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nome)}&background=0D8ABC&color=fff&size=100`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-100 group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`mx-6 md:mx-8 mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              {emailMessage.text && (
                <div className={`mx-6 md:mx-8 mt-4 p-3 rounded-lg ${emailMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {emailMessage.text}
                </div>
              )}

              <div className="divide-y divide-gray-50">
                <SettingRow 
                  label="Nome" 
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  editando={editando}
                />

                <SettingRow 
                  label="Nome de exibição" 
                  name="nome_exibicao"
                  value={formData.nome_exibicao}
                  onChange={handleInputChange}
                  editando={editando}
                  placeholder="Escolha um nome de exibição"
                />

                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-4 md:gap-0">
                  <div className="w-full md:w-1/3">
                    <span className="text-[14px] font-bold text-[#0f172a]">Endereço de e-mail</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[14px] text-[#334155]">{formData.email}</span>
                      {emailVerificado ? (
                        <span className="flex items-center gap-1 bg-[#e8f6ed] text-[#16a34a] px-2 py-0.5 rounded text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Verificado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-[#fef3c7] text-[#d97706] px-2 py-0.5 rounded text-[11px] font-bold">
                          <AlertCircle className="w-3 h-3" /> Não verificado
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#64748b] leading-relaxed max-w-lg mb-4">
                      Este é o e-mail que usa para iniciar sessão. É também para onde enviamos as confirmações de reserva.
                    </p>
                    
                    {!emailVerificado && (
                      <div className="bg-[#fffbeb] border border-[#fef3c7] p-4 rounded-xl">
                        <p className="text-[13px] text-[#92400e] mb-3">
                          ⚠️ O seu email ainda não foi verificado. Clique no botão abaixo para receber o código de verificação.
                        </p>
                        <button
                          onClick={handleReenviarOtp}
                          disabled={verificandoEmail}
                          className="text-[13px] font-bold text-[#2563eb] hover:underline flex items-center gap-2"
                        >
                          {verificandoEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Reenviar código de verificação
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <SettingRow 
                  label="Número de telefone" 
                  name="telefone"
                  value={formData.telefone || ''}
                  onChange={handleInputChange}
                  editando={editando}
                  placeholder="Insira o seu número de telefone"
                />
              </div>

              <div className="p-6 md:p-8 flex justify-end gap-3 border-t border-gray-50">
                {editando ? (
                  <>
                    <button
                      onClick={() => { setEditando(false); fetchUserData(); setMessage({ type: '', text: '' }); }}
                      className="px-6 py-2 rounded-lg text-[14px] font-medium border border-gray-300 hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition flex items-center gap-2"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditando(true)}
                    className="px-6 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition"
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </>
          )}

          {/* SEGURANÇA */}
          {activeMenu === 'Segurança' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Definições de segurança</h1>
                <p className="text-[14px] text-[#64748b]">
                  Gerencie a sua palavra-passe e segurança da conta.
                </p>
              </div>

              {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-[16px] font-bold mb-1">Palavra-passe</h3>
                      <p className="text-[13px] text-[#64748b]">Altere a sua palavra-passe de acesso</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-[14px] font-bold text-[#2563eb] hover:underline"
                    >
                      {showPasswordFields ? 'Cancelar' : 'Alterar'}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#334155] mb-1">Nova palavra-passe</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Digite a nova senha"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#334155] mb-1">Confirmar nova palavra-passe</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition flex items-center gap-2"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar nova palavra-passe
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50/30">
                  <h3 className="text-[16px] font-bold mb-1">Sessões ativas</h3>
                  <p className="text-[13px] text-[#64748b] mb-4">
                    Gerencie os dispositivos onde está conectado.
                  </p>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[14px] font-medium">Dispositivo atual</p>
                      <p className="text-[12px] text-gray-400">{navigator.userAgent.split(' ').slice(-3).join(' ') || 'Chrome no Windows'}</p>
                    </div>
                    <span className="text-[12px] text-green-600 font-medium">Ativo agora</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OUTROS VIAJANTES */}
          {activeMenu === 'Viajantes' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Outros viajantes</h1>
                <p className="text-[14px] text-[#64748b]">
                  Adicione e gerencie perfis de familiares e amigos.
                </p>
              </div>
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400">Nenhum viajante adicionado</p>
                <button className="mt-4 text-[#2563eb] font-medium hover:underline">
                  + Adicionar viajante
                </button>
              </div>
            </div>
          )}

          {/* PREFERÊNCIAS */}
          {activeMenu === 'Personalização' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Preferências de personalização</h1>
                <p className="text-[14px] text-[#64748b]">
                  Configure as suas preferências de idioma e notificações.
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium">Idioma</h3>
                    <p className="text-[12px] text-gray-400">Português (Portugal)</p>
                  </div>
                  <button className="text-[#2563eb] text-sm">Alterar</button>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium">Notificações por e-mail</h3>
                    <p className="text-[12px] text-gray-400">Receber atualizações de reservas</p>
                  </div>
                  <button className="text-[#2563eb] text-sm">Configurar</button>
                </div>
              </div>
            </div>
          )}

          {/* PAGAMENTO */}
          {activeMenu === 'Pagamento' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Métodos de pagamento</h1>
                <p className="text-[14px] text-[#64748b]">
                  Gerencie os seus cartões e formas de pagamento.
                </p>
              </div>
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400">Nenhum método de pagamento adicionado</p>
                <button className="mt-4 text-[#2563eb] font-medium hover:underline">
                  + Adicionar cartão
                </button>
              </div>
            </div>
          )}

          {/* PRIVACIDADE */}
          {activeMenu === 'Privacidade' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Gestão de dados e de privacidade</h1>
                <p className="text-[14px] text-[#64748b]">
                  Controle os seus dados e configurações de privacidade.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium mb-2">Download dos seus dados</h3>
                  <p className="text-[12px] text-gray-400 mb-3">Obtenha uma cópia de todos os seus dados.</p>
                  <button className="text-[#2563eb] text-sm font-medium">Solicitar download</button>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium mb-2 text-red-600">Eliminar conta</h3>
                  <p className="text-[12px] text-gray-400 mb-3">Elimine permanentemente a sua conta e todos os dados.</p>
                  <button className="text-red-600 text-sm font-medium">Eliminar conta</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

// --- SUB-COMPONENTE PARA AS LINHAS DE DEFINIÇÃO ---
function SettingRow({ label, name, value, onChange, editando, placeholder }) {
  return (
    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-4 md:gap-0">
      <div className="w-full md:w-1/3">
        <span className="text-[14px] font-bold text-[#0f172a]">{label}</span>
      </div>
      <div className="flex-1">
        {editando ? (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[14px]"
          />
        ) : (
          <span className={`text-[14px] ${!value ? 'text-[#64748b]' : 'text-[#334155]'}`}>
            {value || placeholder || 'Não informado'}
          </span>
        )}
      </div>

    </div>
  );
}