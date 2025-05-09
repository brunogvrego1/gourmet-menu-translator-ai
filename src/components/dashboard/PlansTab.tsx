
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

type PlanFeature = {
  text: string;
};

type Plan = {
  id: string;
  title: string;
  price: string;
  pricePerUnit: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  highlighted?: boolean;
  creditsAmount: number;
};

const PlansTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const plans: Plan[] = [
    {
      id: 'free',
      title: 'Teste Gratuito',
      price: 'Grátis',
      pricePerUnit: '',
      description: 'Experimente um cardápio sem compromisso',
      features: [
        { text: 'Tradução de 1 cardápio simples' },
        { text: '1 idioma, até 2 páginas' },
        { text: 'Detecção inteligente de idioma' },
        { text: 'Visualização digital instantânea' },
        { text: 'Suporte por email em horário comercial' }
      ],
      buttonText: 'Plano atual',
      highlighted: false,
      creditsAmount: 2
    },
    {
      id: 'small',
      title: 'Pequeno Negócio',
      price: 'R$ 7,90',
      pricePerUnit: '/cardápio',
      description: 'Ideal para cafés e bistrôs',
      features: [
        { text: '1 cardápio com até 2 páginas' },
        { text: 'Tradução para 1 idioma' },
        { text: '1 idioma extra (opcional)' },
        { text: 'Adaptação cultural personalizada' },
        { text: 'Formato digital otimizado em PDF' },
        { text: 'Suporte por email prioritário' }
      ],
      buttonText: 'Escolher este plano',
      highlighted: false,
      creditsAmount: 3
    },
    {
      id: 'professional',
      title: 'Profissional',
      price: 'R$ 29,90',
      pricePerUnit: '/cardápio',
      description: 'Perfeito para restaurantes em crescimento',
      features: [
        { text: '1 cardápio de até 10 páginas' },
        { text: 'Tradução para até 2 idiomas' },
        { text: 'Alta qualidade em PDF ou HTML interativo' },
        { text: 'Adaptação cultural refinada dos pratos' },
        { text: 'Créditos extra para páginas adicionais' },
        { text: 'Suporte prioritário com resposta em 24h' }
      ],
      buttonText: 'Escolher este plano',
      highlighted: true,
      creditsAmount: 6
    },
    {
      id: 'business',
      title: 'Business',
      price: 'R$ 199,90',
      pricePerUnit: '/cardápio',
      description: 'Solução completa para redes e hotéis',
      features: [
        { text: 'Tradução para até 5 idiomas' },
        { text: 'Páginas ilimitadas por cardápio' },
        { text: 'Formato personalizado com sua identidade visual' },
        { text: 'Adaptação cultural premium com consultoria' },
        { text: 'Créditos para múltiplos cardápios' },
        { text: 'Suporte dedicado 24/7 com gerente de conta' }
      ],
      buttonText: 'Falar com consultor',
      highlighted: false,
      creditsAmount: 15
    }
  ];

  const handleSelectPlan = (plan: Plan) => {
    // In a real implementation, this would redirect to a payment page or checkout flow
    if (plan.id === 'free') {
      toast({
        title: "Plano Atual",
        description: "Você já está utilizando o plano gratuito.",
      });
      return;
    }
    
    toast({
      title: "Plano selecionado",
      description: `Você selecionou o plano ${plan.title}. Em breve implementaremos a funcionalidade de pagamento.`,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Escolha seu plano</h2>
        <p className="text-gray-500 mt-2">
          Selecione o plano que melhor se adapta às necessidades do seu estabelecimento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`overflow-hidden ${
              plan.highlighted 
                ? 'border-gourmet-purple shadow-lg shadow-gourmet-purple/10' 
                : 'border-gourmet-soft-purple'
            }`}
          >
            {plan.highlighted && (
              <div className="bg-gourmet-purple text-white text-center py-1 text-xs font-medium">
                MAIS POPULAR
              </div>
            )}
            <CardHeader className={`pb-6 pt-6 ${plan.highlighted ? 'bg-gourmet-soft-purple/50' : ''}`}>
              <h3 className="text-xl font-serif font-semibold mb-2">{plan.title}</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.pricePerUnit && <span className="ml-1 text-gray-500">{plan.pricePerUnit}</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent className="py-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="text-gourmet-purple mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-lg font-medium text-gourmet-purple">{plan.creditsAmount}</span>
                    <span className="text-sm text-gray-500 ml-1">créditos incluídos</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${
                  plan.highlighted 
                    ? 'bg-gourmet-purple hover:bg-gourmet-dark-purple' 
                    : plan.id === 'free' ? 'bg-gray-100 text-gray-500 cursor-not-allowed hover:bg-gray-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleSelectPlan(plan)}
                disabled={plan.id === 'free'}
              >
                {plan.id === 'free' ? 'Plano atual' : plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlansTab;
