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

  // Obter utilizador logado
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('👤 Usuário logado:', userData);
        setUser(userData);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
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
      // Usar email para buscar o usuário_id no backend
      const url = `${API_URL}?action=listar&email=${encodeURIComponent(user.email)}`;
      console.log('📡 Buscando favoritos:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('📦 Resposta da API:', result);
      
      if (result.success) {
        setFavoritos(result.data);
        
        const novosIds = {
          alojamentos: new Set(),
          carros: new Set(),
          experiencias: new Set()
        };
        
        result.data.forEach(item => {
          if (item.tipo === 'alojamento') {
            novosIds.alojamentos.add(item.item_id);
          } else if (item.tipo === 'carro') {
            novosIds.carros.add(item.item_id);
          } else if (item.tipo === 'experiencia') {
            novosIds.experiencias.add(item.item_id);
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
    if (user?.email) {
      carregarFavoritos();
    }
  }, [user?.email, carregarFavoritos]);

  const isFavorito = (tipo, itemId) => {
    const tipoMap = {
      'alojamentos': 'alojamentos',
      'carros': 'carros', 
      'experiencias': 'experiencias'
    };
    const key = tipoMap[tipo] || tipo;
    const result = favoritosIds[key]?.has(itemId) || false;
    console.log(`🔍 isFavorito(${tipo}, ${itemId}): ${result}`);
    return result;
  };

  const adicionarFavorito = async (tipo, item) => {
    if (!user?.email) {
      alert('🔐 Faça login para adicionar aos favoritos');
      return false;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=adicionar&email=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, item_id: item.id })
      });
      
      const result = await response.json();
      console.log('➕ Adicionar favorito resposta:', result);
      
      if (result.success) {
        await carregarFavoritos();
        return true;
      } else {
        alert(result.error);
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
    if (!user?.email) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=remover&email=${encodeURIComponent(user.email)}&tipo=${tipo}&item_id=${itemId}`, {
        method: 'DELETE'
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
    if (!user?.email) {
      alert('🔐 Faça login para adicionar aos favoritos');
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
    isLoggedIn: !!user,
    recarregar: carregarFavoritos
  };
};