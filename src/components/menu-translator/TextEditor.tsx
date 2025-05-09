
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type TextEditorProps = {
  originalText: string;
  translatedTexts: Record<string, string>;
  fromLanguage: string;
  toLanguages: string[];
  onOriginalTextChange: (text: string) => void;
  onFromLanguageChange: (lang: string) => void;
  onToLanguagesChange: (langs: string[]) => void;
  selectedLanguage: string;
  onSelectedLanguageChange: (lang: string) => void;
};

const TextEditor = ({
  originalText,
  translatedTexts,
  fromLanguage,
  toLanguages,
  selectedLanguage,
  onOriginalTextChange,
  onFromLanguageChange,
  onToLanguagesChange,
  onSelectedLanguageChange
}: TextEditorProps) => {
  
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

  const getLanguageName = (code: string) => {
    return languages[code] || code;
  };

  const toggleLanguage = (lang: string) => {
    if (toLanguages.includes(lang)) {
      onToLanguagesChange(toLanguages.filter(l => l !== lang));
    } else {
      onToLanguagesChange([...toLanguages, lang]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium flex items-center">
              <Globe className="mr-2 h-4 w-4" /> Texto Original
            </h3>
            <Select value={fromLanguage} onValueChange={onFromLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Idioma de origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">{getLanguageName('auto')}</SelectItem>
                <SelectItem value="en">{getLanguageName('en')}</SelectItem>
                <SelectItem value="fr">{getLanguageName('fr')}</SelectItem>
                <SelectItem value="it">{getLanguageName('it')}</SelectItem>
                <SelectItem value="es">{getLanguageName('es')}</SelectItem>
                <SelectItem value="de">{getLanguageName('de')}</SelectItem>
                <SelectItem value="pt">{getLanguageName('pt')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea 
            className="min-h-[300px] font-mono text-sm"
            value={originalText}
            onChange={(e) => onOriginalTextChange(e.target.value)}
            placeholder="Texto do cardápio original aparecerá aqui..."
          />
        </CardContent>
      </Card>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="font-medium flex items-center mb-3">
          <Languages className="mr-2 h-4 w-4" /> Selecione os idiomas para tradução
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {Object.entries(languages).filter(([key]) => key !== 'auto' && key !== fromLanguage).map(([code, name]) => (
            <div key={code} className="flex items-center space-x-2">
              <Checkbox 
                id={`lang-${code}`} 
                checked={toLanguages.includes(code)} 
                onCheckedChange={() => toggleLanguage(code)} 
              />
              <Label htmlFor={`lang-${code}`}>{name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      {Object.keys(translatedTexts).length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center">
                <Languages className="mr-2 h-4 w-4" /> Tradução
              </h3>
              <Select 
                value={selectedLanguage} 
                onValueChange={onSelectedLanguageChange}
                disabled={Object.keys(translatedTexts).length === 0}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {Object.keys(translatedTexts).map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {getLanguageName(lang)}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <Textarea 
              className="min-h-[300px] font-mono text-sm"
              value={translatedTexts[selectedLanguage] || ''}
              placeholder="A tradução aparecerá aqui após o processamento..."
              readOnly
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextEditor;
