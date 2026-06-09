import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  Send,
  Award,
  Home,
  Compass,
  Car,
  Briefcase,
  Plus,
  Trash2,
  Shield,
  Hotel,
  FileText
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
  
  const [userRoles, setUserRoles] = useState([]);
  const [userRoleNames, setUserRoleNames] = useState([]);
  const [isHospede, setIsHospede] = useState(false);
  const [isAnfitriao, setIsAnfitriao] = useState(false);
  const [isGuia, setIsGuia] = useState(false);
  const [isProprietario, setIsProprietario] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    nome_exibicao: '',
    email: '',
    telefone: '',
    foto: ''
  });
  
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const roleMapping = {
    'hospede': 1,
    'anfitrion': 2,
    'guia_experiencias': 3,
    'proprietario_veiculos': 4
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUserData();
    };
    loadData();
  }, []);

  // Monitoriza as alterações de roles para atualizar as flags de renderização de privilégios
  useEffect(() => {
    if (usuarioLogado?.id) {
      fetchUserRoles();
    }
  }, [usuarioLogado]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      
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
        setEmailVerificado(userData.email_verificado == 1 || userData.email_verificado === true);
      } else {
        setUsuarioLogado(user);
        setFormData({
          nome: user.nome || '',
          nome_exibicao: user.nome || '',
          email: user.email || '',
          telefone: user.phone || '',
          foto: user.foto || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await fetch(`https://welovepalop.com/api/usuarios/listar_roles.php?usuario_id=${usuarioLogado.id}`);
      const data = await response.json();
      
      if (data.success) {
        setUserRoles(data.roles);
        
        // Apenas as aprovadas contam como funções ativas no ecossistema de uso do cliente
        const approvedRoleNames = data.roles
          .filter(r => r.status === 'approved')
          .map(r => r.name);
          
        setUserRoleNames(approvedRoleNames);
        setIsHospede(approvedRoleNames.includes('hospede'));
        setIsAnfitriao(approvedRoleNames.includes('anfitrion'));
        setIsGuia(approvedRoleNames.includes('guia_experiencias'));
        setIsProprietario(approvedRoleNames.includes('proprietario_veiculos'));
      }
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
    }
  };

  const handleFileUploadAndRequest = async (e, roleName) => {
    if (!e.target.files[0]) return;
    setLoadingRoles(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Enviar arquivo para a API de Upload
      const fileData = new FormData();
      fileData.append('documento', e.target.files[0]);

      const resUp = await fetch('https://welovepalop.com/api/usuarios/upload_documento.php', {
        method: 'POST',
        body: fileData
      });
      const dataUp = await resUp.json();

      if (!dataUp.success) {
        setMessage({ type: 'error', text: dataUp.message || 'Falha ao processar arquivo.' });
        setLoadingRoles(false);
        return;
      }

      // 2. Criar pedido de vinculo comercial
      const resRequest = await fetch('https://welovepalop.com/api/usuarios/solicitar_role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: parseInt(usuarioLogado.id),
          role_id: roleMapping[roleName],
          documento_url: dataUp.documento_url
        })
      });
      const dataRequest = await resRequest.json();

      if (dataRequest.success) {
        setMessage({ type: 'success', text: dataRequest.message });
        await fetchUserRoles();
      } else {
        setMessage({ type: 'error', text: dataRequest.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Ocorreu um erro ao comunicar com o servidor.' });
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleRemoveRole = async (roleName) => {
    if (roleName === 'hospede') {
      setMessage({ type: 'error', text: 'A função de Hóspede é a base da sua conta e não pode ser removida.' });
      return;
    }
    
    setLoadingRoles(true);
    try {
      const response = await fetch('https://welovepalop.com/api/usuarios/remover_role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: parseInt(usuarioLogado.id),
          role_id: roleMapping[roleName]
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Função removida da sua conta com sucesso.' });
        await fetchUserRoles();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao remover função.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao ligar ao servidor.' });
    } finally {
      setLoadingRoles(false);
    }
  };

  const getMenuItems = () => {
    const items = [
      { id: 'Dados pessoais', icon: <User className="w-5 h-5" />, label: 'Dados pessoais' },
      { id: 'Segurança', icon: <ShieldCheck className="w-5 h-5" />, label: 'Definições de segurança' },
      { id: 'Gerenciar Funções', icon: <Briefcase className="w-5 h-5" />, label: 'Gerenciar Funções' }
    ];
    if (isAnfitriao || isGuia || isProprietario) {
      items.push({ id: 'Privilégios', icon: <Award className="w-5 h-5" />, label: 'Meus Privilégios' });
    }
    return items;
  };

  const menuItems = getMenuItems();

  const getRoleIcon = (roleName) => {
    switch(roleName) {
      case 'hospede': return { icon: <Hotel className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'anfitrion': return { icon: <Home className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'guia_experiencias': return { icon: <Compass className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'proprietario_veiculos': return { icon: <Car className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' };
      default: return { icon: <Shield className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getRoleDisplayName = (roleName) => {
    switch(roleName) {
      case 'hospede': return 'Hóspede';
      case 'anfitrion': return 'Anfitrião';
      case 'guia_experiencias': return 'Guia de Experiências';
      case 'proprietario_veiculos': return 'Proprietário de Veículos';
      default: return roleName;
    }
  };

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
        setNewPassword(''); setConfirmPassword(''); setShowPasswordFields(false);
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

  if (loading) {
    return (
      <div className="max-w-6xl w-full px-4 py-6 flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full px-4 py-6 md:px-0">
      
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
              <button onClick={() => { setShowOtpModal(false); setOtpCode(''); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleVerificarOtp} disabled={verificandoEmail} className="flex-1 px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-950 transition flex items-center justify-center gap-2">
                {verificandoEmail ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Verificar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        <aside className="w-full lg:w-[300px] flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible bg-white lg:bg-transparent p-2 lg:p-0 rounded-xl border border-gray-100 lg:border-0 shadow-sm lg:shadow-none">
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

        <main className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {activeMenu === 'Dados pessoais' && (
            <>
              <div className="p-6 md:p-8 flex justify-between items-start border-b border-gray-50">
                <div>
                  <h1 className="text-[24px] font-bold mb-1">Dados pessoais</h1>
                  <p className="text-[14px] text-[#64748b]">Atualize a sua informação pessoal.</p>
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

              {(message.text || emailMessage.text) && (
                <div className={`mx-6 md:mx-8 mt-4 p-3 rounded-lg ${message.type === 'success' || emailMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text || emailMessage.text}
                </div>
              )}

              <div className="divide-y divide-gray-50">
                <SettingRow label="Nome" name="nome" value={formData.nome} onChange={handleInputChange} editando={editando} />
                <SettingRow label="Nome de exibição" name="nome_exibicao" value={formData.nome_exibicao} onChange={handleInputChange} editando={editando} placeholder="Escolha um nome de exibição" />

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
                      Este é o e-mail que usa para iniciar sessão.
                    </p>
                    
                    {!emailVerificado && (
                      <div className="bg-[#fffbeb] border border-[#fef3c7] p-4 rounded-xl">
                        <p className="text-[13px] text-[#92400e] mb-3">⚠️ O seu email ainda não foi verificado.</p>
                        <button onClick={handleReenviarOtp} disabled={verificandoEmail} className="text-[13px] font-bold text-[#2563eb] hover:underline flex items-center gap-2">
                          {verificandoEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Reenviar código de verificação
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <SettingRow label="Número de telefone" name="telefone" value={formData.telefone || ''} onChange={handleInputChange} editando={editando} placeholder="Insira o seu número de telefone" />
              </div>

              <div className="p-6 md:p-8 flex justify-end gap-3 border-t border-gray-50">
                {editando ? (
                  <>
                    <button onClick={() => { setEditando(false); fetchUserData(); setMessage({ type: '', text: '' }); }} className="px-6 py-2 rounded-lg text-[14px] font-medium border border-gray-300 hover:bg-gray-50 transition">
                      Cancelar
                    </button>
                    <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition flex items-center gap-2">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditando(true)} className="px-6 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition">
                    Editar perfil
                  </button>
                )}
              </div>
            </>
          )}

          {activeMenu === 'Segurança' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Definições de segurança</h1>
                <p className="text-[14px] text-[#64748b]">Gerencie a sua palavra-passe e segurança da conta.</p>
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
                    <button onClick={() => setShowPasswordFields(!showPasswordFields)} className="text-[14px] font-bold text-[#2563eb] hover:underline">
                      {showPasswordFields ? 'Cancelar' : 'Alterar'}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#334155] mb-1">Nova palavra-passe</label>
                        <div className="relative">
                          <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Digite a nova senha" />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#334155] mb-1">Confirmar nova palavra-passe</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Confirme a nova senha" />
                      </div>
                      <button onClick={handleChangePassword} disabled={saving} className="px-4 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition flex items-center gap-2">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar nova palavra-passe
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Gerenciar Funções' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Gerenciar Funções</h1>
                <p className="text-[14px] text-[#64748b]">Solicite ou remova funções comerciais enviando os seus documentos de verificação.</p>
              </div>

              {message.text && (
                <div className={`mb-6 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                {[
                  { name: 'anfitrion', label: 'Anfitrião', desc: 'Alugue propriedades e gerencie alojamentos', icon: <Home className="text-blue-600" />, bg: 'bg-blue-100' },
                  { name: 'guia_experiencias', label: 'Guia de Experiências', desc: 'Crie e gerencie experiências turísticas', icon: <Compass className="text-purple-600" />, bg: 'bg-purple-100' },
                  { name: 'proprietario_veiculos', label: 'Proprietário de Veículos', desc: 'Alugue carros e gerencie sua frota', icon: <Car className="text-green-600" />, bg: 'bg-green-100' }
                ].map((role) => {
                  const rData = userRoles.find(r => r.name === role.name);
                  const status = rData ? rData.status : 'none';

                  return (
                    <div key={role.name} className="p-5 border border-gray-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 ${role.bg} rounded-xl`}>{role.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-950 text-base">{role.label}</h3>
                          <p className="text-sm text-gray-500">{role.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {status === 'approved' && (
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-xl text-xs font-bold flex items-center gap-1">
                              <ShieldCheck size={14} /> Ativo
                            </span>
                            <button onClick={() => handleRemoveRole(role.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Remover função">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}

                        {status === 'pending' && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-bold flex items-center gap-1 animate-pulse">
                            <Loader2 size={14} className="animate-spin" /> Em Análise Admin
                          </span>
                        )}

                        {(status === 'none' || status === 'rejected') && (
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <input 
                                type="file" 
                                id={`file-${role.name}`} 
                                className="hidden" 
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                                onChange={(e) => handleFileUploadAndRequest(e, role.name)} 
                                disabled={loadingRoles}
                              />
                              <label htmlFor={`file-${role.name}`} className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                                <Send size={14} /> Solicitar Função
                              </label>
                            </div>
                            {status === 'rejected' && (
                              <p className="text-xs text-red-600 max-w-xs text-right font-medium">
                                ❌ Recusado: {rData.rejection_reason || 'Documento inválido. Submeta novamente.'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Box Informativa Estática de Segurança */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Sobre as Funções
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Hóspede:</strong> Função básica para fazer reservas (Sempre ativo).</li>
                  <li>• <strong>Anfitrião:</strong> Necessário alvará do imóvel ou caderneta predial.</li>
                  <li>• <strong>Guia:</strong> Requer licença de guia de turismo válida emitida pelo Estado.</li>
                  <li>• <strong>Proprietário:</strong> Requer registo comercial da frota ou livrete do veículo.</li>
                </ul>
              </div>
            </div>
          )}

          {activeMenu === 'Privilégios' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Meus Privilégios</h1>
                <p className="text-[14px] text-[#64748b]">Gerencie suas funções comerciais ativas na plataforma.</p>
              </div>
              
              <div className="space-y-4">
                {isAnfitriao && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Home className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Anfitrião</h3>
                      <p className="text-sm text-gray-500 mt-1">Permissão ativa para alugar e gerir alojamentos no mapa.</p>
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <button onClick={() => window.location.href = '/alojamento-registro/meus'} className="text-blue-600 hover:underline">Ver meus alojamentos →</button>
                        <button onClick={() => window.location.href = '/alojamento-registro/fluxo'} className="text-green-600 hover:underline">+ Adicionar propriedade</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {isGuia && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600"><Compass className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Guia de Experiências</h3>
                      <p className="text-sm text-gray-500 mt-1">Permissão ativa para publicar roteiros e atividades turísticas.</p>
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <button onClick={() => window.location.href = '/experiencia-registro/meus'} className="text-purple-600 hover:underline">Ver minhas experiências →</button>
                        <button onClick={() => window.location.href = '/experiencia-registro/fluxo'} className="text-green-600 hover:underline">+ Criar experiência</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {isProprietario && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600"><Car className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Proprietário de Veículos</h3>
                      <p className="text-sm text-gray-500 mt-1">Permissão ativa para alugar carros e gerir a sua frota.</p>
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <button onClick={() => window.location.href = '/carro-registro/meus'} className="text-green-600 hover:underline">Ver meus veículos →</button>
                        <button onClick={() => window.location.href = '/carro-registro/fluxo'} className="text-green-600 hover:underline">+ Adicionar veículo</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function SettingRow({ label, name, value, onChange, editando, placeholder }) {
  return (
    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-4 md:gap-0">
      <div className="w-full md:w-1/3">
        <span className="text-[14px] font-bold text-[#0f172a]">{label}</span>
      </div>
      <div className="flex-1 w-full">
        {editando ? (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[14px]"
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