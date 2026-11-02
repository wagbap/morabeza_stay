// components/admin/AdminLayout.jsx
import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const content = useRef(null);

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);

  useEffect(() => { content.current?.scrollTo(0, 0); }, [pathname]);

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
    <div className="admin-workspace fixed inset-0 flex h-dvh min-h-0 overflow-hidden bg-[#f8f9fc]">
      <AdminSidebar />
      <main ref={content} className="h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
