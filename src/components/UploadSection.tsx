
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/use-toast';

const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguage, setToLanguage] = useState('pt');
  const { toast: shadcnToast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    try {
      // Check file type
      if (file.type.includes('image')) {
        // For images, we'd need OCR - for now just show a message
        toast.info('Processando imagem. Isso pode levar um momento.');
        // Here you would integrate with an OCR service
        // For now, let's just simulate with a placeholder
        setTimeout(() => {
          setMenuText("Menu Exemplo\n\nEntradas\nSalada Caesar - $12\nSopa do dia - $8\n\nPratos Principais\nFilé Mignon - $35\nSalmão Grelhado - $28");
          setIsLoading(false);
          toast.success('Imagem processada! Edite o texto se necessário antes de traduzir.');
        }, 2000);
      } else if (file.type === 'application/pdf') {
        // For PDFs, we'd need PDF text extraction
        toast.info('Extraindo texto do PDF...');
        // Simulated for now
        setTimeout(() => {
          setMenuText("Menu PDF Exemplo\n\nEntradas\nBruschetta - €10\nCarpaccio - €14\n\nPratos Principais\nRisotto ai Funghi - €22\nPasta Carbonara - €18");
          setIsLoading(false);
          toast.success('PDF processado! Edite o texto se necessário antes de traduzir.');
        }, 2000);
      } else {
        // For text files
        const text = await file.text();
        setMenuText(text);
        toast.success('Arquivo carregado com sucesso!');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!menuText.trim()) {
      toast.error('Por favor, carregue ou digite o texto do cardápio primeiro.');
      return;
    }

    setIsLoading(true);
    try {
      // Call our Supabase edge function
      const supabase = createClientComponentClient();
      const { data, error } = await supabase.functions.invoke('translate-menu', {
        body: {
          text: menuText,
          fromLanguage: fromLanguage === 'auto' ? 'Unknown' : fromLanguage,
          toLanguage: toLanguage
        }
      });

      if (error) throw error;

      setTranslatedText(data.translatedText);
      shadcnToast({
        title: "Tradução concluída",
        description: "Seu cardápio foi traduzido com sucesso!",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Erro ao traduzir. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'auto': 'Detectar automaticamente',
      'pt': 'Português',
      'en': 'Inglês',
      'es': 'Espanhol', 
      'fr': 'Francês',
      'it': 'Italiano',
      'de': 'Alemão',
      'ja': 'Japonês',
      'zh': 'Chinês',
      'ru': 'Russo',
      'ar': 'Árabe'
    };
    return languages[code] || code;
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
            Nosso sistema inteligente fará o resto.
          </p>
        </div>
        
        {!menuText ? (
          <Card className="border-dashed border-2 border-gourmet-soft-purple hover:border-gourmet-purple transition-colors">
            <CardContent className="p-0">
              <div 
                className={`flex flex-col items-center justify-center h-64 p-6 cursor-pointer ${
                  dragActive ? 'bg-gourmet-soft-purple/50' : 'bg-transparent'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="w-16 h-16 bg-gourmet-soft-purple rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-lg font-medium mb-2">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou clique para selecionar (JPG, PNG, PDF)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf,text/plain"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button disabled={isLoading} className="bg-gourmet-purple hover:bg-gourmet-dark-purple">
                  {isLoading ? 'Processando...' : 'Selecionar arquivo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center">
                    <Globe className="mr-2 h-4 w-4" /> Texto Original
                  </h3>
                  <select 
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={fromLanguage}
                    onChange={(e) => setFromLanguage(e.target.value)}
                  >
                    <option value="auto">{getLanguageName('auto')}</option>
                    <option value="en">{getLanguageName('en')}</option>
                    <option value="fr">{getLanguageName('fr')}</option>
                    <option value="it">{getLanguageName('it')}</option>
                    <option value="es">{getLanguageName('es')}</option>
                    <option value="de">{getLanguageName('de')}</option>
                    <option value="pt">{getLanguageName('pt')}</option>
                  </select>
                </div>
                <Textarea 
                  className="min-h-[300px] font-mono text-sm"
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                  placeholder="Texto do cardápio original aparecerá aqui..."
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center">
                    <Languages className="mr-2 h-4 w-4" /> Tradução
                  </h3>
                  <select 
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={toLanguage}
                    onChange={(e) => setToLanguage(e.target.value)}
                  >
                    <option value="pt">{getLanguageName('pt')}</option>
                    <option value="en">{getLanguageName('en')}</option>
                    <option value="fr">{getLanguageName('fr')}</option>
                    <option value="it">{getLanguageName('it')}</option>
                    <option value="es">{getLanguageName('es')}</option>
                    <option value="de">{getLanguageName('de')}</option>
                    <option value="ja">{getLanguageName('ja')}</option>
                    <option value="zh">{getLanguageName('zh')}</option>
                  </select>
                </div>
                <Textarea 
                  className="min-h-[300px] font-mono text-sm"
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  placeholder="A tradução aparecerá aqui após o processamento..."
                  readOnly={!translatedText}
                />
              </CardContent>
            </Card>
          </div>
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
