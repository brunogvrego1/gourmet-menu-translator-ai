
// supabase/functions/translate-menu/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with Supabase credentials using service role key
    // This allows bypassing RLS policies for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create a regular client for user authentication checks
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { text, fromLanguage, toLanguages, menuId, useDeepSeek } = await req.json();

    // Get user session from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication failed", details: authError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    // Check if the user has credits record
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from('credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single();

    // Handle credits management
    if (creditsError) {
      console.log("Error checking credits:", creditsError.message);
      
      // If the credits record doesn't exist, create one with default values
      if (creditsError.code === 'PGRST116') {
        console.log("Creating credits record for user:", user.id);
        const { data: newCredits, error: insertError } = await supabaseAdmin
          .from('credits')
          .insert({ 
            user_id: user.id,
            total_credits: 10,
            used_credits: 0,
            tier: 'free'
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Failed to create credits record:", insertError);
          return new Response(JSON.stringify({ error: "Error setting up user credits" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // Use the newly created credits record
        if (newCredits) {
          console.log("Using newly created credits:", newCredits);
          // UPDATED: Each translation costs 1 credit per language
          const requiredCredits = 1 * toLanguages.length;
          const availableCredits = newCredits.total_credits - newCredits.used_credits;
          
          if (availableCredits < requiredCredits) {
            return new Response(JSON.stringify({ error: "Not enough credits" }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } else {
        return new Response(JSON.stringify({ error: "Error checking credits" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.log("User credits:", credits);
      // UPDATED: Each translation costs 1 credit per language
      const requiredCredits = 1 * toLanguages.length;
      const availableCredits = credits.total_credits - credits.used_credits;
      
      if (availableCredits < requiredCredits) {
        return new Response(JSON.stringify({ error: "Not enough credits" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate translations using DeepSeek API
    const translations: Record<string, string> = {};
    
    for (const targetLang of toLanguages) {
      try {
        // Call DeepSeek API for translation
        const translatedText = await translateWithDeepSeek(text, fromLanguage, targetLang);
        translations[targetLang] = translatedText;
      } catch (error) {
        console.error(`Error translating to ${targetLang}:`, error);
        // Use a placeholder message for failed translations
        translations[targetLang] = `Error translating to ${targetLang}: ${error.message}`;
      }
    }

    // Update user's credits using the admin client (bypassing RLS)
    try {
      // UPDATED: Calculate credits to add - now 1 credit per language
      const creditsToAdd = 1 * toLanguages.length;
      
      // Fix: Use a direct update instead of RPC call that's causing errors
      const { error: updateError } = await supabaseAdmin
        .from('credits')
        .update({
          used_credits: credits ? credits.used_credits + creditsToAdd : creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Error updating credits:", updateError);
        // Continue anyway - user still gets the translation
      }
    } catch (error) {
      console.error("Exception updating credits:", error);
      // Continue anyway - user still gets the translation
    }

    // Record the translations in the translations table (one entry per language)
    for (const targetLang of toLanguages) {
      // Fix: Remove the translation_method field which doesn't exist in the table
      const { error: translationError } = await supabaseAdmin
        .from('translations')
        .insert({
          user_id: user.id,
          menu_id: menuId || null,
          original_language: fromLanguage,
          target_language: targetLang,
          original_content: text,
          translated_content: translations[targetLang],
          status: 'completed'
        });

      if (translationError) {
        console.error(`Error recording translation for ${targetLang}:`, translationError);
        // We'll continue even if this fails - the user still gets their translation
      }
    }

    // Return the translated texts
    return new Response(JSON.stringify({ translations }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error processing translation:", error);
    
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Translates text using the DeepSeek API
 */
async function translateWithDeepSeek(text: string, fromLanguage: string, targetLang: string): Promise<string> {
  console.log(`Translating from ${fromLanguage} to ${targetLang} using DeepSeek API`);
  
  // Specialized culinary translation prompt
  const systemPrompt = `Você é um tradutor gastronômico profissional, com foco em adaptar menus e cardápios para turistas, mantendo o charme e relevância cultural do original. Ao traduzir de ${getLangName(fromLanguage)} para ${getLangName(targetLang)}, preserve o estilo do restaurante e destaque ingredientes ou preparações típicas com explicações sutis e elegantes.

- Traduza como se estivesse explicando o prato para um cliente estrangeiro exigente.
- Evite traduções literais.
- Use termos que comuniquem o *espírito* do prato.
- Inclua observações culturais curtas quando necessário (ex: [popular in Bahia], [similar to risotto]).

Evite repetir palavras, use sinônimos criativos, preserve a intenção original.`;
  
  const userPrompt = `Traduza este cardápio do ${getLangName(fromLanguage)} para ${getLangName(targetLang)}:\n\n${text}`;
  
  try {
    // Make request to DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("DEEPSEEK_API_KEY")}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API error:", errorData);
      throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log("DeepSeek response received");
    
    // Extract the translated text from the response
    const translatedText = data.choices[0]?.message?.content;
    if (!translatedText) {
      throw new Error("Empty translation response from DeepSeek");
    }
    
    return translatedText;
  } catch (error) {
    console.error("DeepSeek translation error:", error);
    
    // Fallback to sample translations for demo purposes
    console.log("Using fallback translations");
    return getFallbackTranslation(text, fromLanguage, targetLang);
  }
}

/**
 * Get language name from code
 */
function getLangName(langCode: string): string {
  const languages: Record<string, string> = {
    'pt': 'Portuguese',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'it': 'Italian',
    'de': 'German',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ru': 'Russian',
    'ar': 'Arabic'
  };
  
  return languages[langCode] || langCode;
}

/**
 * Fallback translation function for demo purposes
 */
function getFallbackTranslation(text: string, fromLanguage: string, targetLang: string): string {
  // For demonstration, we'll translate a simple menu from Brazilian Portuguese to selected languages
  if (targetLang === 'en' && fromLanguage === 'pt') {
    // Portuguese to English translations for common menu items
    const pt_to_en: Record<string, string> = {
      'Seção: Pratos Principais': 'Section: Main Dishes',
      'Feijoada Completa': 'Complete Feijoada',
      'Feijão preto cozido com carne seca, costelinha de porco, linguiça e paio. Acompanhado de arroz branco, couve refogada, laranja fatiada e farofa.': 
        'Black beans cooked with dried meat, pork ribs, sausage and "paio". Served with white rice, sautéed collard greens, sliced orange and "farofa".',
      'Serve 2 pessoas.': 'Serves 2 people.',
      'Moqueca de Peixe': 'Fish Stew',
      'Peixe fresco cozido no leite de coco com pimentões, cebola, coentro e azeite de dendê. Acompanha arroz e pirão.':
        'Fresh fish cooked in coconut milk with bell peppers, onion, cilantro and palm oil. Served with rice and fish porridge.',
      'Frango à Parmegiana': 'Chicken Parmigiana',
      'Filé de frango empanado, coberto com molho de tomate caseiro e queijo derretido. Servido com arroz e batata frita.':
        'Breaded chicken fillet, covered with homemade tomato sauce and melted cheese. Served with rice and french fries.',
      'Risoto de Cogumelos': 'Mushroom Risotto'
    };
    
    let translatedText = text;
    
    // Replace Portuguese phrases with English translations
    Object.entries(pt_to_en).forEach(([pt, en]) => {
      translatedText = translatedText.replace(new RegExp(pt, 'g'), en);
    });
    
    return translatedText;
  } 
  else if (targetLang === 'es' && fromLanguage === 'pt') {
    // Portuguese to Spanish translations
    const pt_to_es: Record<string, string> = {
      'Seção: Pratos Principais': 'Sección: Platos Principales',
      'Feijoada Completa': 'Feijoada Completa',
      'Feijão preto cozido com carne seca, costelinha de porco, linguiça e paio. Acompanhado de arroz branco, couve refogada, laranja fatiada e farofa.': 
        'Frijoles negros cocidos con carne seca, costillas de cerdo, chorizo y "paio". Acompañado de arroz blanco, col salteada, naranja en rodajas y "farofa".',
      'Serve 2 pessoas.': 'Sirve para 2 personas.',
      'Moqueca de Peixe': 'Moqueca de Pescado',
      'Peixe fresco cozido no leite de coco com pimentões, cebola, coentro e azeite de dendê. Acompanha arroz e pirão.':
        'Pescado fresco cocido en leche de coco con pimientos, cebolla, cilantro y aceite de palma. Acompañado de arroz y pirão.',
      'Frango à Parmegiana': 'Pollo a la Parmesana',
      'Filé de frango empanado, coberto com molho de tomate caseiro e queijo derretido. Servido com arroz e batata frita.':
        'Filete de pollo empanado, cubierto con salsa de tomate casera y queso derretido. Servido con arroz y papas fritas.',
      'Risoto de Cogumelos': 'Risotto de Hongos'
    };
    
    let translatedText = text;
    
    // Replace Portuguese phrases with Spanish translations
    Object.entries(pt_to_es).forEach(([pt, es]) => {
      translatedText = translatedText.replace(new RegExp(pt, 'g'), es);
    });
    
    return translatedText;
  }
  else {
    // For languages we don't have specific translations for, display a placeholder
    return text + ` [Traduzido de ${fromLanguage} para ${targetLang}]`;
  }
}
