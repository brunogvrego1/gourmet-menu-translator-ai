
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
    // Create Supabase client with Supabase credentials
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    // Parse request body
    const { text, fromLanguage, toLanguages, menuId } = await req.json();

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
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if the user has enough credits
    const { data: credits, error: creditsError } = await supabaseClient
      .from('credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single();

    if (creditsError) {
      return new Response(JSON.stringify({ error: "Error checking credits" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Each language counts as 1 credit
    const requiredCredits = toLanguages.length;
    const availableCredits = credits.total_credits - credits.used_credits;
    
    if (availableCredits < requiredCredits) {
      return new Response(JSON.stringify({ error: "Not enough credits" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate translations for each language
    const translations: Record<string, string> = {};
    
    for (const targetLang of toLanguages) {
      // This would be where you call an actual translation API for each language
      translations[targetLang] = `${text} [Traduzido de ${fromLanguage} para ${targetLang}]`;
    }
    
    // Update user's credits (increment used_credits by the number of translations)
    const { error: updateError } = await supabaseClient
      .from('credits')
      .update({ 
        used_credits: credits.used_credits + requiredCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Error updating credits" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record the translations in the translations table (one entry per language)
    for (const targetLang of toLanguages) {
      const { error: translationError } = await supabaseClient
        .from('translations')
        .insert({
          user_id: user.id,
          menu_id: menuId || "00000000-0000-0000-0000-000000000000", // Would be a real menu_id in production
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
    
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
