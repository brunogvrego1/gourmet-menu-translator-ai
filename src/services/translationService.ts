
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function translateText(
  text: string, 
  fromLanguage: string, 
  toLanguage: string,
  menuId?: string
): Promise<string> {
  if (!text.trim()) {
    toast.error('Por favor, carregue ou digite o texto do cardápio primeiro.');
    return '';
  }

  try {
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Você precisa estar logado para traduzir cardápios');
      throw new Error('Not authenticated');
    }

    // Call our Supabase edge function
    const { data, error } = await supabase.functions.invoke('translate-menu', {
      body: {
        text: text,
        fromLanguage: fromLanguage === 'auto' ? 'Unknown' : fromLanguage,
        toLanguage: toLanguage,
        menuId: menuId
      }
    });

    if (error) {
      if (error.message.includes('Not enough credits')) {
        toast.error('Você não tem créditos suficientes para fazer esta tradução');
      }
      throw error;
    }

    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    toast.error('Erro ao traduzir. Tente novamente.');
    throw error;
  }
}
