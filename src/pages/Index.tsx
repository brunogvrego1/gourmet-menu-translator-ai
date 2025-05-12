
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import UploadSection from '@/components/UploadSection';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-green-500 text-white py-2 text-center">
        <p className="text-sm font-medium">Promoção! Todos os planos gratuitos até 03 de novembro de 2025</p>
      </div>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <UploadSection />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
