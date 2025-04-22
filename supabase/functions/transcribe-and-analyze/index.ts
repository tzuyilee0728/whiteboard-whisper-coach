
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.24.4";
import { processBase64Chunks } from "./utils.ts";

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

    // Convert base64 to binary
    const binaryAudio = processBase64Chunks(audio);
    
    // Create blob for OpenAI API
    const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
    
    // OpenAI Whisper Transcription
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const transcription = await transcriptionResponse.json();

    // Perplexity AI Feedback based on transcription
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
            content: transcription.text
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
        transcription: transcription.text, 
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
