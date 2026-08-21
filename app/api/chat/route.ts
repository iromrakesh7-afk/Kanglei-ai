import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    console.log('[v0] Chat API called')
    
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { messages, model = 'groq/llama-3.3-70b-versatile', language = 'en', useSearch = false } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Please ask a question before sending.' }, { status: 400 })
    }

    const safeMessages = messages
      .filter((msg: any) =>
        (msg?.role === 'user' || msg?.role === 'assistant') &&
        typeof msg?.content === 'string' &&
        msg.content.trim().length > 0
      )
      .slice(-20)

    if (safeMessages.length === 0 || !safeMessages.some((msg: any) => msg.role === 'user')) {
      return Response.json({ error: 'Please enter a valid question.' }, { status: 400 })
    }

    // Keep the provider model fixed and known-good instead of trusting client input.
    const groqModel = 'llama-3.3-70b-versatile'
    console.log('[v0] Using Groq model:', groqModel)
    console.log('[v0] Language:', language)
    const groqApiKeys = [
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
    ].filter((key): key is string => Boolean(key?.trim()))

    if (groqApiKeys.length === 0) {
      return Response.json(
        { error: 'No Groq API key is configured.' },
        { status: 500 },
      )
    }

    console.log('[v0] Groq API keys available:', groqApiKeys.length)

    let systemPrompt: string

    if (language === 'meiteilon') {
      // Meiteilon Kanglei - responds with English words followed by Manipuri pronunciation ONLY
      systemPrompt = `You are Kanglei AI, a Meiteilon (Manipuri) assistant founded by Rakesh Irom.
RESPONSE FORMAT - CRITICAL:
1. Write content in English words only
2. Put Manipuri pronunciation in parentheses after each English word - MANIPURI SCRIPT ONLY
3. NEVER include English pronunciation like (ay, ee, pee) - ONLY use Manipuri Meetei Mayek script
4. Example format ONLY: "Hello (হ্যালো) world (ওয়ার্ল্ড)"
5. Do NOT use English phonetic spelling or Roman transliteration - use ONLY Manipuri Meetei Mayek script
6. Answer the user's question completely in English with Manipuri script pronunciation

Format examples (CORRECT):
- "Artificial (কৃত্রিম) intelligence (বুদ্ধিমত্তা)"
- "Machine (মেশিন) learning (লার্নিং)"

Format examples (WRONG - NEVER do this):
- "Artificial (ar-ti-fi-shuul)" - NO English phonetics
- "Hello (huh-lo)" - NO English pronunciation
- Use ONLY Manipuri Meetei Mayek script in parentheses`
    } else {
      // English versions (Kanglei Lite, Pro, Ultra)
      systemPrompt = useSearch
        ? `You are Kanglei AI, a powerful artificial intelligence assistant founded by Rakesh Irom. 
You have access to real-time web search capabilities to provide the most current and accurate information.
Help users with their queries, research, coding, writing, analysis, and much more.
When the user asks about current events or recent information, use your search capabilities.`
        : `You are Kanglei AI, a powerful artificial intelligence assistant founded by Rakesh Irom.
You are as capable as ChatGPT, Gemini, Claude, and Perplexity combined.
Help users with their queries, research, coding, writing, analysis, creative tasks, and much more.`
    }

    // Try each configured key so one exhausted or revoked key does not break chat.
    let result
    let lastError: unknown

    for (const apiKey of groqApiKeys) {
      try {
        result = await generateText({
          model: groq(groqModel, { apiKey }),
          system: systemPrompt,
          messages: safeMessages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
        })
        break
      } catch (error) {
        lastError = error
        console.error('[v0] Groq key failed; trying next key:', error instanceof Error ? error.message : error)
      }
    }

    if (!result) {
      throw lastError ?? new Error('All Groq API keys failed')
    }

    return Response.json({
      content: result.text,
      model,
      usage: {
        inputTokens: result.usage?.inputTokens || 0,
        outputTokens: result.usage?.outputTokens || 0,
      },
    })
  } catch (error: any) {
    console.error('[v0] Chat API error:', error?.message || error)
    console.error('[v0] Error data:', error?.data || error)
    
    // Check if it's an API key issue
    const errorMsg = error?.message?.toLowerCase() || ''
    const errorCode = error?.statusCode || error?.code
    
    if (errorMsg.includes('api key') || errorMsg.includes('authentication') || errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
      console.error('[v0] API Key Issue - GROQ_API_KEY might not be set or invalid')
      return Response.json(
        { 
          error: 'All configured Groq API keys failed. Please check GROQ_API_KEY, GROQ_API_KEY_2, and GROQ_API_KEY_3.',
          details: 'The server tried each configured Groq key and none could complete the request.'
        },
        { status: 500 }
      )
    }
    
    if (errorMsg.includes('model') || errorCode === 404) {
      console.error('[v0] Model not found on Groq API')
      return Response.json(
        { error: 'The selected model is not available. Please select a different Groq model.' },
        { status: 500 }
      )
    }
    
    return Response.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
