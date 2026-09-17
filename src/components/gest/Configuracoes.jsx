// components/Configuracoes.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Trash2,
  Shield,
  Hotel,
  ArrowRight,
  Wallet,
  CreditCard,
  Building2,
  Globe,
  Phone,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://welovepalop.com/api';

const VERSAO_CONDICOES = 'v1.0';

export default function Configuracoes() {
  const location = useLocation();
  const navigate = useNavigate();

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

  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [aceitouCondicoes, setAceitouCondicoes] = useState(false);

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const inputFotoRef = useRef(null);

  const [dadosRecebimento, setDadosRecebimento] = useState(null);
  const [loadingReceb, setLoadingReceb] = useState(false);
  const [editandoReceb, setEditandoReceb] = useState(false);
  const [formReceb, setFormReceb] = useState({
    titular: '',
    iban: '',
    banco: '',
    pais: 'Cabo Verde',
    nif: '',
  });

  const [contacto, setContacto] = useState({
    contacto_nome: '',
    contacto_email: '',
    contacto_whatsapp: '',
    contacto_telefone: '',
  });
  const [loadingContacto, setLoadingContacto] = useState(false);
  const [editandoContacto, setEditandoContacto] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    nome_exibicao: '',
    email: '',
    telefone: '',
    foto: '',
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errosSenha, setErrosSenha] = useState({
    atual: '',
    nova: '',
    confirmar: '',
  });

  const roleMapping = {
    cliente: 1,
    anfitrion: 2,
    guia_experiencias: 3,
    proprietario_veiculos: 4,
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'funcoes') {
      setActiveMenu('Solicitar Funções');
      navigate('/gest/configuracoes', { replace: true });
    }
    if (tab === 'recebimento') {
      setActiveMenu('Recebimento');
      navigate('/gest/configuracoes', { replace: true });
    }
    if (tab === 'contacto') {
      setActiveMenu('Contacto comercial');
      navigate('/gest/configuracoes', { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (usuarioLogado?.id) {
      fetchUserRoles();
      carregarDadosRecebimento();
      carregarContacto();
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

      const response = await fetch(`${API_URL}/usuarios/buscar.php?usuario_id=${user.id}`);
      const data = await response.json();

      if (data.success && data.data) {
        const userData = data.data;

        const fotoFinal =
          userData.foto ||
          user.foto ||
          user.picture ||
          '';

        setUsuarioLogado({
          ...userData,
          foto: fotoFinal,
        });

        setFormData({
          nome: userData.nome || '',
          nome_exibicao: userData.nome_exibicao || userData.nome || '',
          email: userData.email || '',
          telefone: userData.phone || '',
          foto: fotoFinal,
        });

        setEmailVerificado(userData.email_verificado == 1 || userData.email_verificado === true);
      } else {
        setUsuarioLogado(user);
        setFormData({
          nome: user.nome || user.name || '',
          nome_exibicao: user.nome || user.name || '',
          email: user.email || '',
          telefone: user.phone || '',
          foto: user.foto || user.picture || '',
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
      const response = await fetch(
        `${API_URL}/usuarios/listar_roles.php?usuario_id=${usuarioLogado.id}`
      );
      const data = await response.json();

      if (data.success) {
        setUserRoles(data.roles);
        const approvedRoleNames = data.roles
          .filter((r) => r.status === 'approved')
          .map((r) => r.name);

        setUserRoleNames(approvedRoleNames);
        setIsHospede(approvedRoleNames.includes('cliente') || approvedRoleNames.includes('hospede'));
        setIsAnfitriao(approvedRoleNames.includes('anfitrion'));
        setIsGuia(approvedRoleNames.includes('guia_experiencias'));
        setIsProprietario(approvedRoleNames.includes('proprietario_veiculos'));
      }
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
    }
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFoto(true);
    setMessage({ type: '', text: '' });

    try {
      const form = new FormData();
      form.append('foto', file);
      form.append('usuario_id', usuarioLogado.id);

      const res = await fetch(`${API_URL}/usuarios/upload_foto.php`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });

        setFormData((f) => ({ ...f, foto: data.foto }));
        setUsuarioLogado((u) => ({ ...u, foto: data.foto }));

        const saved = JSON.parse(localStorage.getItem('user') || '{}');
        saved.foto = data.foto;
        saved.picture = data.foto;
        localStorage.setItem('user', JSON.stringify(saved));

        window.dispatchEvent(new Event('userUpdated'));

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao enviar foto.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro de ligação.' });
    } finally {
      setUploadingFoto(false);
      if (inputFotoRef.current) inputFotoRef.current.value = '';
    }
  };

  const carregarDadosRecebimento = async () => {
    if (!usuarioLogado?.id) return;
    setLoadingReceb(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/dados_recebimento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'obter',
          usuario_id: usuarioLogado.id,
        }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setDadosRecebimento(data.data);
        setFormReceb({
          titular: data.data.titular || '',
          iban: data.data.iban || '',
          banco: data.data.banco || '',
          pais: data.data.pais || 'Cabo Verde',
          nif: data.data.nif || '',
        });
      } else {
        setDadosRecebimento(null);
        setFormReceb((f) => ({ ...f, titular: usuarioLogado.nome || '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReceb(false);
    }
  };

  const guardarDadosRecebimento = async () => {
    if (!formReceb.titular || formReceb.titular.trim().length < 3) {
      setMessage({ type: 'error', text: 'Indica o nome do titular.' });
      return;
    }
    if (!formReceb.iban || formReceb.iban.replace(/\s/g, '').length < 15) {
      setMessage({ type: 'error', text: 'IBAN inválido.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/usuarios/dados_recebimento.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'guardar',
          usuario_id: usuarioLogado.id,
          ...formReceb,
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMessage({ type: 'success', text: data.message });
        setEditandoReceb(false);
        await carregarDadosRecebimento();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao guardar.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro de ligação.' });
    } finally {
      setSaving(false);
    }
  };

  const carregarContacto = async () => {
    if (!usuarioLogado?.id) return;
    setLoadingContacto(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/contacto_comercial.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'obter', usuario_id: usuarioLogado.id }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setContacto({
          contacto_nome: data.data.contacto_nome || '',
          contacto_email: data.data.contacto_email || '',
          contacto_whatsapp: data.data.contacto_whatsapp || '',
          contacto_telefone: data.data.contacto_telefone || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacto(false);
    }
  };

  const guardarContacto = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/usuarios/contacto_comercial.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'guardar',
          usuario_id: usuarioLogado.id,
          ...contacto,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessage({ type: 'success', text: data.message });
        setEditandoContacto(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao guardar.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro de ligação.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAtivarServico = async (roleName) => {
    setMessage({ type: '', text: '' });

    if (!aceitouCondicoes) {
      setMessage({
        type: 'error',
        text: 'Tens de aceitar as condições da Morabeza Stay para ativar o serviço.',
      });
      return;
    }

    setLoadingRoles(true);

    try {
      const response = await fetch(`${API_URL}/ativar_servico.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ativar_servico',
          user_id: parseInt(usuarioLogado.id),
          tipo_servico: roleName,
          aceitou_condicoes: true,
          versao_condicoes: VERSAO_CONDICOES,
        }),
      });
      const data = await response.json();

      if (data.status === 'success' || data.success) {
        setMessage({ type: 'success', text: data.message || 'Serviço ativado com sucesso!' });
        setServicoSelecionado(null);
        setAceitouCondicoes(false);
        await fetchUserRoles();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao ativar serviço.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro de ligação ao servidor.' });
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleRemoveRole = async (roleName) => {
    if (roleName === 'cliente' || roleName === 'hospede') {
      setMessage({
        type: 'error',
        text: 'A função de Cliente é a base da sua conta e não pode ser removida.',
      });
      return;
    }
    setLoadingRoles(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/remover_role.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: parseInt(usuarioLogado.id),
          role_id: roleMapping[roleName],
        }),
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
      { id: 'Contacto comercial', icon: <Phone className="w-5 h-5" />, label: 'Contacto comercial' },
      { id: 'Recebimento', icon: <Wallet className="w-5 h-5" />, label: 'Dados de recebimento' },
      { id: 'Solicitar Funções', icon: <Briefcase className="w-5 h-5" />, label: 'Solicitar Funções' },
    ];
    if (isAnfitriao || isGuia || isProprietario) {
      items.push({ id: 'Privilégios', icon: <Award className="w-5 h-5" />, label: 'Meus Serviços' });
    }
    return items;
  };

  const menuItems = getMenuItems();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_URL}/usuarios/atualizar_perfil.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioLogado.id,
          nome: formData.nome,
          phone: formData.telefone,
          nome_exibicao: formData.nome_exibicao,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedUser = {
          ...usuarioLogado,
          nome: formData.nome,
          name: formData.nome,
          phone: formData.telefone,
          foto: formData.foto,
          picture: formData.foto,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUsuarioLogado(updatedUser);
        setEditando(false);
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });

        window.dispatchEvent(new Event('userUpdated'));

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
    const novosErros = { atual: '', nova: '', confirmar: '' };

    if (!senhaAtual) {
      novosErros.atual = 'Indica a palavra-passe atual.';
    }

    if (!newPassword) {
      novosErros.nova = 'Indica a nova palavra-passe.';
    } else if (newPassword.length < 6) {
      novosErros.nova = 'A nova palavra-passe deve ter pelo menos 6 caracteres.';
    }

    if (!confirmPassword) {
      novosErros.confirmar = 'Confirma a nova palavra-passe.';
    } else if (newPassword !== confirmPassword) {
      novosErros.confirmar = 'As palavras-passe não coincidem.';
    }

    setErrosSenha(novosErros);

    if (novosErros.atual || novosErros.nova || novosErros.confirmar) {
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/usuarios/alterar_senha.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioLogado.id,
          senha_atual: senhaAtual,
          nova_senha: newPassword,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Palavra-passe alterada com sucesso!' });
        setSenhaAtual('');
        setNewPassword('');
        setConfirmPassword('');
        setErrosSenha({ atual: '', nova: '', confirmar: '' });
        setShowPasswordFields(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        if (data.erro_campo === 'atual') {
          setErrosSenha({ atual: data.message, nova: '', confirmar: '' });
        } else {
          setMessage({ type: 'error', text: data.message || 'Erro ao alterar palavra-passe' });
        }
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
      const response = await fetch(`${API_URL}/auth_google.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_verification_otp',
          user_id: usuarioLogado.id,
        }),
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
      const response = await fetch(`${API_URL}/auth_google.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: formData.email,
          otp: otpCode,
        }),
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
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpCode('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
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
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpCode('');
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerificarOtp}
                disabled={verificandoEmail}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-950 transition flex items-center justify-center gap-2"
              >
                {verificandoEmail ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
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
                  ${
                    activeMenu === item.id
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
                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleUploadFoto}
                    className="hidden"
                  />

                  <div
                    onClick={() => !uploadingFoto && inputFotoRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-[#f1f5f9] border-2 border-white shadow-md flex items-center justify-center overflow-hidden relative cursor-pointer"
                  >
                    <img
                      src={
                        formData.foto ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          formData.nome || 'Utilizador'
                        )}&background=0D8ABC&color=fff&size=100`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          formData.nome || 'Utilizador'
                        )}&background=0D8ABC&color=fff&size=100`;
                      }}
                    />
                    {uploadingFoto && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => !uploadingFoto && inputFotoRef.current?.click()}
                    disabled={uploadingFoto}
                    className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-100 group-hover:bg-[#2563eb] group-hover:text-white transition-colors disabled:opacity-50"
                    title="Alterar foto de perfil"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(message.text || emailMessage.text) && (
                <div
                  className={`mx-6 md:mx-8 mt-4 p-3 rounded-lg ${
                    message.type === 'success' || emailMessage.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text || emailMessage.text}
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
                    <span className="text-[14px] font-bold text-[#0f172a]">
                      Endereço de e-mail
                    </span>
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
                        <p className="text-[13px] text-[#92400e] mb-3">
                          ⚠️ O seu email ainda não foi verificado.
                        </p>
                        <button
                          onClick={handleReenviarOtp}
                          disabled={verificandoEmail}
                          className="text-[13px] font-bold text-[#2563eb] hover:underline flex items-center gap-2"
                        >
                          {verificandoEmail ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
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
                      onClick={() => {
                        setEditando(false);
                        fetchUserData();
                        setMessage({ type: '', text: '' });
                      }}
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

          {activeMenu === 'Segurança' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Definições de segurança</h1>
                <p className="text-[14px] text-[#64748b]">
                  Gerencie a sua palavra-passe e segurança da conta.
                </p>
              </div>

              {message.text && (
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-[16px] font-bold mb-1">Palavra-passe</h3>
                      <p className="text-[13px] text-[#64748b]">
                        Altere a sua palavra-passe de acesso
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPasswordFields(!showPasswordFields);
                        setErrosSenha({ atual: '', nova: '', confirmar: '' });
                        setSenhaAtual('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-[14px] font-bold text-[#2563eb] hover:underline"
                    >
                      {showPasswordFields ? 'Cancelar' : 'Alterar'}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#334155] mb-1">
                          Palavra-passe atual *
                        </label>
                        <div className="relative">
                          <input
                            type={showSenhaAtual ? 'text' : 'password'}
                            value={senhaAtual}
                            onChange={(e) => {
                              setSenhaAtual(e.target.value);
                              if (errosSenha.atual) setErrosSenha((s) => ({ ...s, atual: '' }));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                              errosSenha.atual
                                ? 'border-red-400 focus:ring-red-500/20'
                                : 'border-gray-200 focus:ring-blue-500/20'
                            }`}
                            placeholder="Digite a palavra-passe atual"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errosSenha.atual && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errosSenha.atual}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium text-[#334155] mb-1">
                          Nova palavra-passe *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (errosSenha.nova) setErrosSenha((s) => ({ ...s, nova: '' }));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                              errosSenha.nova
                                ? 'border-red-400 focus:ring-red-500/20'
                                : 'border-gray-200 focus:ring-blue-500/20'
                            }`}
                            placeholder="Digite a nova palavra-passe"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errosSenha.nova && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errosSenha.nova}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres.</p>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium text-[#334155] mb-1">
                          Confirmar nova palavra-passe *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errosSenha.confirmar)
                                setErrosSenha((s) => ({ ...s, confirmar: '' }));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                              errosSenha.confirmar
                                ? 'border-red-400 focus:ring-red-500/20'
                                : 'border-gray-200 focus:ring-blue-500/20'
                            }`}
                            placeholder="Confirme a nova palavra-passe"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errosSenha.confirmar && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errosSenha.confirmar}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition flex items-center gap-2"
                      >
                        {saving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Salvar nova palavra-passe
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Contacto comercial' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Contacto comercial</h1>
                <p className="text-[14px] text-[#64748b]">
                  Estes dados aparecem <strong>publicamente</strong> nos teus anúncios.
                  Não uses os teus dados de login.
                </p>
              </div>

              {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Os teus dados de login estão protegidos
                  </p>
                  <p className="text-xs text-blue-800 mt-1">
                    O e-mail <strong>{formData.email}</strong> e o telefone de login <strong>nunca</strong> aparecem publicamente. Só o contacto abaixo é mostrado aos clientes.
                  </p>
                </div>
              </div>

              {loadingContacto ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin text-[#003580]" size={28} />
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-[16px] font-bold mb-1">Dados públicos</h3>
                        <p className="text-[13px] text-[#64748b]">
                          {contacto.contacto_email || contacto.contacto_telefone || contacto.contacto_whatsapp
                            ? 'Estes são os teus dados atuais.'
                            : 'Preenche para mostrar aos clientes.'}
                        </p>
                      </div>
                      {!editandoContacto && (contacto.contacto_email || contacto.contacto_telefone || contacto.contacto_whatsapp) && (
                        <button
                          onClick={() => setEditandoContacto(true)}
                          className="text-[14px] font-bold text-[#2563eb] hover:underline"
                        >
                          Editar
                        </button>
                      )}
                    </div>

                    {!editandoContacto && (contacto.contacto_email || contacto.contacto_telefone || contacto.contacto_whatsapp) && (
                      <div className="space-y-3">
                        {contacto.contacto_nome && (
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">Nome de contacto</span>
                            <span className="font-medium text-sm">{contacto.contacto_nome}</span>
                          </div>
                        )}
                        {contacto.contacto_email && (
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">E-mail</span>
                            <span className="font-medium text-sm">{contacto.contacto_email}</span>
                          </div>
                        )}
                        {contacto.contacto_telefone && (
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">Telefone</span>
                            <span className="font-medium text-sm">{contacto.contacto_telefone}</span>
                          </div>
                        )}
                        {contacto.contacto_whatsapp && (
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">WhatsApp</span>
                            <span className="font-medium text-sm">{contacto.contacto_whatsapp}</span>
                          </div>
                        )}
                        <div className="pt-3">
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle2 size={14} /> Visível nos anúncios
                          </span>
                        </div>
                      </div>
                    )}

                    {(editandoContacto || (!contacto.contacto_email && !contacto.contacto_telefone && !contacto.contacto_whatsapp)) && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[13px] font-medium text-[#334155] mb-1">
                            Nome de contacto
                          </label>
                          <input
                            type="text"
                            value={contacto.contacto_nome}
                            onChange={(e) => setContacto({ ...contacto, contacto_nome: e.target.value })}
                            placeholder="Ex: Wagner Baptista"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-[13px] font-medium text-[#334155] mb-1">
                            E-mail comercial
                          </label>
                          <input
                            type="email"
                            value={contacto.contacto_email}
                            onChange={(e) => setContacto({ ...contacto, contacto_email: e.target.value })}
                            placeholder="Ex: reservas@casazul.cv"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            E-mail que os clientes usarão para contacto.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[13px] font-medium text-[#334155] mb-1">
                              Telefone
                            </label>
                            <input
                              type="text"
                              value={contacto.contacto_telefone}
                              onChange={(e) => setContacto({ ...contacto, contacto_telefone: e.target.value })}
                              placeholder="Ex: +238 960 17 29"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[13px] font-medium text-[#334155] mb-1">
                              WhatsApp
                            </label>
                            <input
                              type="text"
                              value={contacto.contacto_whatsapp}
                              onChange={(e) => setContacto({ ...contacto, contacto_whatsapp: e.target.value })}
                              placeholder="Ex: +238 960 17 29"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          {editandoContacto && (
                            <button
                              onClick={() => {
                                setEditandoContacto(false);
                                carregarContacto();
                                setMessage({ type: '', text: '' });
                              }}
                              className="px-6 py-2 rounded-lg text-[14px] font-medium border border-gray-300 hover:bg-gray-50 transition"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={guardarContacto}
                            disabled={saving}
                            className="px-6 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition flex items-center gap-2"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Guardar contacto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Recebimento' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Dados de recebimento</h1>
                <p className="text-[14px] text-[#64748b]">
                  Onde queres receber os pagamentos das tuas reservas.
                </p>
              </div>

              {message.text && (
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {loadingReceb ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin text-[#003580]" size={28} />
                </div>
              ) : (
                <>
                  {!dadosRecebimento && !editandoReceb && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-bold text-yellow-900">
                          Ainda não tens dados de recebimento
                        </p>
                        <p className="text-xs text-yellow-800 mt-1">
                          Sem estes dados, a Morabeza Stay <strong>não pode fazer repasses</strong>{' '}
                          das tuas reservas.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-[16px] font-bold mb-1 flex items-center gap-2">
                            <Wallet size={18} /> Conta bancária
                          </h3>
                          <p className="text-[13px] text-[#64748b]">
                            {dadosRecebimento
                              ? 'Estes são os teus dados atuais.'
                              : 'Preenche para começar a receber pagamentos.'}
                          </p>
                        </div>
                        {dadosRecebimento && !editandoReceb && (
                          <button
                            onClick={() => setEditandoReceb(true)}
                            className="text-[14px] font-bold text-[#2563eb] hover:underline"
                          >
                            Editar
                          </button>
                        )}
                      </div>

                      {dadosRecebimento && !editandoReceb && (
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">Titular</span>
                            <span className="font-medium text-sm">{dadosRecebimento.titular}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">IBAN</span>
                            <span className="font-mono font-medium text-sm">
                              {dadosRecebimento.iban_mascarado || dadosRecebimento.iban}
                            </span>
                          </div>
                          {dadosRecebimento.banco && (
                            <div className="flex justify-between py-2 border-b border-gray-50">
                              <span className="text-gray-500 text-sm">Banco</span>
                              <span className="font-medium text-sm">{dadosRecebimento.banco}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">País</span>
                            <span className="font-medium text-sm">{dadosRecebimento.pais}</span>
                          </div>
                          {dadosRecebimento.nif && (
                            <div className="flex justify-between py-2 border-b border-gray-50">
                              <span className="text-gray-500 text-sm">NIF</span>
                              <span className="font-medium text-sm">{dadosRecebimento.nif}</span>
                            </div>
                          )}

                          <div className="pt-3">
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                              <CheckCircle2 size={14} /> Configurado
                            </span>
                          </div>
                        </div>
                      )}

                      {(!dadosRecebimento || editandoReceb) && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[13px] font-medium text-[#334155] mb-1">
                              Nome do titular *
                            </label>
                            <input
                              type="text"
                              value={formReceb.titular}
                              onChange={(e) => setFormReceb({ ...formReceb, titular: e.target.value })}
                              placeholder="Nome completo como aparece no banco"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[13px] font-medium text-[#334155] mb-1">
                              IBAN *
                            </label>
                            <input
                              type="text"
                              value={formReceb.iban}
                              onChange={(e) => setFormReceb({ ...formReceb, iban: e.target.value })}
                              placeholder="CV64 0000 0000 0000 0000 0000 0"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[13px] font-medium text-[#334155] mb-1">
                                Banco
                              </label>
                              <input
                                type="text"
                                value={formReceb.banco}
                                onChange={(e) => setFormReceb({ ...formReceb, banco: e.target.value })}
                                placeholder="Ex: BCA, BAI, Caixa"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>

                            <div>
                              <label className="block text-[13px] font-medium text-[#334155] mb-1">
                                NIF
                              </label>
                              <input
                                type="text"
                                value={formReceb.nif}
                                onChange={(e) => setFormReceb({ ...formReceb, nif: e.target.value })}
                                placeholder="Opcional"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[13px] font-medium text-[#334155] mb-1">
                              País
                            </label>
                            <select
                              value={formReceb.pais}
                              onChange={(e) => setFormReceb({ ...formReceb, pais: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                              <option value="Cabo Verde">Cabo Verde</option>
                              <option value="Portugal">Portugal</option>
                              <option value="Brasil">Brasil</option>
                              <option value="Angola">Angola</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>

                          <div className="flex gap-3 pt-2">
                            {editandoReceb && (
                              <button
                                onClick={() => {
                                  setEditandoReceb(false);
                                  carregarDadosRecebimento();
                                  setMessage({ type: '', text: '' });
                                }}
                                className="px-6 py-2 rounded-lg text-[14px] font-medium border border-gray-300 hover:bg-gray-50 transition"
                              >
                                Cancelar
                              </button>
                            )}
                            <button
                              onClick={guardarDadosRecebimento}
                              disabled={saving}
                              className="px-6 py-2 rounded-lg text-[14px] font-medium bg-blue-900 text-white hover:bg-blue-950 transition flex items-center gap-2"
                            >
                              {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Save size={16} />
                              )}
                              Guardar dados
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Shield size={14} /> Porque pedimos isto?
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• É para onde enviamos os teus 80% de cada reserva.</li>
                      <li>• O IBAN fica guardado de forma protegida.</li>
                      <li>• Só a Morabeza Stay e tu têm acesso.</li>
                      <li>• Não partilhamos com ninguém.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {activeMenu === 'Solicitar Funções' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Solicitar Funções</h1>
                <p className="text-[14px] text-[#64748b]">
                  Escolhe o que queres oferecer na Morabeza Stay. A ativação é imediata — sem
                  documentos e sem espera. Cada anúncio é analisado depois de o criares.
                </p>
              </div>

              {message.text && (
                <div
                  className={`mb-6 p-3 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                {[
                  {
                    name: 'anfitrion',
                    label: 'Proprietário de Alojamentos',
                    desc: 'Alugue propriedades e gerencie alojamentos.',
                    icon: <Home className="text-blue-600" />,
                    bg: 'bg-blue-100',
                    nextUrl: '/alojamento-registro/fluxo',
                  },
                  {
                    name: 'guia_experiencias',
                    label: 'Guia de Experiências',
                    desc: 'Crie e gerencie experiências turísticas.',
                    icon: <Compass className="text-purple-600" />,
                    bg: 'bg-purple-100',
                    nextUrl: '/experiencia-registro/fluxo',
                  },
                  {
                    name: 'proprietario_veiculos',
                    label: 'Proprietário de Veículos',
                    desc: 'Alugue carros e gerencie a sua frota.',
                    icon: <Car className="text-green-600" />,
                    bg: 'bg-green-100',
                    nextUrl: '/carro-registro/fluxo',
                  },
                ].map((role) => {
                  const rData = userRoles.find((r) => r.name === role.name);
                  const isAtivo = rData?.status === 'approved';
                  const isSelecionado = servicoSelecionado === role.name;

                  return (
                    <div
                      key={role.name}
                      className={`p-5 border rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isSelecionado ? 'border-[#2563eb] ring-2 ring-blue-100' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 ${role.bg} rounded-xl`}>{role.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-950 text-base">{role.label}</h3>
                          <p className="text-sm text-gray-500">{role.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isAtivo ? (
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-xl text-xs font-bold flex items-center gap-1">
                              <ShieldCheck size={14} /> Ativo
                            </span>
                            <button
                              onClick={() => handleRemoveRole(role.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Remover função"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setServicoSelecionado(isSelecionado ? null : role.name);
                              setAceitouCondicoes(false);
                              setMessage({ type: '', text: '' });
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-sm ${
                              isSelecionado
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-blue-900 hover:bg-blue-950 text-white'
                            }`}
                          >
                            {isSelecionado ? 'Cancelar' : 'Ativar serviço'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {servicoSelecionado && (
                <div className="mt-6 p-6 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-4">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Shield size={18} /> Condições da Morabeza Stay
                  </h3>

                  <ul className="text-sm text-blue-900/90 space-y-1.5 list-disc pl-5">
                    <li>
                      A comissão da Morabeza Stay é de <strong>20%</strong> sobre cada reserva
                      confirmada.
                    </li>
                    <li>O anúncio será analisado antes de ser publicado.</li>
                    <li>
                      Documentos podem ser solicitados <strong>apenas</strong> após a análise de um
                      anúncio específico.
                    </li>
                    <li>Podes pausar ou remover este serviço em qualquer momento.</li>
                  </ul>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aceitouCondicoes}
                      onChange={(e) => setAceitouCondicoes(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-blue-900"
                    />
                    <span className="text-sm text-blue-900">
                      Li e aceito as condições da Morabeza Stay.
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => handleAtivarServico(servicoSelecionado)}
                      disabled={loadingRoles || !aceitouCondicoes}
                      className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loadingRoles ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> A ativar...
                        </>
                      ) : (
                        <>
                          Confirmar ativação <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServicoSelecionado(null);
                        setAceitouCondicoes(false);
                      }}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium border border-blue-200 text-blue-900 hover:bg-blue-100/50 transition"
                    >
                      Cancelar
                    </button>
                  </div>

                  <p className="text-xs text-blue-800/70 pt-1">
                    Sem documentos. Sem aprovação administrativa. Ativação imediata.
                  </p>
                </div>
              )}

              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Como funciona
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • <strong>Cliente:</strong> função base da conta — sempre ativa.
                  </li>
                  <li>
                    • <strong>Anfitrião, Guia e Proprietário:</strong> ativas o serviço com um
                    clique e crias o anúncio de seguida.
                  </li>
                  <li>
                    • A análise e pedido de documentos acontecem <strong>por anúncio</strong>,
                    depois de o enviares para revisão.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeMenu === 'Privilégios' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold mb-1">Meus Serviços</h1>
                <p className="text-[14px] text-[#64748b]">
                  Gerencie os seus serviços comerciais ativos na plataforma.
                </p>
              </div>

              <div className="space-y-4">
                {isAnfitriao && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Home className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Proprietário de Alojamentos</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Permissão ativa para alugar e gerir alojamentos no mapa.
                      </p>
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <button
                          onClick={() => (window.location.href = '/alojamento-registro/meus')}
                          className="text-blue-600 hover:underline"
                        >
                          Ver meus alojamentos →
                        </button>
                        <button
                          onClick={() => (window.location.href = '/alojamento-registro/fluxo')}
                          className="text-green-600 hover:underline"
                        >
                          + Adicionar propriedade
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isGuia && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Guia de Experiências</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Permissão ativa para publicar roteiros e atividades turísticas.
                      </p>
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <button
                          onClick={() => (window.location.href = '/experiencia-registro/meus')}
                          className="text-purple-600 hover:underline"
                        >
                          Ver minhas experiências →
                        </button>
                        <button
                          onClick={() => (window.location.href = '/experiencia-registro/fluxo')}
                          className="text-green-600 hover:underline"
                        >
                          + Criar experiência
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isProprietario && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                      <Car className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        Proprietário de Veículos
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Permissão ativa para alugar carros e gerir a sua frota.
                      </p>
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <button
                          onClick={() => (window.location.href = '/carro-registro/meus')}
                          className="text-green-600 hover:underline"
                        >
                          Ver meus veículos →
                        </button>
                        <button
                          onClick={() => (window.location.href = '/carro-registro/fluxo')}
                          className="text-green-600 hover:underline"
                        >
                          + Adicionar veículo
                        </button>
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