
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 animate-fade-in">
            <span className="text-gradient">Traduza cardápios</span> com <br />
            elegância e precisão
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8 animate-slide-up">
            Transforme qualquer cardápio em uma versão traduzida e culturalmente adaptada 
            com nossa tecnologia de inteligência artificial especializada em gastronomia.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-gourmet-purple hover:bg-gourmet-dark-purple text-white font-medium"
              asChild
            >
              <Link to="/auth">
                Traduzir agora
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gourmet-purple text-gourmet-purple hover:bg-gourmet-soft-purple"
              asChild
            >
              <Link to="/precos">
                Saiba mais
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-gourmet-soft-purple opacity-40 blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-gourmet-light-purple opacity-40 blur-xl"></div>
    </div>
  );
};

export default Hero;
