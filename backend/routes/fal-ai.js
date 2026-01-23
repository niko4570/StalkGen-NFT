/**
 * FAL AI API Integration
 * 
 * This module provides endpoints for using the FAL AI API to restyle images.
 * 
 * Required Environment Variables:
 * - FAL_API_TOKEN: Your FAL AI API key from https://fal.ai/dashboard/api-keys
 * 
 * Available Styles:
 * - 3D Render
 * - Cubism
 * - Oil Painting
 * - Anime
 * - Cartoon
 * - Coloring Book
 * - Retro Ad
 * - Pop Art Halftone
 * - Vector Art
 * - Story Board
 * - Art Nouveau
 * - Cross Etching
 * - Wood Cut
 * 
 * Example Usage:
 * POST /api/restyle-image
 * {
 *   "image_url": "https://example.com/image.jpg",
 *   "style": "3D Render"
 * }
 */

import { fal } from "@fal-ai/client";

/**
 * Restyle an image using the FAL AI API
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.image_url - URL of the image to restyle (required)
 * @param {string} req.body.style - Style to apply to the image (required)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function restyleImage(req, res) {
  try {
    const { image_url, style } = req.body;

    // Validate required parameters
    if (!image_url) {
      return res.status(400).json({
        error: "Image URL is required",
        details: "Please provide a valid URL to the image you want to restyle"
      });
    }

    if (!style) {
      return res.status(400).json({
        error: "Style is required",
        details: "Please provide a valid style from the available options",
        availableStyles: ["3D Render", "Cubism", "Oil Painting", "Anime", "Cartoon", "Coloring Book", "Retro Ad", "Pop Art Halftone", "Vector Art", "Story Board", "Art Nouveau", "Cross Etching", "Wood Cut"]
      });
    }

    // Validate FAL API token
    if (!process.env.FAL_API_TOKEN) {
      return res.status(401).json({
        error: "FAL API token is not set",
        details: "Please set the FAL_API_TOKEN environment variable with your FAL AI API key"
      });
    }

    console.log(`Using FAL_API_TOKEN: ${process.env.FAL_API_TOKEN ? "✓" : "✗"}`);

    // Configure the FAL client with the API key
    fal.config({
      credentials: process.env.FAL_API_TOKEN,
    });

    // Call the FAL API to restyle the image
    console.log("Restyling image with style:", style);
    console.log("Image URL:", image_url);

    try {
      const result = await fal.subscribe("bria/fibo-edit/restyle", {
        input: {
          image_url: image_url,
          style: style,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs?.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log("FAL API result:", result);

      // Check if the result is valid
      if (!result?.data?.image?.url) {
        throw new Error("Unexpected output format from FAL API");
      }

      console.log("Image restyled successfully:", result.data.image.url);

      // Return the restyled image URL
      res.json({
        success: true,
        imageUrl: result.data.image.url,
        imageDetails: result.data.image,
        message: "Image restyled successfully!"
      });
    } catch (falError) {
      console.error("FAL API error:", falError);
      
      // Handle specific FAL API errors
      if (falError.status === 403 && falError.body?.detail?.includes("Exhausted balance")) {
        return res.status(403).json({
          error: "FAL API balance exhausted",
          details: "Your FAL AI account balance is exhausted. Please top up your balance at https://fal.ai/dashboard/billing",
          action: "Top up your FAL AI account balance"
        });
      }

      if (falError.status === 401) {
        return res.status(401).json({
          error: "Invalid FAL API token",
          details: "Your FAL_API_TOKEN is invalid or expired. Please check your API key at https://fal.ai/dashboard/api-keys",
          action: "Update your FAL_API_TOKEN with a valid API key"
        });
      }

      // Generic FAL API error
      return res.status(500).json({
        error: "FAL API error",
        details: falError.message || "An error occurred while using the FAL AI API",
        action: "Check your FAL AI account status and try again"
      });
    }
  } catch (error) {
    console.error("Error restyling image:", error);
    res.status(500).json({
      error: "Failed to restyle image",
      details: error.message || "An unexpected error occurred",
      action: "Check the server logs for more details"
    });
  }
}

/**
 * Test the FAL AI API integration
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function testFalAi(req, res) {
  try {
    console.log("Testing FAL AI API...");
    console.log(`FAL_API_TOKEN loaded: ${!!process.env.FAL_API_TOKEN}`);

    // Validate FAL API token
    if (!process.env.FAL_API_TOKEN) {
      return res.status(401).json({
        error: "FAL API token is not set",
        details: "Please set the FAL_API_TOKEN environment variable with your FAL AI API key",
        action: "Set FAL_API_TOKEN in your .env file"
      });
    }

    // Configure the FAL client with the API key
    fal.config({
      credentials: process.env.FAL_API_TOKEN,
    });

    // Use a test image URL for the test
    const testImageUrl = "https://bria-datasets.s3.us-east-1.amazonaws.com/Liza/high_camera_angle_warm_filter.png";
    const testStyle = "3D Render";

    console.log("Testing with image:", testImageUrl);
    console.log("Testing with style:", testStyle);

    try {
      // Call the FAL API to restyle the image
      const result = await fal.subscribe("bria/fibo-edit/restyle", {
        input: {
          image_url: testImageUrl,
          style: testStyle,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs?.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log("FAL API test result:", result);

      // Check if the result is valid
      if (!result?.data?.image?.url) {
        throw new Error("Unexpected output format from FAL API");
      }

      console.log("Test completed successfully:", result.data.image.url);

      // Return the test result
      res.json({
        success: true,
        imageUrl: result.data.image.url,
        imageDetails: result.data.image,
        message: "FAL AI API test completed successfully!",
        details: "The FAL AI API integration is working correctly"
      });
    } catch (falError) {
      console.error("FAL API test error:", falError);
      
      // Handle specific FAL API errors
      if (falError.status === 403 && falError.body?.detail?.includes("Exhausted balance")) {
        return res.status(403).json({
          error: "FAL API balance exhausted",
          details: "Your FAL AI account balance is exhausted. Please top up your balance at https://fal.ai/dashboard/billing",
          action: "Top up your FAL AI account balance",
          integrationStatus: "Working (but needs balance)"
        });
      }

      if (falError.status === 401) {
        return res.status(401).json({
          error: "Invalid FAL API token",
          details: "Your FAL_API_TOKEN is invalid or expired. Please check your API key at https://fal.ai/dashboard/api-keys",
          action: "Update your FAL_API_TOKEN with a valid API key",
          integrationStatus: "Not working (invalid token)"
        });
      }

      // Generic FAL API error
      return res.status(500).json({
        error: "FAL API error",
        details: falError.message || "An error occurred while testing the FAL AI API",
        action: "Check your FAL AI account status and try again",
        integrationStatus: "Not working (API error)"
      });
    }
  } catch (error) {
    console.error("Error testing FAL AI API:", error);
    res.status(500).json({
      error: "Failed to test FAL AI API",
      details: error.message || "An unexpected error occurred",
      action: "Check the server logs for more details",
      integrationStatus: "Not working (server error)"
    });
  }
}

/**
 * Get available styles for image restyling
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function getAvailableStyles(req, res) {
  try {
    const availableStyles = [
      "3D Render",
      "Cubism",
      "Oil Painting",
      "Anime",
      "Cartoon",
      "Coloring Book",
      "Retro Ad",
      "Pop Art Halftone",
      "Vector Art",
      "Story Board",
      "Art Nouveau",
      "Cross Etching",
      "Wood Cut"
    ];

    res.json({
      success: true,
      styles: availableStyles,
      count: availableStyles.length,
      message: "Available styles retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting available styles:", error);
    res.status(500).json({
      error: "Failed to get available styles",
      details: error.message || "An unexpected error occurred"
    });
  }
}
