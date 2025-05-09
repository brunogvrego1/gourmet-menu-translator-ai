
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { History, Loader2 } from 'lucide-react';

interface CreditHistoryItem {
  id: string;
  created_at: string;
  menu_id: string | null;
  original_language: string;
  target_language: string;
  status: string;
}

interface CreditUsageHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreditUsageHistory: React.FC<CreditUsageHistoryProps> = ({ open, onOpenChange }) => {
  const [usageHistory, setUsageHistory] = useState<CreditHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchUsageHistory();
    }
  }, [open, user]);

  const fetchUsageHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translations')
        .select('id, created_at, menu_id, original_language, target_language, status')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsageHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching usage history:', error.message);
      toast.error('Não foi possível carregar o histórico de uso');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to format language codes to readable names
  const formatLanguage = (langCode: string) => {
    const languages: Record<string, string> = {
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
    
    return languages[langCode] || langCode;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Uso de Créditos
          </DialogTitle>
          <DialogDescription>
            Veja o histórico completo de traduções e uso de créditos da sua conta.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gourmet-purple" />
          </div>
        ) : usageHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Créditos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>{formatLanguage(item.original_language)}</TableCell>
                    <TableCell>{formatLanguage(item.target_language)}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                    </TableCell>
                    <TableCell>1 crédito</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p>Nenhum histórico de uso encontrado.</p>
            <p className="text-sm mt-2">As traduções que você realizar aparecerão aqui.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreditUsageHistory;
