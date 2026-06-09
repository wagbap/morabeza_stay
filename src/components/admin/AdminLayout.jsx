// components/admin/AdminLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se admin está autenticado
    const adminData = localStorage.getItem('morabeza_admin');
    
    if (!adminData) {
      navigate('/admin/login', { replace: true });
      return;
    }

    try {
      const admin = JSON.parse(adminData);
      const isAdmin = 
        admin.role === 'admin' || 
        admin.tipo === 'admin' ||
        (admin.roles && admin.roles.includes('admin')) ||
        admin.isAdmin === true ||
        admin.email === 'admin@morabezastay.com';

      if (!isAdmin) {
        localStorage.removeItem('morabeza_admin');
        navigate('/admin/login', { replace: true });
      }
    } catch (error) {
      localStorage.removeItem('morabeza_admin');
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;