
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
          // Each language counts as 1 credit
          const requiredCredits = toLanguages.length;
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
      // Each language counts as 1 credit
      const requiredCredits = toLanguages.length;
      const availableCredits = credits.total_credits - credits.used_credits;
      
      if (availableCredits < requiredCredits) {
        return new Response(JSON.stringify({ error: "Not enough credits" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate translations for each language
    const translations: Record<string, string> = {};
    
    for (const targetLang of toLanguages) {
      // This would be where you call an actual translation API for each language
      translations[targetLang] = `${text} [Traduzido de ${fromLanguage} para ${targetLang}]`;
    }
    
    // Update user's credits using the admin client (bypassing RLS)
    const { error: updateError } = await supabaseAdmin
      .from('credits')
      .update({
        used_credits: supabaseAdmin.rpc('get_current_credits', { user_id_param: user.id }) + toLanguages.length,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      // Continue anyway - user still gets the translation
    }

    // Record the translations in the translations table (one entry per language)
    for (const targetLang of toLanguages) {
      const { error: translationError } = await supabaseAdmin
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
    
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
