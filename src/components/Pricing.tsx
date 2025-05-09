import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check, Globe, Utensils, Award } from 'lucide-react';

type PricingTierProps = {
  title: string;
  price: string;
  description: string;
  features: string[];
  credits: number;
  buttonText: string;
  highlighted?: boolean;
};

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  credits,
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
              <Check className="text-gourmet-purple mr-2 h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg font-medium text-gourmet-purple">{credits}</span>
              <span className="text-sm text-gray-500 ml-1">créditos incluídos</span>
            </div>
          </div>
        </div>
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

const ComparisonItem = ({ title, description }: { title: string, description: string }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-6 border-b border-gourmet-soft-purple">
      <div className="sm:w-1/3">
        <h3 className="font-serif font-medium text-lg">{title}</h3>
      </div>
      <div className="sm:w-2/3">
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const AdvantageCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gourmet-soft-purple hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-gourmet-soft-purple rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Pricing = () => {
  const pricingPlans = [
    {
      title: 'Teste Gratuito',
      price: 'Grátis',
      description: 'Experimente um cardápio sem compromisso',
      features: [
        'Tradução de 1 cardápio simples',
        '1 idioma, até 2 páginas',
        'Detecção inteligente de idioma',
        'Visualização digital instantânea',
        'Suporte por email em horário comercial'
      ],
      credits: 2,
      buttonText: 'Iniciar teste gratuito',
      highlighted: false
    },
    {
      title: 'Pequeno Negócio',
      price: 'R$ 7,90',
      description: 'Ideal para cafés e bistrôs',
      features: [
        '1 cardápio com até 2 páginas',
        'Tradução para 1 idioma',
        '1 idioma extra (opcional)',
        'Adaptação cultural personalizada',
        'Formato digital otimizado em PDF',
        'Suporte por email prioritário'
      ],
      credits: 3,
      buttonText: 'Escolher este plano',
      highlighted: false
    },
    {
      title: 'Profissional',
      price: 'R$ 29,90',
      description: 'Perfeito para restaurantes em crescimento',
      features: [
        '1 cardápio de até 10 páginas',
        'Tradução para até 2 idiomas',
        'Alta qualidade em PDF ou HTML interativo',
        'Adaptação cultural refinada dos pratos',
        'Créditos extra para páginas adicionais',
        'Suporte prioritário com resposta em 24h'
      ],
      credits: 6,
      buttonText: 'Escolher este plano',
      highlighted: true
    },
    {
      title: 'Business',
      price: 'R$ 199,90',
      description: 'Solução completa para redes e hotéis',
      features: [
        'Tradução para até 5 idiomas',
        'Páginas ilimitadas por cardápio',
        'Formato personalizado com o estilo de escrita da sua marca', // Updated this line
        'Adaptação cultural premium', // Updated this line
        'Créditos para múltiplos cardápios',
        'Suporte dedicado 24/7 com gerente de conta'
      ],
      credits: 15,
      buttonText: 'Falar com consultor',
      highlighted: false
    }
  ];

  const advantages = [
    {
      icon: <Globe className="text-gourmet-purple w-6 h-6" />,
      title: 'Adaptação Cultural',
      description: 'Não apenas traduzimos palavras, mas adaptamos culturalmente os pratos para que façam sentido no contexto do turista que esta a conhecer a nossa culinária pela primeira vez.'
    },
    {
      icon: <Utensils className="text-gourmet-purple w-6 h-6" />,
      title: 'Especializado em Gastronomia',
      description: 'Nossa IA é treinada especificamente para o contexto gastronômico, entendendo nuances e termos específicos da culinária.'
    },
    {
      icon: <Award className="text-gourmet-purple w-6 h-6" />,
      title: 'Economia de Tempo e Custo',
      description: 'Economize até 80% em comparação com tradutores humanos, sem comprometer a qualidade.'
    }
  ];

  const comparisons = [
    {
      title: 'Conhecimento Especializado',
      description: 'Tradutores comuns frequentemente não entendem termos gastronômicos específicos, enquanto o Tradutor Gourmet possui conhecimento especializado em culinária global.'
    },
    {
      title: 'Adaptação Cultural',
      description: 'Enquanto tradutores comuns traduzem literalmente, nosso sistema entende que "feijoada" não é apenas "bean stew" e adapta as descrições para ressoar com cada cultura.'
    },
    {
      title: 'Velocidade',
      description: 'Tradutores humanos podem levar dias para entregar um cardápio completo, enquanto o Tradutor Gourmet entrega em questão de minutos.'
    },
    {
      title: 'Consistência',
      description: 'A qualidade de tradutores humanos pode variar, mas nossa plataforma mantém o mesmo padrão elevado em todas as traduções.'
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Planos e preços</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano que melhor se adapta às necessidades do seu estabelecimento.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {pricingPlans.map((plan, index) => (
            <PricingTier
              key={index}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              credits={plan.credits}
              buttonText={plan.buttonText}
              highlighted={plan.highlighted}
            />
          ))}
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">Por que escolher o Tradutor Gourmet?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossas vantagens em comparação com tradutores convencionais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {advantages.map((advantage, index) => (
              <AdvantageCard 
                key={index}
                icon={advantage.icon}
                title={advantage.title}
                description={advantage.description}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">Tradutor Gourmet vs. Tradutores Convencionais</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Entenda como nossa solução especializada supera os métodos tradicionais de tradução
            </p>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gourmet-soft-purple">
            {comparisons.map((comparison, index) => (
              <ComparisonItem 
                key={index}
                title={comparison.title}
                description={comparison.description}
              />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-gourmet-soft-purple/30 p-8 rounded-xl">
              <h3 className="text-xl font-serif font-semibold mb-4">Adaptação Cultural que Faz a Diferença</h3>
              <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                Quando traduzimos "moqueca de peixe", não dizemos apenas "fish stew". Explicamos que é um ensopado brasileiro de peixe com leite de coco, tomate, pimentões e coentro, cozido lentamente em panela de barro. Essa é a diferença do Tradutor Gourmet.
              </p>
              <Button className="bg-gourmet-purple hover:bg-gourmet-dark-purple text-white">
                Experimente agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
