/**
 * Volcengine API Wrapper
 *
 * Encapsulates the core functionality for calling Volcengine Jimeng 4.0 API
 * Handles authentication, request signing, and response processing
 */

import { config } from "../config/config.js";
import axios from "axios";
import { Signer } from '@volcengine/openapi';

class VolcengineWrapper {
  constructor() {
    this.accessKey = config.volcengine.accessKey;
    this.secretKey = config.volcengine.secretKey;
    this.endpoint = config.volcengine.endpoint;
    this.region = config.volcengine.region;
    this.service = config.volcengine.service;
    this.timeout = config.volcengine.timeout || 30000;
    this.pollInterval = config.volcengine.pollInterval || 2000;
    this.maxPollAttempts = config.volcengine.maxPollAttempts || 60;

    // Validate required credentials
    if (!this.accessKey || !this.secretKey) {
      throw new Error("Missing Volcengine API keys in configuration");
    }

    console.log("VolcengineWrapper initialized with endpoint:", this.endpoint);
  }

  /**
   * Make API request to Volcengine Jimeng 4.0 API using official SDK Signer
   * @param {string} action - API action name
   * @param {Object} body - Request body
   * @returns {Promise<Object>} API response
   */
  async makeApiRequest(action, body) {
    // API Version from official documentation
    const version = "2022-08-31";
    
    // Build full URL
    const fullUrl = new URL(this.endpoint);
    fullUrl.searchParams.append('Action', action);
    fullUrl.searchParams.append('Version', version);
    
    // Convert body to string
    const bodyStr = JSON.stringify(body);
    
    // Create request object for Signer
    const requestObj = {
      region: this.region,
      method: 'POST',
      // Query parameters
      params: {
        Action: action,
        Version: version
      },
      // Request headers
      headers: {
        'Content-Type': 'application/json'
      },
      // Request body
      body: bodyStr,
    };
    
    // Create Signer instance with service name
    const signer = new Signer(requestObj, this.service);
    
    // Add authorization using official SDK signing method
    signer.addAuthorization({ 
      accessKeyId: this.accessKey, 
      secretKey: this.secretKey 
    });
    
    try {
      // Make the signed request
      const response = await axios({
        method: 'POST',
        url: fullUrl.toString(),
        headers: requestObj.headers,
        data: bodyStr,
        timeout: this.timeout,
        responseType: 'json'
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Volcengine API Error Response:", error.response.data);
        throw new Error(`API Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Volcengine API No Response:", error.request);
        throw new Error("No response received from Volcengine API");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Volcengine API Request Error:", error.message);
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  /**
   * Validate image generation parameters
   * @param {Object} params - Image generation parameters
   * @returns {Object} Validated parameters
   */
  validateImageParams(params) {
    const { prompt, width = 1024, height = 1024 } = params;

    // Validate prompt
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error("Prompt is required and must be a non-empty string");
    }

    // Validate dimensions
    if (
      typeof width !== "number" ||
      typeof height !== "number" ||
      width <= 0 ||
      height <= 0
    ) {
      throw new Error("Width and height must be positive numbers");
    }

    // Validate maximum dimensions (as per Volcengine API requirements)
    if (width > 4096 || height > 4096) {
      throw new Error("Image dimensions cannot exceed 4096x4096");
    }

    // Validate minimum dimensions
    if (width < 256 || height < 256) {
      throw new Error("Image dimensions must be at least 256x256");
    }

    return { prompt, width, height };
  }

  /**
   * Generate image using Volcengine Jimeng 4.0 API
   * @param {Object} params - Image generation parameters
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(params) {
    try {
      // Validate input parameters
      const validatedParams = this.validateImageParams(params);
      const { prompt, width, height } = validatedParams;

      console.log("Generating image with prompt:", prompt.slice(0, 50) + "...");

      // Build request body for Jimeng 4.0 API - following official documentation
      const requestBody = {
        req_key: "jimeng_t2i_v40",
        prompt,
        width,
        height,
        force_single: true,
        scale: 0.5
      };

      console.log("Calling Volcengine Jimeng API with:", requestBody);

      // Make API request to submit task
      const submitResponse = await this.makeApiRequest(
        "CVSync2AsyncSubmitTask",
        requestBody,
      );

      console.log("Submit response:", submitResponse);

      if (
        !submitResponse.code ||
        submitResponse.code !== 10000 ||
        !submitResponse.data?.task_id
      ) {
        throw new Error(
          `Failed to submit image generation task: ${JSON.stringify(submitResponse)}`,
        );
      }

      const taskId = submitResponse.data.task_id;
      console.log("Image generation task submitted with ID:", taskId);

      // Poll for task completion
      return this.pollTaskResult(taskId);
    } catch (error) {
      console.error("Error in generateImage:", error);
      throw error;
    }
  }

  /**
   * Poll for task result from Volcengine API
   * @param {string} taskId - Task ID to poll
   * @returns {Promise<Object>} Task result
   */
  async pollTaskResult(taskId) {
    if (!taskId || typeof taskId !== "string") {
      throw new Error("Invalid task ID");
    }

    console.log(`Polling task ${taskId} for completion`);

    for (let attempt = 0; attempt < this.maxPollAttempts; attempt++) {
      console.log(
        `Polling task ${taskId}, attempt ${attempt + 1}/${this.maxPollAttempts}`,
      );

      try {
        // Build request body for getting task result - following official documentation
        const requestBody = {
          task_id: taskId,
          req_key: "jimeng_t2i_v40",
        };

        // Make API request to get task result
        const resultResponse = await this.makeApiRequest(
          "CVSync2AsyncGetResult",
          requestBody,
        );

        console.log("Poll response:", resultResponse);

        if (resultResponse.code === 10000 && resultResponse.data) {
          // Check if task is completed
          if (
            resultResponse.data.status === 1 ||
            resultResponse.data.status === "done"
          ) {
            // Task completed successfully
            console.log("Task completed successfully:", resultResponse.data);
            return resultResponse.data;
          } else if (resultResponse.data.status === 2) {
            // Task failed
            throw new Error(
              `Task failed with code ${resultResponse.data.status}: ${resultResponse.data.msg || "Unknown error"}`,
            );
          } else {
            // Task is still in progress, wait and retry
            console.log(
              `Task ${taskId} still in progress (status: ${resultResponse.data.status}), waiting ${this.pollInterval}ms...`,
            );
            await new Promise((resolve) =>
              setTimeout(resolve, this.pollInterval),
            );
          }
        } else {
          // Unexpected response format
          throw new Error(
            `Failed to get task result: ${JSON.stringify(resultResponse)}`,
          );
        }
      } catch (error) {
        console.error(`Error polling task ${taskId}:`, error);
        throw error;
      }
    }

    throw new Error(
      `Task ${taskId} timed out after ${this.maxPollAttempts} attempts`,
    );
  }
}

export const volcengineWrapper = new VolcengineWrapper();