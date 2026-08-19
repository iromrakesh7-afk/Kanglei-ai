import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[v0] ===== IMAGE GENERATION API CALLED =====')
  
  try {
    // Check authentication
    console.log('[v0] Checking authentication...')
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      console.error('[v0] Authentication failed - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[v0] Authenticated user:', session.user.email)

    // Parse request body
    console.log('[v0] Parsing request body...')
    const { prompt, conversationId, model = 'nvidia/Picasso' } = await request.json()
    console.log('[v0] Prompt:', prompt)
    console.log('[v0] Model:', model)

    if (!prompt || !prompt.trim()) {
      console.error('[v0] Empty prompt provided')
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Check for API key
    console.log('[v0] Checking for NVIDIA_API_KEY_2...')
    const nvidiaApiKey = process.env.NVIDIA_API_KEY_2
    if (!nvidiaApiKey) {
      console.error('[v0] ERROR: NVIDIA_API_KEY_2 not set in environment')
      return NextResponse.json(
        {
          error: 'API key not configured',
          details: 'NVIDIA_API_KEY_2 environment variable is missing',
        },
        { status: 503 }
      )
    }
    console.log('[v0] API Key found (length:', nvidiaApiKey.length, ')')

    // Prepare API call
    const endpoint = 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/0e2e098b-6f56-4c72-9c4e-00acb3b4c0cb'
    const requestBody = {
      prompt: prompt,
      model: model,
      quality: 'standard',
      num_images: 1,
    }
    console.log('[v0] Calling NVIDIA endpoint:', endpoint)
    console.log('[v0] Request body:', JSON.stringify(requestBody))

    // Make API call
    console.log('[v0] Sending request to NVIDIA API...')
    const imageResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nvidiaApiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('[v0] Response status:', imageResponse.status)

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('[v0] ERROR: NVIDIA API returned status', imageResponse.status)
      console.error('[v0] Error response:', errorText.substring(0, 500))
      return NextResponse.json(
        {
          error: 'NVIDIA API Error',
          status: imageResponse.status,
          message: errorText.substring(0, 200),
        },
        { status: imageResponse.status }
      )
    }

    // Parse response
    console.log('[v0] Parsing NVIDIA response...')
    const responseText = await imageResponse.text()
    console.log('[v0] Response text length:', responseText.length)
    console.log('[v0] Response preview:', responseText.substring(0, 200))

    let imageData
    try {
      imageData = JSON.parse(responseText)
      console.log('[v0] Successfully parsed as JSON')
      console.log('[v0] Response keys:', Object.keys(imageData))
      console.log('[v0] Full response:', JSON.stringify(imageData).substring(0, 500))
    } catch (parseError) {
      console.error('[v0] Failed to parse response as JSON')
      // Maybe response is a base64 image or data URL
      if (responseText.startsWith('data:') || responseText.startsWith('/9j')) {
        console.log('[v0] Response appears to be image data, using directly')
        imageData = { image: responseText }
      } else {
        throw new Error(`Cannot parse response: ${responseText.substring(0, 100)}`)
      }
    }

    // Extract image
    console.log('[v0] Extracting image from response...')
    let imageUrl = null
    
    if (imageData?.images?.[0]) {
      imageUrl = imageData.images[0]
      console.log('[v0] Found image in images[0]')
    } else if (imageData?.image) {
      imageUrl = imageData.image
      console.log('[v0] Found image in .image field')
    } else if (imageData?.data?.[0]) {
      imageUrl = imageData.data[0]
      console.log('[v0] Found image in data[0]')
    } else if (imageData?.data?.[0]?.url) {
      imageUrl = imageData.data[0].url
      console.log('[v0] Found image in data[0].url')
    } else if (typeof imageData === 'string') {
      imageUrl = imageData
      console.log('[v0] Using entire response as image')
    }

    if (!imageUrl) {
      console.error('[v0] Could not find image in response')
      console.error('[v0] Response structure:', JSON.stringify(imageData))
      return NextResponse.json(
        {
          error: 'No image in response',
          received: JSON.stringify(imageData).substring(0, 200),
        },
        { status: 500 }
      )
    }

    console.log('[v0] Image URL found (length:', imageUrl.length, ')')
    console.log('[v0] SUCCESS: Returning image')
    console.log('[v0] ===== IMAGE GENERATION COMPLETE =====')

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      model: model,
    })
  } catch (error) {
    console.error('[v0] ===== IMAGE GENERATION FAILED =====')
    console.error('[v0] Error:', error)
    const message = error instanceof Error ? error.message : String(error)
    console.error('[v0] Error message:', message)
    
    return NextResponse.json(
      {
        error: 'Image generation failed',
        message: message,
      },
      { status: 500 }
    )
  }
}
