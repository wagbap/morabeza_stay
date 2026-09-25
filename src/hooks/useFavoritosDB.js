// src/hooks/useFavoritosDB.js
import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://welovepalop.com/api/favoritos.php';

export const useFavoritosDB = () => {
  const [user, setUser] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoritosIds, setFavoritosIds] = useState({
    alojamentos: new Set(),
    carros: new Set(),
    experiencias: new Set()
  });

  // Obter utilizador logado de forma segura (JWT ou LocalStorage)
  useEffect(() => {
    try {
      // 1. Tentar extrair do Token JWT
      const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        const userData = parsed.data || parsed;
        if (userData?.id || userData?.email) {
          console.log('👤 Usuário logado via JWT:', userData);
          setUser(userData);
          return;
        }
      }

      // 2. Tentar pelas chaves tradicionais no LocalStorage
      const chaves = ['user', 'morabeza_user', 'morabeza_admin'];
      for (const chave of chaves) {
        const savedUser = localStorage.getItem(chave);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData?.id || userData?.email) {
            console.log('👤 Usuário logado via LocalStorage:', userData);
            setUser(userData);
            break;
          }
        }
      }
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
    }
  }, []);

  // Carregar favoritos da API
  const carregarFavoritos = useCallback(async () => {
    if (!user?.id && !user?.email) {
      console.log('⏳ Aguardando usuário...');
      return;
    }
    
    setLoading(true);
    try {
      let url = `${API_URL}?action=listar`;
      if (user?.email) {
        url += `&email=${encodeURIComponent(user.email)}`;
      } else if (user?.id) {
        url += `&usuario_id=${user.id}`;
      }
      
      console.log('📡 Buscando favoritos:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('📦 Resposta da API:', result);
      
      if (result.success && result.data) {
        setFavoritos(result.data);
        
        const novosIds = {
          alojamentos: new Set(),
          carros: new Set(),
          experiencias: new Set()
        };
        
        result.data.forEach(item => {
          if (item.tipo === 'alojamento' || item.tipo === 'alojamentos') {
            novosIds.alojamentos.add(Number(item.item_id));
          } else if (item.tipo === 'carro' || item.tipo === 'carros') {
            novosIds.carros.add(Number(item.item_id));
          } else if (item.tipo === 'experiencia' || item.tipo === 'experiencias') {
            novosIds.experiencias.add(Number(item.item_id));
          }
        });
        
        console.log('❤️ IDs favoritados:', novosIds);
        setFavoritosIds(novosIds);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (user?.email || user?.id) {
      carregarFavoritos();
    }
  }, [user?.email, user?.id, carregarFavoritos]);

  const isFavorito = (tipo, itemId) => {
    const tipoMap = {
      'alojamento': 'alojamentos',
      'alojamentos': 'alojamentos',
      'carro': 'carros',
      'carros': 'carros', 
      'experiencia': 'experiencias',
      'experiencias': 'experiencias'
    };
    const key = tipoMap[tipo] || tipo;
    const result = favoritosIds[key]?.has(Number(itemId)) || false;
    return result;
  };

  const adicionarFavorito = async (tipo, item) => {
    if (!user?.email && !user?.id) {
      alert('🔐 Faça login para adicionar aos favoritos');
      return false;
    }
    
    setLoading(true);
    try {
      let url = `${API_URL}?action=adicionar`;
      if (user?.email) {
        url += `&email=${encodeURIComponent(user.email)}`;
      } else if (user?.id) {
        url += `&usuario_id=${user.id}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, item_id: Number(item.id) })
      });
      
      const result = await response.json();
      console.log('➕ Adicionar favorito resposta:', result);
      
      if (result.success) {
        await carregarFavoritos();
        return true;
      } else {
        alert(result.error || 'Erro ao adicionar favorito');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar favorito:', error);
      alert('Erro ao adicionar favorito. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removerFavorito = async (tipo, itemId) => {
    if (!user?.email && !user?.id) return false;
    
    setLoading(true);
    try {
      let url = `${API_URL}?action=remover`;
      if (user?.email) {
        url += `&email=${encodeURIComponent(user.email)}`;
      } else if (user?.id) {
        url += `&usuario_id=${user.id}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, item_id: Number(itemId) })
      });
      
      const result = await response.json();
      console.log('➖ Remover favorito resposta:', result);
      
      if (result.success) {
        await carregarFavoritos();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (tipo, item) => {
    if (!user?.email && !user?.id) {
      alert('🔐 Faça login para gerir favoritos');
      return false;
    }
    
    console.log(`🔄 Toggle favorito: ${tipo} - ${item.id}`);
    
    if (isFavorito(tipo, item.id)) {
      return await removerFavorito(tipo, item.id);
    } else {
      return await adicionarFavorito(tipo, item);
    }
  };

  const totalFavoritos = favoritos.length;

  return {
    favoritos,
    totalFavoritos,
    isFavorito,
    adicionarFavorito,
    removerFavorito,
    toggleFavorito,
    loading,
    user,
    isLoggedIn: !!(user?.email || user?.id),
    recarregar: carregarFavoritos
  };
};