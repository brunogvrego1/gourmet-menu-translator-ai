
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

const UserMenu = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">O seu cardápio</h1>
        
        {user && (
          <div className="mb-6">
            <p className="text-gray-600">
              Bem-vindo(a) ao seu painel de controle. Aqui você pode gerenciar seus cardápios, ver suas traduções e 
              acompanhar seus créditos.
            </p>
          </div>
        )}

        <DashboardTabs />
      </div>
      <Footer />
    </div>
  );
};

export default UserMenu;
