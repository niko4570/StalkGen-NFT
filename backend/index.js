/**
 * StalkGen NFT Backend Server
 *
 * Main entry point for the backend API server.
 * Configures Express, middleware, routes, and exports the app as a handler.
 * Designed for Vercel Serverless Functions – do NOT use app.listen() here.
 */

import express from "express";
import cors from "cors";
import { generateMeme } from "./routes/generate-meme.js";
import { mintNFT } from "./routes/mint-nft.js";
import { uploadMetadata } from "./routes/upload-metadata.js";
import { config, validateConfig } from "./config/config.js";

// Validate all required environment variables before proceeding
try {
  validateConfig();
  console.log("✅ Configuration validated successfully");
} catch (error) {
  console.error("❌ Configuration validation failed:", error.message);
  // In Vercel, we log and continue instead of exiting to avoid immediate crash
  // process.exit(1);  // Commented out – do not use in serverless
}

// Initialize Express app
const app = express();

// Apply global middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies (limit 10MB for image uploads)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint – useful for Vercel deployment verification
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.server.env || "unknown",
    message: "Backend is running on Vercel Serverless Functions",
  });
});

// Core API routes
app.post("/api/generate-meme", generateMeme); // Generate meme image and metadata
app.post("/api/mint-nft", mintNFT); // Mint NFT on Solana (devnet/mainnet)
app.post("/api/upload-metadata", uploadMetadata); // Upload metadata to Arweave via Irys

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler – catches unhandled errors and logs them
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.stack || err);
  res.status(500).json({
    error: "Internal server error",
    details:
      config.server.env === "development"
        ? err.message
        : "An unexpected error occurred. Please try again later.",
  });
});

// Export the app as the default handler for Vercel Serverless Functions
// This is the ONLY required export – Vercel uses this to handle incoming requests
export default app;
