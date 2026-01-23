// 工具函数：调用后端 API 生成图像

export interface GenerateImageParams {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
}

export async function generateImageWithFlux({
  prompt,
  negative_prompt = "",
  width = 1024,
  height = 1024,
}: GenerateImageParams): Promise<string> {
  const backendUrl =
    process.env.PUBLIC_BACKEND_URL || "http://localhost:3001";

  // 调用后端 API
  const response = await fetch(`${backendUrl}/api/generate-meme`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      negative_prompt,
      width,
      height,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to generate image: ${errorData.error || response.statusText}`,
    );
  }

  const data = await response.json();
  return data.imageUrl;
}
