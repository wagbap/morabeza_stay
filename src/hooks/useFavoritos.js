// src/hooks/useFavoritos.js
import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://welovepalop.com/api/favoritos.php';

export const useFavoritos = () => {
  const [user, setUser] = useState(null);
  const [favoritos, setFavoritos] = useState({
    alojamentos: [],
    carros: [],
    experiencias: []
  });
  const [loading, setLoading] = useState(false);
  const [totalFavoritos, setTotalFavoritos] = useState(0);

  // Carregar usuário
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      }
    }
  }, []);

  // Carregar favoritos da API
  const carregarFavoritos = useCallback(async () => {
    if (!user?.email && !user?.id) return;
    
    setLoading(true);
    try {
      let url = `${API_URL}?action=listar`;
      if (user?.email) {
        url += `&email=${encodeURIComponent(user.email)}`;
      } else if (user?.id) {
        url += `&usuario_id=${user.id}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.data) {
        const novosFavoritos = {
          alojamentos: [],
          carros: [],
          experiencias: []
        };
        
        result.data.forEach(item => {
          if (item.tipo_item === 'alojamento') {
            novosFavoritos.alojamentos.push({
              id: item.id,
              titulo: item.titulo,
              localizacao: item.localizacao,
              imagem_url: item.imagem_url,
              preco_noite: item.preco_noite,
              estrelas: item.estrelas,
              slug: item.slug
            });
          } else if (item.tipo_item === 'carro') {
            novosFavoritos.carros.push({
              id: item.id,
              titulo: item.titulo,
              localizacao: item.localizacao,
              imagem_url: item.imagem_url,
              preco_dia: item.preco_dia,
              estrelas: item.estrelas,
              slug: item.slug
            });
          } else if (item.tipo_item === 'experiencia') {
            novosFavoritos.experiencias.push({
              id: item.id,
              titulo: item.titulo,
              localizacao: item.localizacao,
              imagem_url: item.imagem_url,
              preco: item.preco,
              estrelas: item.rating || item.estrelas,
              slug: item.slug
            });
          }
        });
        
        setFavoritos(novosFavoritos);
        const total = novosFavoritos.alojamentos.length + novosFavoritos.carros.length + novosFavoritos.experiencias.length;
        setTotalFavoritos(total);
        
        // Disparar evento para atualizar outros componentes
        window.dispatchEvent(new CustomEvent('favoritosAtualizados', { detail: { total } }));
      } else {
        setTotalFavoritos(0);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.id]);

  // Carregar quando usuário mudar
  useEffect(() => {
    if (user?.email || user?.id) {
      carregarFavoritos();
    }
  }, [user?.email, user?.id, carregarFavoritos]);

  // Verificar se um item está nos favoritos
  const isFavorito = (tipo, itemId) => {
    const tipoMap = {
      'alojamento': 'alojamentos',
      'carro': 'carros',
      'experiencia': 'experiencias'
    };
    const key = tipoMap[tipo] || tipo;
    const lista = favoritos[key] || [];
    return lista.some(item => item.id === itemId);
  };

  // Adicionar favorito
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
      
      const itemData = {
        titulo: item.titulo,
        localizacao: item.localizacao,
        imagem_url: item.imagem_url,
        preco_noite: item.preco_noite || null,
        preco_dia: item.preco_dia || null,
        preco: item.preco || null,
        estrelas: item.estrelas || 4.5,
        slug: item.slug
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tipo, 
          item_id: Number(item.id),
          item_data: itemData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await carregarFavoritos(); // Recarregar para garantir consistência
        return true;
      } else {
        alert(result.error || 'Erro ao adicionar favorito');
        return false;
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      alert('Erro ao adicionar favorito');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remover favorito
  const removeFavorito = async (tipo, itemId) => {
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
        body: JSON.stringify({ 
          tipo: tipo, 
          item_id: Number(itemId)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await carregarFavoritos(); // Recarregar para garantir consistência
        return true;
      } else {
        alert(result.error || 'Erro ao remover favorito');
        return false;
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      alert('Erro ao remover favorito');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorito
  const toggleFavorito = async (tipo, item) => {
    if (isFavorito(tipo, item.id)) {
      return await removeFavorito(tipo, item.id);
    } else {
      return await adicionarFavorito(tipo, item);
    }
  };

  return {
    favoritos,
    totalFavoritos,
    isFavorito,
    adicionarFavorito,
    removeFavorito,
    toggleFavorito,
    loading,
    user,
    isLoggedIn: !!(user?.email || user?.id),
    recarregar: carregarFavoritos
  };
};