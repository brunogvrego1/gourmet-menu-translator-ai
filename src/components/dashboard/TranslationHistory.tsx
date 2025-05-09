
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';

interface Translation {
  id: string;
  menu_id: string;
  original_language: string;
  target_language: string;
  original_content: string;
  translated_content: string;
  status: string;
  created_at: string;
  menu: {
    name: string;
  };
}

const TranslationHistory = () => {
  const { user } = useAuth();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);

  useEffect(() => {
    if (user) {
      fetchTranslations();
    }
  }, [user]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translations')
        .select(`
          *,
          menu:menu_id (
            name
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranslations(data || []);
    } catch (error: any) {
      console.error('Error fetching translations:', error.message);
      toast.error('Erro ao carregar histórico de traduções');
    } finally {
      setLoading(false);
    }
  };

  const formatLanguage = (code: string): string => {
    const languages: { [key: string]: string } = {
      'pt': 'Português',
      'en': 'Inglês',
      'es': 'Espanhol',
      'fr': 'Francês',
      'de': 'Alemão',
      'it': 'Italiano',
      'ja': 'Japonês',
      'zh': 'Chinês',
      'ru': 'Russo',
      'ar': 'Árabe',
      'auto': 'Automático'
    };

    return languages[code] || code;
  };

  const formatStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'processing': 'Em processamento',
      'completed': 'Concluído',
      'error': 'Erro'
    };

    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'processing': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800'
    };

    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const viewTranslation = (translation: Translation) => {
    setSelectedTranslation(translation);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Histórico de traduções</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gourmet-purple border-t-transparent"></div>
        </div>
      ) : selectedTranslation ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTranslation(null)}
            className="mb-4"
          >
            Voltar ao histórico
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Conteúdo original ({formatLanguage(selectedTranslation.original_language)})</h3>
              <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {selectedTranslation.original_content}
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Conteúdo traduzido ({formatLanguage(selectedTranslation.target_language)})</h3>
              <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {selectedTranslation.translated_content}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Cardápio: {selectedTranslation.menu?.name || 'Não disponível'}</p>
            <p>Data: {new Date(selectedTranslation.created_at).toLocaleDateString('pt-BR')}</p>
            <p>Status: {formatStatus(selectedTranslation.status)}</p>
          </div>
        </div>
      ) : translations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cardápio</TableHead>
              <TableHead>De</TableHead>
              <TableHead>Para</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations.map((translation) => (
              <TableRow key={translation.id}>
                <TableCell className="font-medium">{translation.menu?.name || 'N/A'}</TableCell>
                <TableCell>{formatLanguage(translation.original_language)}</TableCell>
                <TableCell>{formatLanguage(translation.target_language)}</TableCell>
                <TableCell>{new Date(translation.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(translation.status)}`}>
                    {formatStatus(translation.status)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => viewTranslation(translation)}
                  >
                    Ver detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500 py-4">Você ainda não tem histórico de traduções.</p>
      )}
    </div>
  );
};

export default TranslationHistory;
