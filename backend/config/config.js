/**
 * Configuration Management
 *
 * Centralized configuration handling for the backend application
 * - In development: Uses dotenv to load from .env files
 * - In production (Vercel): Uses environment variables directly
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only load dotenv in development environment
// In production (Vercel), environment variables are set directly in the dashboard
if (process.env.NODE_ENV !== "production") {
  // Load root-level .env (../../.env from backend/config) for monorepo setups
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  // Load backend-local .env if present
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
  // Finally, allow process cwd .env as fallback
  dotenv.config();
}

/**
 * Configuration object
 */
export const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3005,
    env: process.env.NODE_ENV || "development",
  },

  // Volcengine Jimeng 4.0 API configuration
  volcengine: {
    // API keys
    accessKey: process.env.SEEDREAM_API_AK,
    secretKey: process.env.SEEDREAM_API_SK,
    endpoint:
      process.env.VOLCENGINE_ENDPOINT || "https://visual.volcengineapi.com/",
    region: process.env.VOLCENGINE_REGION || "cn-north-1",
    service: "cv", // computer vision
    timeout: 30000, // 30 seconds
    pollInterval: 2000, // 2 seconds
    maxPollAttempts: 60, // 2 minutes total
  },

  // Helius API configuration
  helius: {
    apiKey: process.env.HELIUS_API_KEY,
  },

  // Meme generation configuration
  memeGeneration: {
    maxWidth: 4096, // Increased for 4K support
    maxHeight: 4096, // Increased for 4K support
    maxPromptLength: 2000, // Increased for more detailed prompts
    defaultSize: "1024x1024", // Minimum size as per Volcengine docs
    defaultScale: 7.5, // Recommended scale for Volcengine 4.0
    maxImagesPerRequest: 15, // Max images per request as per docs
    retryConfig: {
      maxRetries: 5, // Increased for better reliability
      retryDelay: 1500, // Base delay with jitter
      maxPollRetries: 60, // Increased polling attempts for complex requests
      pollDelay: 2000,
    },
    imageFormat: "jpeg", // Default output format
  },
};

/**
 * Validate configuration
 * @throws {Error} If required configuration is missing
 */
export const validateConfig = () => {
  // Validate Volcengine configuration
  if (!config.volcengine.accessKey || !config.volcengine.secretKey) {
    throw new Error("Volcengine API keys are not configured");
  }

  // Validate Helius configuration (optional, but warn if missing)
  if (!config.helius.apiKey) {
    console.warn(
      "Helius API key is not configured. Metadata upload functionality will be limited.",
    );
  }

  return true;
};
