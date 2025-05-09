
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
    const { credits, price, userId, productName } = await req.json();
    
    if (!credits || !price || !userId || userId !== user.id) {
      throw new Error('Parâmetros inválidos');
    }
    
    // Check if STRIPE_SECRET_KEY is available
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error('Chave Stripe não configurada. Entre em contato com o administrador');
    }
    
    // Initialize Stripe with more detailed error handling
    let stripe;
    try {
      stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
      });
    } catch (stripeInitError) {
      console.error("Error initializing Stripe:", stripeInitError);
      throw new Error('Erro ao inicializar Stripe. Verifique a configuração');
    }
    
    // Create a new checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: productName,
              },
              unit_amount: Math.round(price),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/seu-cardapio?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/seu-cardapio?payment=canceled`,
        metadata: {
          userId: userId,
          credits: credits.toString(),
        },
      });

      // Store the payment intent in the database for later verification
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { error: insertError } = await supabaseAdmin
        .from("payment_intents")
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          amount: price / 100, // Store in actual currency amount
          credits: credits,
          status: "pending",
        });

      if (insertError) {
        console.error("Error storing payment intent:", insertError);
        // Continue even if there's an error storing the intent, as we can verify it later
      }

      // Return the session URL for redirection
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      console.error("Stripe checkout creation error:", stripeError);
      if (stripeError.type === 'StripeAuthenticationError') {
        throw new Error('Erro de autenticação Stripe: chave secreta inválida');
      } else {
        throw new Error(`Erro ao criar checkout: ${stripeError.message}`);
      }
    }
  } catch (error) {
    console.error("Error in create-payment function:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido ao criar sessão de pagamento",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
