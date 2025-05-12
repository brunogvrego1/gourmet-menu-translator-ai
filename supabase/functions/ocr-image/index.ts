
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get image data from request
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    console.log('Received image data, sending to Deepseek API...');
    
    // Call Deepseek API for OCR
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('Deepseek API key not found in environment');
    }

    // Prepare the request to Deepseek API
    const response = await fetch('https://api.deepseek.com/v1/vision/ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64.split(',')[1], // Remove the data URL prefix if present
        tasks: ['ocr'],
        config: {
          language: 'por+eng', // Support both Portuguese and English
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Deepseek API error:', errorData);
      throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OCR successful, returning text...');
    
    // Extract and return the OCR text
    const extractedText = data.text || '';

    return new Response(
      JSON.stringify({ text: extractedText }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in OCR process:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
