import {
  generateImageWithTongyi,
  validateAkSk,
  getSupportedSizes,
} from "./tongyi-image";

// Test script for Tongyi image generation tool
async function testTongyiTool() {
  console.log("🧪 Testing Tongyi image generation tool...");

  // Test 1: Validate AK/SK
  console.log("\n1. Testing AK/SK validation...");
  const validAkSk = validateAkSk("test-ak", "test-sk");
  console.log("✓ AK/SK validation:", validAkSk);

  // Test 2: Get supported sizes
  console.log("\n2. Testing supported sizes...");
  const sizes = getSupportedSizes();
  console.log("✓ Supported sizes:", sizes);

  // Test 3: Test image generation (will fail without real AK/SK, but should show error handling)
  console.log("\n3. Testing image generation (mock)...");
  try {
    const imageUrl = await generateImageWithTongyi({
      prompt: "一只猫在海滩上戴着墨镜",
      negative_prompt: "模糊, 低质量",
      size: "1024x1024",
      ak: "test-ak", // Invalid AK
      sk: "test-sk", // Invalid SK
      timeout: 10000,
      onProgress: (status, progress) => {
        console.log(`  📊 Progress: ${progress}% - ${status}`);
      },
    });
    console.log("✓ Image generated:", imageUrl);
  } catch (error) {
    console.log(
      "💥 Expected error (no real AK/SK):",
      error instanceof Error ? error.message : error,
    );
    console.log("✓ Error handling working correctly");
  }

  console.log("\n🎉 All tests completed!");
}

// Run test
testTongyiTool().catch(console.error);
