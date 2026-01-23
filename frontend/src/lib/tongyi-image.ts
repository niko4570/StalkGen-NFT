import crypto from 'crypto';

// Tongyi Qianwen 3.0 Image Generation Tool
// Supports AK/SK authentication and async generation flow

interface TongyiImageOptions {
  prompt: string;
  negative_prompt?: string;
  size?: string;
  ak: string;
  sk: string;
  timeout?: number;
  onProgress?: (status: string, progress: number) => void;
}

interface TongyiResponse {
  request_id: string;
  task_id: string;
  status: string;
  data?: {
    images: string[];
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Generate image using Tongyi Qianwen 3.0 API
 * @param options - Generation options including prompt, AK/SK, etc.
 * @returns Promise<string> - Generated image URL
 */
export async function generateImageWithTongyi(
  options: TongyiImageOptions
): Promise<string> {
  const {
    prompt,
    negative_prompt = '',
    size = '1024x1024',
    ak,
    sk,
    timeout = 30000,
    onProgress
  } = options;

  if (!prompt) {
    throw new Error('Prompt is required');
  }

  if (!ak || !sk) {
    throw new Error('AK and SK are required for authentication');
  }

  // Validate size
  const validSizes = ['512x512', '768x768', '1024x1024'];
  if (!validSizes.includes(size)) {
    throw new Error(`Invalid size. Valid sizes are: ${validSizes.join(', ')}`);
  }

  try {
    // Step 1: Create generation task
    onProgress?.("Creating task", 0);
    const taskResponse = await createGenerationTask({
      prompt,
      negative_prompt,
      size,
      ak,
      sk
    });

    if (taskResponse.error) {
      throw new Error(`API Error: ${taskResponse.error.message}`);
    }

    if (!taskResponse.task_id) {
      throw new Error('Failed to get task ID');
    }

    // Step 2: Poll for task completion
    onProgress?.("Generating image", 25);
    const result = await pollTaskStatus({
      taskId: taskResponse.task_id,
      ak,
      sk,
      timeout,
      onProgress
    });

    if (!result.data?.images || result.data.images.length === 0) {
      throw new Error('Failed to generate image');
    }

    onProgress?.("Image generated", 100);
    return result.data.images[0];
  } catch (error) {
    console.error('Tongyi image generation error:', error);
    throw error;
  }
}

/**
 * Create image generation task
 */
async function createGenerationTask(options: {
  prompt: string;
  negative_prompt: string;
  size: string;
  ak: string;
  sk: string;
}): Promise<TongyiResponse> {
  const {
    prompt,
    negative_prompt,
    size,
    ak,
    sk
  } = options;

  const endpoint = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);

  // Prepare request body
  const requestBody = {
    model: 'ep-20250924172214-289f8', // Tongyi Qianwen 3.0 model
    prompt,
    negative_prompt,
    size,
    n: 1
  };

  // Generate signature
  const signature = generateSignature({
    method: 'POST',
    endpoint: '/api/v3/images/generations',
    timestamp,
    nonce,
    body: JSON.stringify(requestBody),
    sk
  });

  // Make API request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TOP-Request-Id': crypto.randomUUID(),
      'X-TOP-Timestamp': timestamp.toString(),
      'X-TOP-Nonce': nonce,
      'X-TOP-Account-Id': ak,
      'X-TOP-Signature': signature,
      'X-TOP-Signature-Method': 'HMAC-SHA256'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Poll task status until completion
 */
async function pollTaskStatus(options: {
  taskId: string;
  ak: string;
  sk: string;
  timeout: number;
  onProgress?: (status: string, progress: number) => void;
}): Promise<TongyiResponse> {
  const {
    taskId,
    ak,
    sk,
    timeout,
    onProgress
  } = options;

  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds

  while (Date.now() - startTime < timeout) {
    try {
      const statusResponse = await getTaskStatus({
        taskId,
        ak,
        sk
      });

      if (statusResponse.status === 'SUCCEEDED') {
        onProgress?.("Task completed", 90);
        return statusResponse;
      } else if (statusResponse.status === 'FAILED') {
        throw new Error(`Task failed: ${statusResponse.error?.message || 'Unknown error'}`);
      } else if (statusResponse.status === 'RUNNING') {
        onProgress?.("Generating image", 50);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling even if there's a temporary error
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('Task timeout - image generation took too long');
}

/**
 * Get task status
 */
async function getTaskStatus(options: {
  taskId: string;
  ak: string;
  sk: string;
}): Promise<TongyiResponse> {
  const {
    taskId,
    ak,
    sk
  } = options;

  const endpoint = `https://ark.cn-beijing.volces.com/api/v3/images/generations/${taskId}`;
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);

  // Generate signature for GET request
  const signature = generateSignature({
    method: 'GET',
    endpoint: `/api/v3/images/generations/${taskId}`,
    timestamp,
    nonce,
    body: '',
    sk
  });

  // Make API request
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'X-TOP-Request-Id': crypto.randomUUID(),
      'X-TOP-Timestamp': timestamp.toString(),
      'X-TOP-Nonce': nonce,
      'X-TOP-Account-Id': ak,
      'X-TOP-Signature': signature,
      'X-TOP-Signature-Method': 'HMAC-SHA256'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Generate HMAC-SHA256 signature for Tongyi API
 */
function generateSignature(options: {
  method: string;
  endpoint: string;
  timestamp: number;
  nonce: string;
  body: string;
  sk: string;
}): string {
  const {
    method,
    endpoint,
    timestamp,
    nonce,
    body,
    sk
  } = options;

  // Create signature string
  const signatureString = `${method}\n${endpoint}\n${timestamp}\n${nonce}\n${body}\n`;

  // Generate HMAC-SHA256 signature
  const hmac = crypto.createHmac('sha256', sk);
  hmac.update(signatureString);
  return hmac.digest('base64');
}

/**
 * Validate AK/SK format
 */
export function validateAkSk(ak: string, sk: string): boolean {
  return ak.length > 0 && sk.length > 0;
}

/**
 * Get supported image sizes
 */
export function getSupportedSizes(): string[] {
  return ['512x512', '768x768', '1024x1024'];
}
