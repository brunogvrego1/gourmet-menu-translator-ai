
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the auth token from the request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado: cabeçalho de autorização ausente');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    
    // Get the user from the auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Não autorizado: usuário não autenticado');
    }

    // Parse the request body
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error('ID da sessão não fornecido');
    }
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Initialize Supabase admin client for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the payment intent from our database
    const { data: paymentIntent, error: paymentIntentError } = await supabaseAdmin
      .from("payment_intents")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (paymentIntentError || !paymentIntent) {
      throw new Error('Pagamento não encontrado');
    }

    // Check if this payment has been processed already
    if (paymentIntent.status === 'completed') {
      return new Response(
        JSON.stringify({ status: 'already_processed', message: 'Este pagamento já foi processado' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Verify that the user requesting verification is the same who made the payment
    if (paymentIntent.user_id !== user.id) {
      throw new Error('Você não está autorizado a verificar este pagamento');
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      // Update our database with the current status
      await supabaseAdmin
        .from("payment_intents")
        .update({ 
          status: session.payment_status,
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          status: session.payment_status,
          message: 'Pagamento ainda não completado' 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If we get here, payment was successful
    // Get user's current credits
    const { data: creditData, error: creditError } = await supabaseAdmin
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditError) {
      throw new Error('Erro ao buscar informações de créditos do usuário');
    }

    // Add the purchased credits to the user's account
    const newTotalCredits = creditData.total_credits + paymentIntent.credits;
    
    const { error: updateError } = await supabaseAdmin
      .from("credits")
      .update({ 
        total_credits: newTotalCredits,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error('Erro ao adicionar créditos à conta do usuário');
    }

    // Update payment intent status
    const { error: updateIntentError } = await supabaseAdmin
      .from("payment_intents")
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", sessionId);

    if (updateIntentError) {
      console.error("Error updating payment intent:", updateIntentError);
      // Continue even if there's an error updating the intent
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${paymentIntent.credits} créditos adicionados com sucesso`,
        credits: {
          total: newTotalCredits,
          added: paymentIntent.credits
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in verify-payment function:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido ao verificar pagamento",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
