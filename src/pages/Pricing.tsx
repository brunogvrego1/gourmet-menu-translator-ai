
import React from 'react';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-green-500 text-white py-2 text-center">
        <p className="text-sm font-medium">Promoção! Planos gratuitos até 03 de novembro de 2025. Uma semana antes da COP 30</p>
      </div>
      <Navbar />
      <main className="flex-grow">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
