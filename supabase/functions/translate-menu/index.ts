
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
    const { text, fromLanguage, toLanguage } = await req.json();

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

    const availableCredits = credits.total_credits - credits.used_credits;
    if (availableCredits <= 0) {
      return new Response(JSON.stringify({ error: "Not enough credits" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // This would be where you call an actual translation API
    // For now, we'll simulate translation by appending "[Translated]" to the text
    const translatedText = `${text} [Traduzido de ${fromLanguage} para ${toLanguage}]`;
    
    // Update user's credits (increment used_credits)
    const { error: updateError } = await supabaseClient
      .from('credits')
      .update({ 
        used_credits: credits.used_credits + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Error updating credits" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record the translation in the translations table
    const { error: translationError } = await supabaseClient
      .from('translations')
      .insert({
        user_id: user.id,
        // Since we're not connected to a menu in this example, we would need to create a menu entry
        // or have a menu_id passed in the request. For this example, let's create a temporary menu.
        menu_id: "00000000-0000-0000-0000-000000000000", // Would be a real menu_id in production
        original_language: fromLanguage,
        target_language: toLanguage,
        original_content: text,
        translated_content: translatedText,
        status: 'completed'
      });

    if (translationError) {
      console.error("Error recording translation:", translationError);
      // We'll continue even if this fails - the user still gets their translation
    }

    // Return the translated text
    return new Response(JSON.stringify({ translatedText }), {
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
