
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

    // Perplexity Analysis
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
            content: `You are an expert technical interviewer providing real-time feedback for whiteboard challenges.
            
            For the "${section}" section, focus on these aspects:
            ${getSectionGuidance(section)}
            
            Provide concise, actionable feedback in 2-3 sentences that:
            1. Highlights what the candidate is doing well
            2. Suggests one specific improvement
            3. Relates directly to the current section's goals
            
            Keep responses under 100 words and be encouraging but direct.`
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
      JSON.stringify({ transcription, feedback }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Transcription and analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to get section-specific guidance
function getSectionGuidance(section: string): string {
  const guidance = {
    problem_discovery: `
      - Evaluate how well they ask clarifying questions
      - Check if they consider edge cases and constraints
      - Look for user-centric thinking in their approach`,
    problem_definition: `
      - Assess problem statement clarity and completeness
      - Check if they identify key requirements
      - Evaluate scope definition`,
    ideation: `
      - Look for diverse solution approaches
      - Evaluate technical feasibility considerations
      - Check for creative problem-solving`,
    prioritization: `
      - Assess decision-making framework
      - Check for clear evaluation criteria
      - Look for trade-off analysis`,
    user_flow_wireframe: `
      - Evaluate clarity of user journey
      - Check for completeness of key interactions
      - Look for user experience considerations`,
    final_wrap_up: `
      - Assess solution presentation clarity
      - Check for comprehensive coverage
      - Look for strong justification of decisions`
  };

  return guidance[section] || 'Provide general feedback on communication and problem-solving approach.';
}
