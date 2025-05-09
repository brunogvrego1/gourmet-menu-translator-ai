
import React from 'react';

type FeatureProps = {
  title: string;
  description: string;
  icon: string;
};

const FeatureCard = ({ title, description, icon }: FeatureProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gourmet-soft-purple hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-gourmet-soft-purple rounded-lg flex items-center justify-center mb-4">
        <div className="text-2xl text-gourmet-purple">{icon}</div>
      </div>
      <h3 className="text-xl font-serif font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: '📷',
      title: 'Upload Inteligente',
      description: 'Carregue fotos ou PDFs de cardápios e nosso sistema extrairá automaticamente o texto.',
    },
    {
      icon: '🔤',
      title: 'Detecção Automática',
      description: 'Nosso sistema detecta automaticamente o idioma original do cardápio.',
    },
    {
      icon: '✨',
      title: 'Tradução Gourmet',
      description: 'Traduções elaboradas que mantêm o contexto e a nuance culinária dos pratos.',
    },
    {
      icon: '📱',
      title: 'Entrega por E-mail',
      description: 'Receba o cardápio traduzido em seu e-mail em formato digital de alta qualidade.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gourmet-soft-purple/30">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Como Funciona</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Traduzir cardápios nunca foi tão simples e preciso. Nossa tecnologia cuida de todo o processo 
            para que você tenha uma experiência gastronômica sem barreiras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
