
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// OpenAI API Key from Supabase Secrets
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { audio, section, sessionContext, isQuestion } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    console.log(`Received audio data for section: ${section}`)

    // Convert base64 to audio file for OpenAI
    const audioData = Uint8Array.from(atob(audio), c => c.charCodeAt(0))
    const audioFile = new File([audioData], "audio.webm", { type: "audio/webm" })

    // Create form data for OpenAI API
    const formData = new FormData()
    formData.append("file", audioFile)
    formData.append("model", "whisper-1")
    
    console.log("Sending request to OpenAI Whisper API")
    
    // Send to OpenAI for transcription
    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    })
    
    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error(`OpenAI API error: ${errorText}`)
      throw new Error(`OpenAI API error: ${transcriptionResponse.status}`)
    }
    
    const transcriptionResult = await transcriptionResponse.json()
    const transcription = transcriptionResult.text
    console.log("Transcription received:", transcription)

    // Only proceed with AI response if we have a transcription and it's marked as a question
    if (transcription && transcription.trim()) {
      // Determine if this is a question that needs immediate response
      if (isQuestion) {
        // Generate an immediate conversational response
        const conversationPrompt = `
          You are an interviewer for a whiteboard design interview. The candidate is currently in the "${section}" section of their interview.
          ${sessionContext ? `Context about this session: ${sessionContext}` : ''}
          
          The candidate just said or asked: "${transcription}"
          
          Please respond naturally as if you are the interviewer in the session. Be concise but helpful, and stay in character as an interviewer.
          Your response should be conversational and direct, as if you're speaking to the candidate.
        `

        // Get response from OpenAI
        const responseData = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a helpful design interview coach providing concise, conversational responses." },
              { role: "user", content: conversationPrompt }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        })
        
        if (!responseData.ok) {
          const errorText = await responseData.text()
          console.error(`OpenAI response API error: ${errorText}`)
          throw new Error(`OpenAI response API error: ${responseData.status}`)
        }
        
        const aiResponse = await responseData.json()
        const response = aiResponse.choices[0].message.content
        console.log("AI response generated:", response)
        
        return new Response(JSON.stringify({ 
          transcription, 
          aiResponse: response 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      } else {
        // Generate analytical feedback for user's statement
        const feedbackPrompt = `
          The user is practicing a whiteboard design interview. They are in the "${section}" section.
          Based on the following transcription of what they said, provide brief, constructive feedback
          on their approach and communication. Keep it focused on improving their interview performance.
          
          Transcription: "${transcription}"
          
          Provide your feedback in 2-3 sentences maximum.
        `

        // Get feedback from OpenAI
        const feedbackResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a helpful design interview coach providing concise feedback." },
              { role: "user", content: feedbackPrompt }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        })
        
        if (!feedbackResponse.ok) {
          const errorText = await feedbackResponse.text()
          console.error(`OpenAI feedback API error: ${errorText}`)
          throw new Error(`OpenAI feedback API error: ${feedbackResponse.status}`)
        }
        
        const feedbackResult = await feedbackResponse.json()
        const feedback = feedbackResult.choices[0].message.content
        console.log("Feedback received:", feedback)
        
        return new Response(JSON.stringify({ 
          transcription, 
          feedback 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }
    } else {
      // If no transcription, just return the empty transcription
      return new Response(JSON.stringify({ 
        transcription: transcription || "",
        feedback: "" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }
    
  } catch (error) {
    console.error("Error:", error.message)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
