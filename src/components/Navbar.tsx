
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-6 md:px-10 flex items-center justify-between border-b border-gourmet-soft-purple">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-serif font-semibold text-gradient">Tradutor Gourmet</span>
        </Link>
      </div>
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-sm font-medium hover:text-gourmet-purple transition-colors">
          Início
        </Link>
        <Link to="/" className="text-sm font-medium hover:text-gourmet-purple transition-colors">
          Como Funciona
        </Link>
        <Link to="/" className="text-sm font-medium hover:text-gourmet-purple transition-colors">
          Preços
        </Link>
        <Link to="/" className="text-sm font-medium hover:text-gourmet-purple transition-colors">
          Contato
        </Link>
        <Link 
          to="/"
          className="bg-gourmet-purple hover:bg-gourmet-dark-purple text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Começar
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
