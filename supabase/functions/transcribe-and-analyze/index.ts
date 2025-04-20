
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.24.4";
import Replicate from "https://esm.sh/replicate@0.25.2";

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
    const { audio, section } = await req.json();

    // Convert ArrayBuffer to base64
    const base64Audio = btoa(
      String.fromCharCode.apply(null, new Uint8Array(audio))
    );

    // OpenAI Whisper Transcription
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: new File([base64Audio], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1'
    });

    const transcription = transcriptionResponse.text;

    // Perplexity AI Feedback
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant providing real-time feedback on a whiteboard challenge. 
            The current section is ${section}. 
            Provide concise, constructive feedback based on the user's transcribed speech.`
          },
          {
            role: 'user',
            content: transcription
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    const perplexityData = await perplexityResponse.json();
    const feedback = perplexityData.choices[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ 
        transcription, 
        feedback 
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Transcription and analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
