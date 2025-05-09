
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

type PricingTierProps = {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
};

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  highlighted = false 
}: PricingTierProps) => {
  return (
    <Card className={`overflow-hidden ${
      highlighted 
        ? 'border-gourmet-purple shadow-lg shadow-gourmet-purple/10' 
        : 'border-gourmet-soft-purple'
    }`}>
      {highlighted && (
        <div className="bg-gourmet-purple text-white text-center py-1 text-xs font-medium">
          MAIS POPULAR
        </div>
      )}
      <CardHeader className={`pb-6 pt-6 ${highlighted ? 'bg-gourmet-soft-purple/50' : ''}`}>
        <h3 className="text-xl font-serif font-semibold mb-2">{title}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Grátis' && <span className="ml-1 text-gray-500">/cardápio</span>}
        </div>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </CardHeader>
      <CardContent className="py-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-gourmet-purple mr-2">✓</span>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${
            highlighted 
              ? 'bg-gourmet-purple hover:bg-gourmet-dark-purple' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
  const pricingPlans = [
    {
      title: 'Básico',
      price: 'Grátis',
      description: 'Para uso pessoal ocasional',
      features: [
        'Tradução de 1 cardápio por mês',
        'Detecção automática de idioma',
        'Formato digital básico',
        'Suporte por email'
      ],
      buttonText: 'Começar grátis',
      highlighted: false
    },
    {
      title: 'Profissional',
      price: 'R$ 29,90',
      description: 'Para pequenos restaurantes',
      features: [
        'Até 10 páginas por cardápio',
        'Tradução para até 2 idiomas',
        'Alta qualidade em PDF ou HTML',
        'Adaptação cultural dos pratos',
        'Suporte prioritário'
      ],
      buttonText: 'Escolher plano',
      highlighted: true
    },
    {
      title: 'Business',
      price: 'R$ 199,90',
      description: 'Para restaurantes e hotéis',
      features: [
        'Número ilimitado de páginas',
        'Tradução para até 5 idiomas',
        'Formato personalizado com branding',
        'Adaptação cultural avançada',
        'Suporte dedicado 24/7'
      ],
      buttonText: 'Contate-nos',
      highlighted: false
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gourmet-soft-purple/30">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Planos e preços</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano que melhor se adapta às necessidades do seu estabelecimento.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingTier
              key={index}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              buttonText={plan.buttonText}
              highlighted={plan.highlighted}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
