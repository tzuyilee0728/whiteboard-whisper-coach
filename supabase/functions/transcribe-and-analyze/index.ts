
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log(`Received audio data for section: ${section}`);
    
    // Convert base64 to binary
    const binaryAudio = processBase64Chunks(audio);
    
    // Create blob for OpenAI API with explicit mime type
    const audioBlob = new Blob([binaryAudio], { type: 'audio/webm;codecs=opus' });
    
    // OpenAI Whisper Transcription
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    console.log("Sending request to OpenAI Whisper API");
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    const transcriptionResponseText = await transcriptionResponse.text();

    if (!transcriptionResponse.ok) {
      console.error("OpenAI API error:", transcriptionResponseText);
      
      // Try to parse the error message
      try {
        const errorJson = JSON.parse(transcriptionResponseText);
        return new Response(
          JSON.stringify({ 
            error: errorJson.error?.message || 'Failed to transcribe audio' 
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ error: `Failed to transcribe audio: ${transcriptionResponseText}` }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    }

    // Parse the transcription response
    const transcriptionData = JSON.parse(transcriptionResponseText);
    console.log("Transcription received:", transcriptionData.text);

    // Only get feedback if we have text and a section
    let feedback = "";
    if (transcriptionData.text && transcriptionData.text.trim() && section) {
      try {
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
                content: transcriptionData.text
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          feedback = perplexityData.choices[0]?.message?.content || '';
          console.log("Feedback received:", feedback);
        } else {
          console.error("Perplexity API error:", await perplexityResponse.text());
        }
      } catch (feedbackError) {
        console.error("Error getting feedback:", feedbackError);
        // We don't throw here, as we still want to return the transcription
      }
    }

    return new Response(
      JSON.stringify({ 
        transcription: transcriptionData.text, 
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
