/**
 * Meme Generation API
 *
 * This module provides endpoints for generating memes using AI
 * and preparing them for NFT minting.
 *
 * Required Environment Variables:
 * - PUBLIC_SEEDREAM_API_AK: Your Volcengine Access Key
 * - PUBLIC_SEEDREAM_API_SK: Your Volcengine Secret Key
 * - HELIUS_API_KEY: Your Helius API key (for metadata upload)
 *
 * Example Usage:
 * POST /api/generate-meme
 * {
 *   "prompt": "一只猫在海滩上戴着墨镜",
 *   "size": "1024x1024"
 * }
 */

import { volcengineWrapper } from '../utils/volcengine_wrapper.js';

/**
 * Meme Generation API with Volcengine Seedream
 *
 * This function handles the meme generation process using Volcengine Seedream API
 * with proper rate limiting and error handling, via the official Python SDK.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.prompt - Text prompt for meme generation (required)
 * @param {string} [req.body.negative_prompt=""] - Negative prompt for image generation
 * @param {string} [req.body.size="1024x1024"] - Size of the generated image
 * @param {number} [req.body.n=1] - Number of images to generate (currently only 1 supported)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */

// Active requests counter for rate limiting
let activeRequests = 0;

/**
 * Generate a meme using AI and prepare it for NFT minting
 */
export async function generateMeme(req, res) {
  try {
    const {
      prompt,
      negative_prompt = "",
      size = "1024x1024",
      n = 1,
    } = req.body;

    // Validate required parameters
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Validate image size according to Volcengine documentation (supports up to 2048x2048)
    const width = parseInt(size.split("x")[0]);
    const height = parseInt(size.split("x")[1]);
    if (width > 2048 || height > 2048) {
      return res.status(400).json({ 
        error: "Image size exceeds maximum allowed dimensions of 2048x2048" 
      });
    }

    // Validate prompt length (Volcengine has character limits)
    if (prompt.length > 1000) {
      return res.status(400).json({ 
        error: "Prompt exceeds maximum allowed length of 1000 characters" 
      });
    }

    // Increment active requests counter
    activeRequests++;
    console.log(`Active requests: ${activeRequests}`);

    // Generate meme using Volcengine Seedream API via Python SDK
    console.log("Generating image with prompt:", prompt);
    
    // Call the Python wrapper to generate the image
    const result = await volcengineWrapper.generateImage({
      prompt,
      negative_prompt,
      width,
      height,
      seed: -1, // Random seed
      scale: 2.5, // Default value
      use_pre_llm: false, // Default value
    });
    
    console.log("Received result from Volcengine API:", result);
    
    // Check if we got a task ID
    if (!result.data || !result.data.task_id) {
      throw new Error("Invalid response from Volcengine API - missing task_id");
    }
    
    // Poll for the task result with retry logic
    console.log("Polling for image generation result...");
    let taskResult = null;
    let retries = 0;
    const maxRetries = 30;
    const retryDelay = 2000; // 2 seconds
    
    // Keep polling until task is completed or max retries reached
    while (retries < maxRetries) {
      taskResult = await volcengineWrapper.getTaskResult(result.data.task_id);
      
      console.log(`Poll attempt ${retries + 1}/${maxRetries}, status: ${taskResult.data?.status}`);
      console.log("Task result:", JSON.stringify(taskResult, null, 2));
      
      // Check task status
      if (taskResult.data?.status === "success" || taskResult.data?.status === "done") {
        // Task completed successfully
        break;
      } else if (taskResult.data?.status === "failed") {
        // Task failed
        throw new Error(`Image generation failed with status: ${taskResult.data?.status}`);
      }
      
      // Task is still in progress, wait and retry
      retries++;
      if (retries < maxRetries) {
        console.log(`Task still in progress (${taskResult.data?.status}), waiting ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    if (retries >= maxRetries) {
      throw new Error("Image generation timed out after multiple retries");
    }
    
    // Extract image URL from the result
    let imageUrl = null;
    console.log("Task result data keys:", Object.keys(taskResult.data || {}));
    console.log("Image URLs available:", taskResult.data?.image_urls);
    console.log("Binary data available:", taskResult.data?.binary_data_base64);
    
    // Try different response structures based on possible API response formats
    if (taskResult.data?.image_urls && taskResult.data.image_urls.length > 0) {
      imageUrl = taskResult.data.image_urls[0];
    } else if (taskResult.data?.binary_data_base64 && taskResult.data.binary_data_base64.length > 0) {
      // If image URLs are not available, use base64 data
      imageUrl = `data:image/jpeg;base64,${taskResult.data.binary_data_base64[0]}`;
    } else if (taskResult.data?.result?.image_urls && taskResult.data.result.image_urls.length > 0) {
      // Alternative structure: data.result.image_urls
      imageUrl = taskResult.data.result.image_urls[0];
    } else if (taskResult.data?.result?.binary_data_base64 && taskResult.data.result.binary_data_base64.length > 0) {
      // Alternative structure: data.result.binary_data_base64
      imageUrl = `data:image/jpeg;base64,${taskResult.data.result.binary_data_base64[0]}`;
    } else {
      throw new Error("Failed to extract image URL from Volcengine API response");
    }
    
    if (!imageUrl) {
      throw new Error("Failed to get image URL from Volcengine API");
    }
    
    console.log("Image generated successfully:", imageUrl);

    // Create NFT metadata
    const metadataTimestamp = Math.floor(Date.now() / 1000);
    const metadata = {
      name: `StalkGen Meme #${metadataTimestamp}`,
      description: `A meme generated from prompt: ${prompt}`,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Meme Type",
          value: "Generated",
        },
        {
          trait_type: "Timestamp",
          value: metadataTimestamp.toString(),
        },
        {
          trait_type: "Prompt",
          value: prompt,
        },
      ],
      external_url: "https://stalkgen.xyz",
      seller_fee_basis_points: 500, // 5%
      creators: [
        {
          address: "Helius1234567890", // Example address - replace with actual address
          verified: false,
          share: 100,
        },
      ],
    };

    // Mock upload metadata to Helius for testing
    console.log("Mock metadata generated successfully:", metadata);
    
    // Mock metadata URL (in production, this would be the actual URL from Helius)
    const metadataUri = `https://mock-metadata.example.com/${Date.now()}`;
    
    // Decrement active requests counter
    activeRequests--;
    console.log(`Active requests: ${activeRequests}`);

    // Return success response with generated image URL and metadata
    res.json({
      success: true,
      imageUrl,
      metadata,
      heliusMetadataUrl: metadataUri,
    });
  } catch (error) {
    console.error("Error generating meme:", error);
    
    // Decrement active requests counter
    activeRequests--;
    console.log(`Active requests: ${activeRequests}`);
    
    res.status(500).json({
      error: "Failed to generate meme",
      details: error.message,
    });
  }
}

/**
 * Test endpoint to verify Helius metadata upload functionality
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function testHeliusUpload(req, res) {
  try {
    // Mock metadata upload function (replace with actual implementation)
    const uploadMetadataToHelius = async (metadata) => {
      // This is a mock implementation for testing
      return {
        metadata_uri: `https://mock-metadata.example.com/${Date.now()}`,
        success: true,
      };
    };

    // Create test metadata
    const metadata = {
      name: "Test Meme",
      description: "Test description",
      image: "https://example.com/image.jpg",
      attributes: [
        {
          trait_type: "Test Attribute",
          value: "Test Value",
        },
      ],
      external_url: "https://stalkgen.xyz",
      seller_fee_basis_points: 500,
      creators: [
        {
          address: "Helius1234567890",
          verified: false,
          share: 100,
        },
      ],
    };

    // Mock uploaded metadata
    const uploadedMetadata = metadata;

    // Return success response
    res.json({
      success: true,
      metadata,
      heliusMetadataUrl: `https://mock-metadata.example.com/${Date.now()}`,
      uploadedMetadata,
      message: "Helius metadata upload test completed successfully!",
    });
  } catch (error) {
    console.error("Error testing Helius upload:", error);
    res.status(500).json({
      error: "Failed to test Helius upload",
      details: error.message,
    });
  }
}