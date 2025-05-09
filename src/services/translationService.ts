
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

export async function translateText(
  text: string, 
  fromLanguage: string, 
  toLanguage: string
): Promise<string> {
  if (!text.trim()) {
    toast.error('Por favor, carregue ou digite o texto do cardápio primeiro.');
    return '';
  }

  try {
    // Call our Supabase edge function
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.functions.invoke('translate-menu', {
      body: {
        text: text,
        fromLanguage: fromLanguage === 'auto' ? 'Unknown' : fromLanguage,
        toLanguage: toLanguage
      }
    });

    if (error) throw error;

    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    toast.error('Erro ao traduzir. Tente novamente.');
    throw error;
  }
}
