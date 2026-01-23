/**
 * StalkGen NFT Backend Server
 *
 * This file serves as the entry point for the StalkGen NFT backend server,
 * setting up Express.js and configuring all API routes.
 *
 * @module index
 * @description Main backend server configuration and route setup
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateMeme, testHeliusUpload } from "./routes/generate-meme.js";
import { mintNFT } from "./routes/mint-nft.js";
import {
  restyleImage,
  testFalAi,
  getAvailableStyles,
} from "./routes/fal-ai.js";
import path from "path";

/**
 * Load environment variables from the root directory
 *
 * This ensures all API keys and configuration values are loaded
 * before the server starts.
 */
const envPath = path.resolve("../.env");
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

/**
 * Log environment variable loading status
 *
 * This provides visibility into which API keys and configuration values
 * are successfully loaded at server startup.
 */
const seedreamAk =
  process.env.NEXT_PUBLIC_SEEDREAM_API_AK || process.env.PUBLIC_SEEDREAM_API_AK;
const seedreamSk =
  process.env.NEXT_PUBLIC_SEEDREAM_API_SK || process.env.PUBLIC_SEEDREAM_API_SK;
const solanaRpcUrl =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.PUBLIC_SOLANA_RPC_URL;

console.log(`PUBLIC_SEEDREAM_API_AK loaded: ${!!seedreamAk}`);
console.log(`PUBLIC_SEEDREAM_API_SK loaded: ${!!seedreamSk}`);
console.log(`PUBLIC_SOLANA_RPC_URL loaded: ${!!solanaRpcUrl}`);
console.log(`HELIUS_API_KEY loaded: ${!!process.env.HELIUS_API_KEY}`);

/**
 * Initialize Express application
 *
 * Creates a new Express.js application instance for handling HTTP requests.
 */
const app = express();

/**
 * Set server port
 *
 * Uses the PORT environment variable if specified, otherwise defaults to 3002.
 */
const PORT = process.env.PORT || 3004;

/**
 * Configure Express middleware
 *
 * - cors(): Enables Cross-Origin Resource Sharing for all routes
 * - express.json(): Parses JSON request bodies
 */
app.use(cors());
app.use(express.json());

/**
 * API Routes Configuration
 *
 * Maps HTTP endpoints to their corresponding handler functions:
 *
 * POST endpoints:
 * - /api/generate-meme: Generate memes using AI
 * - /api/mint-nft: Mint generated memes as NFTs
 * - /api/test-helius: Test Helius API integration
 * - /api/restyle-image: Restyle images using FAL AI
 * - /api/test-fal-ai: Test FAL AI API integration
 *
 * GET endpoints:
 * - /api/available-styles: Get available styles for image restyling
 */
app.post("/api/generate-meme", generateMeme);
app.post("/api/mint-nft", mintNFT);
app.post("/api/test-helius", testHeliusUpload);
app.post("/api/restyle-image", restyleImage);
app.post("/api/test-fal-ai", testFalAi);
app.get("/api/available-styles", getAvailableStyles);

/**
 * Health check endpoint
 *
 * Provides a simple endpoint to verify the server is running correctly.
 *
 * @route GET /
 * @returns {Object} JSON response with status message
 */
app.get("/", (req, res) => {
  res.json({ message: "StalkGen Backend is running!" });
});

/**
 * Start the server
 *
 * Listens for incoming HTTP requests on the specified port.
 *
 * @param {number} PORT - The port number to listen on
 * @returns {void}
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
