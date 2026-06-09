// components/admin/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  // Buscar dados do admin no localStorage
  const adminData = localStorage.getItem('morabeza_admin');
  
  console.log('AdminProtectedRoute - Verificando autenticação:', !!adminData);
  
  if (!adminData) {
    console.log('AdminProtectedRoute - Sem dados, redirecionando para login');
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const admin = JSON.parse(adminData);
    
    // Verificar se o objeto admin tem os campos necessários
    if (!admin || !admin.id) {
      console.log('AdminProtectedRoute - Dados inválidos, redirecionando');
      localStorage.removeItem('morabeza_admin');
      return <Navigate to="/admin/login" replace />;
    }

    // Verificar se é admin de diferentes formas
    const isAdmin = 
      admin.role === 'admin' || 
      admin.tipo === 'admin' ||
      (admin.roles && admin.roles.includes('admin')) ||
      admin.isAdmin === true ||
      admin.email === 'admin@morabezastay.com';

    console.log('AdminProtectedRoute - isAdmin:', isAdmin);

    if (isAdmin) {
      // Usuário é admin, permitir acesso
      return <Outlet />;
    } else {
      console.log('AdminProtectedRoute - Não é admin, redirecionando');
      localStorage.removeItem('morabeza_admin');
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    console.error('AdminProtectedRoute - Erro:', error);
    localStorage.removeItem('morabeza_admin');
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminProtectedRoute;