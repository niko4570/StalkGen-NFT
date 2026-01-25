/**
 * Meme Generation Service
 * 
 * Encapsulates the core business logic for generating memes using AI
 */

import { getApiUrl } from '../lib/api-url';

interface GenerateMemeParams {
  prompt: string;
  negative_prompt?: string;
  size?: string;
}

interface GenerateMemeResult {
  success: boolean;
  imageUrl: string;
  prompt: string;
}

class MemeService {
  /**
   * Generate a meme using the backend API
   * @param params - Generation parameters
   * @returns {Promise<GenerateMemeResult>} Generated meme result
   */
  async generateMeme(params: GenerateMemeParams): Promise<GenerateMemeResult> {
    const {
      prompt,
      negative_prompt = "",
      size = "1024x1024"
    } = params;

    // Validate required parameters
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // 🔄 Dynamic URL selection based on context
    // - Client-side: Uses public URL from NEXT_PUBLIC_API_URL
    // - Server-side: Uses internal URL from API_INTERNAL_URL (private networking)
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/generate-meme`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        negative_prompt,
        width: parseInt(size.split("x")[0]),
        height: parseInt(size.split("x")[1]),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `${errorData.error || "API error"}: ${errorData.details || response.statusText}`
      );
    }

    const data = await response.json();
    
    // Validate response data
    if (!data.imageUrl) {
      throw new Error("Failed to get image URL from API response");
    }

    return data as GenerateMemeResult;
  }
}

export const memeService = new MemeService();
