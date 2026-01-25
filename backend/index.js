/**
 * StalkGen NFT Backend Server
 *
 * Main entry point for the backend API server.
 * Sets up Express, configures middleware, and defines routes.
 */

import express from "express";
import cors from "cors";
import { generateMeme } from "./routes/generate-meme.js";
import { mintNFT } from "./routes/mint-nft.js";
import { uploadMetadata } from "./routes/upload-metadata.js";
import { config, validateConfig } from "./config/config.js";

// Validate configuration before starting the server
try {
  validateConfig();
  console.log("✅ Configuration validated successfully");
} catch (error) {
  console.error("❌ Configuration validation failed:", error.message);
  process.exit(1);
}

// Create Express app
const app = express();
const PORT = config.server.port;

// Configure middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Meme generation endpoint
app.post("/api/generate-meme", generateMeme);

// NFT minting endpoint
app.post("/api/mint-nft", mintNFT);

// Metadata upload endpoint
app.post("/api/upload-metadata", uploadMetadata);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    details:
      config.server.env === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start server
app.listen(PORT, () => {
  // Only log detailed information in development mode
  if (config.server.env === "development") {
    console.log(`🚀 StalkGen NFT Backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(
      `🎨 Meme generation: POST http://localhost:${PORT}/api/generate-meme`,
    );
    console.log(
      `🖼️  NFT minting: POST http://localhost:${PORT}/api/mint-nft`,
    );
    console.log(
      `📁 Metadata upload: POST http://localhost:${PORT}/api/upload-metadata`,
    );
    console.log(`\nRequired environment variables:`);
    console.log(`- SEEDREAM_API_AK: Volcengine Access Key`);
    console.log(`- SEEDREAM_API_SK: Volcengine Secret Key`);
    console.log(`- HELIUS_API_KEY: Helius API key (for metadata upload)`);
  } else {
    console.log(`🚀 StalkGen NFT Backend running in ${config.server.env} mode on port ${PORT}`);
  }
});

export default app;
