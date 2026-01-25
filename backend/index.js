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
// Configure CORS for frontend requests, supporting Railway's public domains
const allowedOrigins = [
  // Local development
  "http://localhost:3000",
  "http://localhost:3005",
  // Railway frontend domain (will be injected by Railway)
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  // Allow any origin for development
  ...(process.env.NODE_ENV === "development" ? ["*"] : []),
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes("*")
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Enable CORS with configured options
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

// Start server if running directly (for Railway, local development, etc.)
// This won't run when imported as a module by Vercel
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const PORT = process.env.PORT || config.server.port;
  const HOST = "0.0.0.0"; // Listen on all interfaces for Railway

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
    console.log(`🔗 Health check: http://${HOST}:${PORT}/api/health`);
  });
}
