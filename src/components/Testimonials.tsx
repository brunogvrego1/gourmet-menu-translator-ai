
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type TestimonialProps = {
  quote: string;
  name: string;
  title: string;
};

const TestimonialCard = ({ quote, name, title }: TestimonialProps) => {
  return (
    <Card className="border border-gourmet-soft-purple bg-white">
      <CardContent className="p-6">
        <div className="text-gourmet-purple text-3xl mb-4">"</div>
        <p className="text-gray-700 italic mb-6">{quote}</p>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      quote: "O Tradutor Gourmet transformou minha experiência gastronômica em Paris. Nunca mais terei que adivinhar o que estou pedindo!",
      name: "Mariana Silva",
      title: "Viajante Frequente"
    },
    {
      quote: "Como chef, precisava traduzir meu cardápio para turistas internacionais. O resultado foi tão profissional que impressionou todos os meus clientes.",
      name: "Carlos Mendes",
      title: "Chef de Cozinha"
    },
    {
      quote: "Nossa rede de hotéis utiliza o Tradutor Gourmet para todos os restaurantes. A precisão nas traduções e a adaptação cultural são impecáveis.",
      name: "Ana Beatriz Costa",
      title: "Gerente de Hospitalidade"
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">O que dizem nossos clientes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pessoas e empresas que já transformaram sua experiência gastronômica com o Tradutor Gourmet.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
