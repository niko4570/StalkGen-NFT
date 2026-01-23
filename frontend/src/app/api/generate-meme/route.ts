import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithTongyi } from '@/lib/tongyi-image';

// Next.js API Route for generating memes with Tongyi Qianwen 3.0

interface GenerateMemeRequest {
  prompt: string;
  negative_prompt?: string;
  size?: string;
}

interface GenerateMemeResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  message?: string;
}

/**
 * Handle POST request for generating meme
 * @param request - Next.js request object
 * @returns Next.js response object
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: GenerateMemeRequest = await request.json();
    const { prompt, negative_prompt = '', size = '1024x1024' } = body;

    // Validate required parameters
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt is required and must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    // Validate size parameter
    const validSizes = ['512x512', '768x768', '1024x1024'];
    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid size. Valid sizes are: ${validSizes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Get AK/SK from environment variables
    const ak = process.env.TONGYI_AK;
    const sk = process.env.TONGYI_SK;

    if (!ak || !sk) {
      // For development/testing, return mock image
      return NextResponse.json(
        {
          success: true,
          imageUrl: `https://neeko-copilot.bytedance.net/api/text2image?prompt=${encodeURIComponent(prompt)}&size=${size}`,
          message: 'Using mock image for development (TONGYI_AK/SK not set)'
        },
        { status: 200 }
      );
    }

    // Generate image using Tongyi API
    const imageUrl = await generateImageWithTongyi({
      prompt,
      negative_prompt,
      size,
      ak,
      sk,
      timeout: 60000, // 1 minute timeout
      onProgress: (status, progress) => {
        console.log(`Image generation progress: ${progress}% - ${status}`);
      }
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        imageUrl
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );

  } catch (error) {
    console.error('Generate meme error:', error);

    // Handle different error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON format in request body' 
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate meme'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

/**
 * Handle OPTIONS request for CORS
 * @param request - Next.js request object
 * @returns NextResponse with CORS headers
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400' // 24 hours
      }
    }
  );
}

/**
 * Handle GET request (health check)
 * @returns NextResponse with health check status
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: true,
      message: 'Meme generation API is ready',
      timestamp: new Date().toISOString()
    },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
