
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
        fromLanguage: fromLanguage === 'auto' ? 'Unknown' : fromLanguage,
        toLanguages: toLanguages,
        menuId: menuId
      }
    });

    if (error) {
      if (error.message.includes('Not enough credits')) {
        toast.error('Você não tem créditos suficientes para fazer esta tradução');
      }
      throw error;
    }

    return data.translations;
  } catch (error) {
    console.error('Translation error:', error);
    toast.error('Erro ao traduzir. Tente novamente.');
    throw error;
  }
}
