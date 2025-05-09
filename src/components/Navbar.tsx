
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    
    const email = user.email || '';
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="w-full py-4 px-6 md:px-10 flex items-center justify-between border-b border-gourmet-soft-purple">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-serif font-semibold text-gradient">Tradutor Gourmet</span>
        </Link>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
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
        
        {user ? (
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback className="bg-gourmet-purple text-white">
                {getUserInitials()}
              </AvatarFallback>
              {/* We can add user avatar here if available */}
            </Avatar>
            <Button variant="outline" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button className="bg-gourmet-purple hover:bg-gourmet-dark-purple text-white">
              Entrar
            </Button>
          </Link>
        )}
      </div>
      
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-serif">Tradutor Gourmet</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-4 mt-6">
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
            
            {user ? (
              <>
                <div className="flex items-center space-x-2 pt-4">
                  <Avatar>
                    <AvatarFallback className="bg-gourmet-purple text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.email}</span>
                </div>
                <Button variant="outline" onClick={() => signOut()}>
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="w-full bg-gourmet-purple hover:bg-gourmet-dark-purple text-white">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
