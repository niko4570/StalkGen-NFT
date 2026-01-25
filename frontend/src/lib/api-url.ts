/**
 * API URL Utility
 *
 * This utility handles the distinction between public and internal URLs:
 * - Client-side: Uses NEXT_PUBLIC_BACKEND_URL (public domain)
 * - Server-side: Uses API_INTERNAL_URL (private networking)
 *
 * Railway automatically injects these environment variables based on service references.
 */

/**
 * Get the appropriate API URL based on the execution context
 * @returns {string} API URL to use
 */
export function getApiUrl(): string {
  // Check if we're on the server side
  const isServer = typeof window === "undefined";

  if (isServer) {
    // 🚂 Server-side: Use internal URL for private networking
    // This uses Railway's private domain for faster, secure internal communication
    const internalUrl = process.env.API_INTERNAL_URL;

    if (!internalUrl) {
      console.warn("🔴 API_INTERNAL_URL not found, falling back to public URL");
      return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3005";
    }

    console.log("🟢 Server-side: Using internal URL", internalUrl);
    return internalUrl;
  } else {
    // 🌐 Client-side: Use public URL
    // This uses the public domain that's accessible from the browser
    const publicUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!publicUrl) {
      console.warn(
        "🔴 NEXT_PUBLIC_BACKEND_URL not found, falling back to localhost",
      );
      return "http://localhost:3005";
    }

    console.log("🟢 Client-side: Using public URL", publicUrl);
    return publicUrl;
  }
}

/**
 * Debug function to log the current URL configuration
 * Useful for verifying Railway has injected variables correctly
 */
export function logApiUrlConfig(): void {
  const isServer = typeof window === "undefined";

  console.log("\n🔍 API URL Configuration:");
  console.log("   - Is Server:", isServer);

  // Only log variables that are available in the current context
  console.log(
    "   - NEXT_PUBLIC_BACKEND_URL:",
    process.env.NEXT_PUBLIC_BACKEND_URL,
  );

  // API_INTERNAL_URL is only available on server side (no NEXT_PUBLIC_ prefix)
  if (isServer) {
    console.log("   - API_INTERNAL_URL:", process.env.API_INTERNAL_URL);
  } else {
    console.log("   - API_INTERNAL_URL: [Not available on client side]");
  }

  console.log("   - Current API URL:", getApiUrl());
  console.log("\n");
}
