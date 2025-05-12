
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Instagram } from 'lucide-react';
import { Button } from './ui/button';

const Footer = () => {
  return (
    <footer className="bg-gourmet-midnight text-white py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-serif font-semibold">Tradutor Gourmet</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Transformando experiências gastronômicas através de traduções precisas, 
              elegantes e culturalmente adaptadas para cardápios do mundo todo.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/tradutorgourmet?igsh=MXdmc2MweDl0cTc2dg%3D%3D&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/precos" className="text-gray-300 hover:text-white transition-colors">Preços</Link></li>
              <li><Link to="/contato" className="text-gray-300 hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Contato</h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://wa.me/5591993714041" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <MessageSquare size={18} />
                  Fale Conosco
                </a>
              </li>
              <li className="text-gray-300">Belém, Brasil</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Tradutor Gourmet. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
