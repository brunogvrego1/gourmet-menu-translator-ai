
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function translateText(
  text: string, 
  fromLanguage: string, 
  toLanguages: string[],
  menuId?: string
): Promise<Record<string, string>> {
  if (!text.trim()) {
    toast.error('Por favor, carregue ou digite o texto do cardápio primeiro.');
    return {};
  }

  if (!toLanguages.length) {
    toast.error('Por favor, selecione pelo menos um idioma para tradução.');
    return {};
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
        fromLanguage: fromLanguage === 'auto' ? 'pt' : fromLanguage, // Default to Portuguese if auto
        toLanguages: toLanguages,
        menuId: menuId
      }
    });

    if (error) {
      console.error('Translation function error:', error);
      
      if (error.message && error.message.includes('Not enough credits')) {
        toast.error('Você não tem créditos suficientes para fazer esta tradução');
      } else if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Você precisa estar logado para traduzir cardápios');
      } else if (error.message && error.message.includes('Error setting up user credits')) {
        toast.error('Erro ao configurar seus créditos. Por favor, tente novamente');
      } else {
        toast.error(`Erro ao traduzir: ${error.message}`);
      }
      
      throw error;
    }

    if (!data || !data.translations) {
      toast.error('Resposta de tradução inválida');
      throw new Error('Invalid translation response');
    }

    return data.translations;
  } catch (error: any) {
    console.error('Translation error:', error);
    if (!error.message || !error.message.includes('Not enough credits')) {
      toast.error('Erro ao traduzir. Tente novamente.');
    }
    throw error;
  }
}
