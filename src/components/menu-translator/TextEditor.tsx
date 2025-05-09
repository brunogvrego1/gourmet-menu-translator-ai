
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Languages } from 'lucide-react';

type TextEditorProps = {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  onOriginalTextChange: (text: string) => void;
  onTranslatedTextChange: (text: string) => void;
  onFromLanguageChange: (lang: string) => void;
  onToLanguageChange: (lang: string) => void;
};

const TextEditor = ({
  originalText,
  translatedText,
  fromLanguage,
  toLanguage,
  onOriginalTextChange,
  onTranslatedTextChange,
  onFromLanguageChange,
  onToLanguageChange
}: TextEditorProps) => {
  
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
              onChange={(e) => onFromLanguageChange(e.target.value)}
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
            value={originalText}
            onChange={(e) => onOriginalTextChange(e.target.value)}
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
              onChange={(e) => onToLanguageChange(e.target.value)}
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
            onChange={(e) => onTranslatedTextChange(e.target.value)}
            placeholder="A tradução aparecerá aqui após o processamento..."
            readOnly={!translatedText}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TextEditor;
