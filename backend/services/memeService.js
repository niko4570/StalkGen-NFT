/**
 * Meme Generation Service
 *
 * Encapsulates the core business logic for generating memes using AI
 */

import { volcengineWrapper } from "../utils/volcengine_wrapper.js";
import { config } from "../config/config.js";

class MemeService {
  constructor() {
    this.activeRequests = 0;
    this.volcengineWrapper = volcengineWrapper;
  }

  /**
   * Validate meme generation parameters
   * @param {Object} params - Generation parameters
   * @returns {Object} Validated parameters
   */
  validateParameters(params) {
    const {
      prompt,
      negative_prompt = "",
      size = config.memeGeneration.defaultSize,
      n = 1,
    } = params;

    // Validate required parameters
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Validate image size according to Volcengine documentation (min 1024x1024)
    let width = parseInt(size.split("x")[0]);
    let height = parseInt(size.split("x")[1]);

    // Ensure minimum size is 1024x1024 as per new documentation
    width = Math.max(width, 1024);
    height = Math.max(height, 1024);

    // Validate against maximum size
    if (
      width > config.memeGeneration.maxWidth ||
      height > config.memeGeneration.maxHeight
    ) {
      throw new Error(
        `Image size exceeds maximum allowed dimensions of ${config.memeGeneration.maxWidth}x${config.memeGeneration.maxHeight}`,
      );
    }

    // Validate prompt length (Volcengine has character limits)
    if (prompt.length > config.memeGeneration.maxPromptLength) {
      throw new Error(
        `Prompt exceeds maximum allowed length of ${config.memeGeneration.maxPromptLength} characters`,
      );
    }

    // Validate number of images (max 15 as per new documentation)
    const numImages = Math.min(n, config.memeGeneration.maxImagesPerRequest);

    return { prompt, negative_prompt, width, height, n: numImages };
  }

  /**
   * Generate meme using Volcengine Jimeng 4.0 API
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generated image data
   */
  async generateMeme(params) {
    const validatedParams = this.validateParameters(params);

    this.activeRequests++;
    console.log(`Active requests: ${this.activeRequests}`);

    try {
      // Generate meme using Volcengine Jimeng 4.0 API
      console.log("Generating image with prompt:", validatedParams.prompt);

      // Call the Volcengine wrapper to generate the image
      const result = await this.volcengineWrapper.generateImage({
        prompt: validatedParams.prompt,
        width: validatedParams.width,
        height: validatedParams.height,
      });

      console.log("Received result from Volcengine API:", result);

      // Extract image URL from the result
      let imageUrl = null;

      // Try different response structures to extract image URL
      if (result.image_urls && result.image_urls.length > 0) {
        imageUrl = result.image_urls[0];
      } else if (
        result.result?.image_urls &&
        result.result.image_urls.length > 0
      ) {
        imageUrl = result.result.image_urls[0];
      } else if (
        result.binary_data_base64 &&
        result.binary_data_base64.length > 0
      ) {
        // If image URLs are not available, use base64 data
        imageUrl = `data:image/jpeg;base64,${result.binary_data_base64[0]}`;
      }

      if (!imageUrl) {
        throw new Error(
          "Failed to extract image URL from Volcengine API response",
        );
      }

      console.log("Image generated successfully:", imageUrl);
      return { imageUrl, prompt: validatedParams.prompt };
    } finally {
      this.activeRequests--;
      console.log(`Active requests: ${this.activeRequests}`);
    }
  }
}

export const memeService = new MemeService();
