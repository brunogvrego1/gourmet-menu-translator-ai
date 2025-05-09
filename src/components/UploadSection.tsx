
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './menu-translator/FileUploader';
import TextEditor from './menu-translator/TextEditor';
import { translateText } from '@/services/translationService';

const UploadSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguage, setToLanguage] = useState('pt');
  const { toast: shadcnToast } = useToast();

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
        )}
        
        <div className="mt-8 flex flex-col space-y-4">
          {menuText && (
            <Button 
              size="lg" 
              className="w-full max-w-xs mx-auto mt-6 bg-gourmet-purple hover:bg-gourmet-dark-purple"
              disabled={isLoading}
              onClick={handleTranslate}
            >
              {isLoading ? 'Traduzindo...' : 'Traduzir agora'}
            </Button>
          )}
          
          {menuText && (
            <Button 
              variant="outline" 
              className="w-full max-w-xs mx-auto"
              onClick={() => {
                setMenuText('');
                setTranslatedText('');
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
