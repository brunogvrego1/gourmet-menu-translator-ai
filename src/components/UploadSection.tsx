
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './menu-translator/FileUploader';
import TextEditor from './menu-translator/TextEditor';
import { translateText } from '@/services/translationService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const UploadSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguage, setToLanguage] = useState('pt');
  const [menuName, setMenuName] = useState('');
  const { toast: shadcnToast } = useToast();
  const { user } = useAuth();

  const handleTranslate = async () => {
    if (!menuText.trim()) return;

    setIsLoading(true);
    try {
      const result = await translateText(menuText, fromLanguage, toLanguage);
      setTranslatedText(result);
      shadcnToast({
        title: "Tradução concluída",
        description: "Seu cardápio foi traduzido com sucesso!",
      });
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar cardápios');
      return;
    }
    
    if (!menuName.trim()) {
      toast.error('Por favor, dê um nome ao seu cardápio');
      return;
    }

    if (!translatedText) {
      toast.error('Traduza o cardápio antes de salvar');
      return;
    }

    try {
      setIsLoading(true);
      
      // Save menu
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          name: menuName,
          content: translatedText,
          user_id: user.id
        })
        .select()
        .single();
        
      if (menuError) throw menuError;

      // Save translation record
      const { error: translationError } = await supabase
        .from('translations')
        .insert({
          menu_id: menu.id,
          user_id: user.id,
          original_language: fromLanguage,
          target_language: toLanguage,
          original_content: menuText,
          translated_content: translatedText,
          status: 'completed'
        });
        
      if (translationError) throw translationError;
      
      toast.success('Cardápio salvo com sucesso!');
      
      // Reset form
      setMenuName('');
      setMenuText('');
      setTranslatedText('');
      
    } catch (error: any) {
      console.error('Error saving menu:', error);
      toast.error('Erro ao salvar o cardápio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileProcessed = (text: string) => {
    setMenuText(text);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Traduza seu cardápio agora
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Carregue uma imagem ou PDF do cardápio que deseja traduzir. 
            Nosso sistema com OCR (Reconhecimento Óptico de Caracteres) extrairá o texto automaticamente.
          </p>
        </div>
        
        {!menuText ? (
          <FileUploader onFileProcessed={handleFileProcessed} />
        ) : (
          <>
            {translatedText && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do cardápio
                </label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Digite um nome para este cardápio"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
            
            <TextEditor 
              originalText={menuText}
              translatedText={translatedText}
              fromLanguage={fromLanguage}
              toLanguage={toLanguage}
              onOriginalTextChange={setMenuText}
              onTranslatedTextChange={setTranslatedText}
              onFromLanguageChange={setFromLanguage}
              onToLanguageChange={setToLanguage}
            />
          </>
        )}
        
        <div className="mt-8 flex flex-col space-y-4">
          {menuText && !translatedText && (
            <Button 
              size="lg" 
              className="w-full max-w-xs mx-auto mt-6 bg-gourmet-purple hover:bg-gourmet-dark-purple"
              disabled={isLoading}
              onClick={handleTranslate}
            >
              {isLoading ? 'Traduzindo...' : 'Traduzir agora'}
            </Button>
          )}
          
          {translatedText && user && (
            <Button 
              size="lg" 
              className="w-full max-w-xs mx-auto bg-gourmet-purple hover:bg-gourmet-dark-purple"
              disabled={isLoading}
              onClick={handleSaveMenu}
            >
              {isLoading ? 'Salvando...' : 'Salvar tradução'}
            </Button>
          )}
          
          {menuText && (
            <Button 
              variant="outline" 
              className="w-full max-w-xs mx-auto"
              onClick={() => {
                setMenuText('');
                setTranslatedText('');
                setMenuName('');
              }}
            >
              Começar novamente
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
