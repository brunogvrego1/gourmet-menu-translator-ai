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
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguages, setToLanguages] = useState<string[]>(['pt']);
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [menuName, setMenuName] = useState('');
  const { toast: shadcnToast } = useToast();
  const { user } = useAuth();

  const handleTranslate = async () => {
    if (!menuText.trim()) return;
    if (!toLanguages.length) {
      toast.error("Por favor, selecione ao menos um idioma para tradução");
      return;
    }

    setIsLoading(true);
    try {
      const results = await translateText(menuText, fromLanguage, toLanguages);
      setTranslatedTexts(results);
      
      // Set the first translated language as the selected one
      if (Object.keys(results).length > 0) {
        setSelectedLanguage(Object.keys(results)[0]);
      }
      
      shadcnToast({
        title: "Tradução concluída",
        description: `Seu cardápio foi traduzido para ${toLanguages.length} idioma${toLanguages.length > 1 ? 's' : ''} com sucesso!`,
      });
      
      // The translation history and credit consumption is now handled automatically
      // by the translate-menu edge function when it's called by translateText()
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

    if (Object.keys(translatedTexts).length === 0) {
      toast.error('Traduza o cardápio antes de salvar');
      return;
    }

    try {
      setIsLoading(true);
      
      // Save menu for the selected language translation
      const translatedContent = translatedTexts[selectedLanguage];
      
      // Save menu
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          name: menuName,
          content: translatedContent,
          user_id: user.id
        })
        .select()
        .single();
        
      if (menuError) throw menuError;

      // Save translation records for all translations
      for (const [lang, content] of Object.entries(translatedTexts)) {
        const { error: translationError } = await supabase
          .from('translations')
          .insert({
            menu_id: menu.id,
            user_id: user.id,
            original_language: fromLanguage,
            target_language: lang,
            original_content: menuText,
            translated_content: content,
            status: 'completed'
          });
          
        if (translationError) {
          console.error(`Error saving translation for ${lang}:`, translationError);
          // Continue with other languages even if one fails
        }
      }
      
      toast.success('Cardápio salvo com sucesso!');
      
      // Reset form
      setMenuName('');
      setMenuText('');
      setTranslatedTexts({});
      
    } catch (error: any) {
      console.error('Error saving menu:', error);
      toast.error('Erro ao salvar o cardápio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileProcessed = (text: string) => {
    setMenuText(text);
    toast.success('Texto extraído com sucesso! Você pode editar o texto antes de traduzir.');
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Traduza seu cardápio agora
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Carregue uma ou várias imagens, fotos ou PDFs dos cardápios que deseja traduzir. 
            Nosso sistema com OCR (Reconhecimento Óptico de Caracteres) extrairá o texto automaticamente.
          </p>
        </div>
        
        {!menuText ? (
          <FileUploader onFileProcessed={handleFileProcessed} multiple={true} />
        ) : (
          <>
            {Object.keys(translatedTexts).length > 0 && (
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
              translatedTexts={translatedTexts}
              fromLanguage={fromLanguage}
              toLanguages={toLanguages}
              selectedLanguage={selectedLanguage}
              onOriginalTextChange={setMenuText}
              onFromLanguageChange={setFromLanguage}
              onToLanguagesChange={setToLanguages}
              onSelectedLanguageChange={setSelectedLanguage}
            />
          </>
        )}
        
        <div className="mt-8 flex flex-col space-y-4">
          {menuText && Object.keys(translatedTexts).length === 0 && (
            <Button 
              size="lg" 
              className="w-full max-w-xs mx-auto mt-6 bg-gourmet-purple hover:bg-gourmet-dark-purple"
              disabled={isLoading || toLanguages.length === 0}
              onClick={handleTranslate}
            >
              {isLoading ? 'Traduzindo...' : 'Traduzir agora'}
            </Button>
          )}
          
          {Object.keys(translatedTexts).length > 0 && user && (
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
                setTranslatedTexts({});
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
