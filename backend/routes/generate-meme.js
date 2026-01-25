/**
 * Meme Generation API
 *
 * This module provides endpoints for generating memes using AI
 */

import { memeService } from "../services/memeService.js";

/**
 * Generate a meme using AI
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function generateMeme(req, res) {
  try {
    const { prompt, negative_prompt = "", size = "1024x1024" } = req.body;

    // Generate meme using the meme service
    const memeResult = await memeService.generateMeme({
      prompt,
      negative_prompt,
      size,
    });

    // Return success response with generated image URL
    res.json({
      success: true,
      imageUrl: memeResult.imageUrl,
      prompt: memeResult.prompt,
    });
  } catch (error) {
    console.error("Error generating meme:", error);

    // Custom error messages for common issues
    let errorMessage = "Failed to generate meme";
    let errorDetails = error.message;

    if (
      error.message.includes("502") ||
      error.message.includes("Bad Gateway")
    ) {
      errorMessage = "Volcengine API is temporarily unavailable";
      errorDetails =
        "The image generation service is currently experiencing issues (502 Bad Gateway). Please try again later.";
    } else if (error.message.includes("Missing Volcengine API keys")) {
      errorMessage = "API keys not configured";
      errorDetails =
        "The server is missing required Volcengine API keys. Please contact the administrator.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Image generation timed out";
      errorDetails =
        "The image generation process took too long. Please try again with a shorter prompt.";
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
    });
  }
}
