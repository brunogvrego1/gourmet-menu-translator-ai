
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
              Bem-vindo(a) ao seu painel de controle. Aqui você pode gerenciar seus cardápios, ver suas traduções, 
              acompanhar seus créditos e escolher um plano que melhor se adapta ao seu negócio.
            </p>
            <div className="mt-4 p-4 bg-gourmet-soft-purple/20 rounded-md">
              <h3 className="font-medium text-gourmet-dark-purple mb-2">Como funcionam os créditos</h3>
              <p className="text-sm text-gray-700">
                Cada tradução para um idioma consome 10 créditos. A quantidade de créditos disponíveis depende do seu plano:
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• Teste Gratuito: 2 créditos (equivale a 1 cardápio simples para 1 idioma)</li>
                <li>• Pequeno Negócio: 3 créditos para 1-2 idiomas</li>
                <li>• Profissional: 6 créditos para até 2 idiomas com páginas adicionais</li>
                <li>• Business: 15 créditos para até 5 idiomas com páginas ilimitadas</li>
              </ul>
            </div>
          </div>
        )}

        <DashboardTabs />
      </div>
      <Footer />
    </div>
  );
};

export default UserMenu;
