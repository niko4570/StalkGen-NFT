/**
 * Volcengine API Wrapper for Node.js
 * 
 * This module provides a Node.js interface to the Volcengine API client written in Python,
 * using the official SDK for reliable authentication and requests.
 */

import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

/**
 * Volcengine API Wrapper Class
 */
export class VolcengineWrapper {
  /**
   * Constructor for VolcengineWrapper
   * @param {Object} options - Options for the wrapper
   * @param {string} [options.pythonPath='python3'] - Path to Python executable
   */
  constructor(options = {}) {
    // Use the Python interpreter from the virtual environment we created
    this.pythonPath = options.pythonPath || '/home/niko/code/StalkGen-NFT/venv/bin/python3';
    this.clientPath = path.join(
      path.dirname(import.meta.url.replace('file:', '')),
      'volcengine_client.py'
    );
    
    // Get AK/SK from environment variables
    this.ak = process.env.NEXT_PUBLIC_SEEDREAM_API_AK || process.env.PUBLIC_SEEDREAM_API_AK;
    this.sk = process.env.NEXT_PUBLIC_SEEDREAM_API_SK || process.env.PUBLIC_SEEDREAM_API_SK;
    
    // Don't throw error immediately, check at time of actual API call
  }
  
  /**
   * Check if API credentials are available
   * @throws {Error} If credentials are missing
   */
  checkCredentials() {
    // Get fresh credentials from environment variables
    this.ak = process.env.NEXT_PUBLIC_SEEDREAM_API_AK || process.env.PUBLIC_SEEDREAM_API_AK;
    this.sk = process.env.NEXT_PUBLIC_SEEDREAM_API_SK || process.env.PUBLIC_SEEDREAM_API_SK;
    
    if (!this.ak || !this.sk) {
      throw new Error('Missing Volcengine API credentials. Please set PUBLIC_SEEDREAM_API_AK and PUBLIC_SEEDREAM_API_SK environment variables.');
    }
  }

  /**
   * Execute Python script with arguments
   * @param {string[]} args - Arguments to pass to the Python script
   * @param {string} [input] - Input to pass to the Python script via stdin
   * @returns {Promise<string>} - Output from the Python script
   */
  async executePythonScript(args, input = null) {
    return new Promise((resolve, reject) => {
      console.log(`Executing Python script: ${this.pythonPath} ${args.join(' ')}`);
      
      // Set environment variables including AK/SK
      const env = {
        ...process.env,
        PUBLIC_SEEDREAM_API_AK: this.ak,
        PUBLIC_SEEDREAM_API_SK: this.sk,
      };
      
      // Spawn the Python process
      const pythonProcess = spawn(this.pythonPath, args, {
        env: env,
        stdio: input ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
      });
      
      let output = '';
      let errorOutput = '';
      
      // Collect stdout
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      // Collect stderr
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      // Handle input if provided
      if (input) {
        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();
      }
      
      // Handle process close
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script failed with code ${code}`);
          console.error(`Error output: ${errorOutput}`);
          return reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        }
        
        resolve(output);
      });
      
      // Handle process errors
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to execute Python script: ${error.message}`));
      });
    });
  }

  /**
   * Generate an image using Volcengine API via Python SDK
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated image result
   */
  async generateImage(params) {
    try {
      // Check credentials before making API call
      this.checkCredentials();
      
      // Create a simple Python script that uses the Volcengine SDK directly with verbose logging
      const scriptContent = `
import sys
import json
import os
import traceback

# Add verbose logging to stderr
print("Python script starting...", file=sys.stderr)

# Get AK/SK from environment variables
ak = os.environ.get('PUBLIC_SEEDREAM_API_AK')
sk = os.environ.get('PUBLIC_SEEDREAM_API_SK')

print(f"AK loaded: {'Yes' if ak else 'No'}", file=sys.stderr)
print(f"SK loaded: {'Yes' if sk else 'No'}", file=sys.stderr)

if not ak or not sk:
    print(json.dumps({"error": "Missing AK/SK in environment variables"}))
    sys.exit(1)

# Try to import the SDK
print("Attempting to import Volcengine SDK...", file=sys.stderr)
try:
    from volcengine.visual.VisualService import VisualService
    print("SDK imported successfully", file=sys.stderr)
except Exception as e:
    error_msg = f"Failed to import SDK: {str(e)}"
    print(f"ERROR: {error_msg}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print(json.dumps({"error": error_msg}))
    sys.exit(1)

# Load parameters from stdin
print("Reading parameters from stdin...", file=sys.stderr)
try:
    params = json.load(sys.stdin)
    print(f"Params loaded: {json.dumps(params, ensure_ascii=False)}", file=sys.stderr)
except Exception as e:
    error_msg = f"Failed to read params: {str(e)}"
    print(f"ERROR: {error_msg}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print(json.dumps({"error": error_msg}))
    sys.exit(1)

# Initialize the VisualService client
print("Initializing VisualService client...", file=sys.stderr)
try:
    visual_service = VisualService()
    visual_service.set_ak(ak)
    visual_service.set_sk(sk)
    print("Client initialized successfully", file=sys.stderr)
except Exception as e:
    error_msg = f"Failed to initialize client: {str(e)}"
    print(f"ERROR: {error_msg}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print(json.dumps({"error": error_msg}))
    sys.exit(1)

# Prepare the request body
req_body = {
    "req_key": "high_aes_general_v30l_zt2i",
    "prompt": params.get("prompt", ""),
    "negative_prompt": params.get("negative_prompt", ""),
    "width": params.get("width", 1024),
    "height": params.get("height", 1024),
    "seed": params.get("seed", -1),
    "scale": params.get("scale", 2.5),
    "use_pre_llm": params.get("use_pre_llm", False),
}

print(f"Request body: {json.dumps(req_body, ensure_ascii=False)}", file=sys.stderr)

# Call the API using the official SDK
print("Calling API...", file=sys.stderr)
try:
    result = visual_service.cv_sync2async_submit_task(req_body)
    print(f"API response: {json.dumps(result, ensure_ascii=False)}", file=sys.stderr)
    print(json.dumps(result))
except Exception as e:
    error_msg = f"API call failed: {str(e)}"
    print(f"ERROR: {error_msg}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print(json.dumps({"error": error_msg}))
    sys.exit(1)
`;
      
      // Execute the script directly with -c option
      const result = await this.executePythonScript(
        ['-c', scriptContent],
        JSON.stringify(params)
      );
      
      // Parse the result
      const parsedResult = JSON.parse(result);
      
      if (parsedResult.error) {
        throw new Error(parsedResult.error);
      }
      
      return parsedResult;
      
    } catch (error) {
      console.error('Error generating image via Python SDK:', error);
      throw error;
    }
  }

  /**
   * Get task result using Volcengine API via Python SDK
   * @param {string} taskId - Task ID to get result for
   * @returns {Promise<Object>} - Task result
   */
  async getTaskResult(taskId) {
    try {
      // Check credentials before making API call
      this.checkCredentials();
      
      // Create a simple Python script that uses the Volcengine SDK directly
      const scriptContent = `
import sys
import json
import os
from volcengine.visual.VisualService import VisualService

# Get AK/SK from environment variables
ak = os.environ.get('PUBLIC_SEEDREAM_API_AK')
sk = os.environ.get('PUBLIC_SEEDREAM_API_SK')

if not ak or not sk:
    print(json.dumps({"error": "Missing AK/SK in environment variables"}))
    sys.exit(1)

# Load parameters from stdin
params = json.load(sys.stdin)
task_id = params.get('task_id')

if not task_id:
    print(json.dumps({"error": "Missing task_id parameter"}))
    sys.exit(1)

# Initialize the VisualService client
visual_service = VisualService()
visual_service.set_ak(ak)
visual_service.set_sk(sk)

# Prepare the request body
req_body = {
    "req_key": "high_aes_general_v30l_zt2i",
    "task_id": task_id,
    "req_json": json.dumps({"return_url": True}),
}

try:
    # Call the API using the official SDK
    result = visual_service.cv_sync2async_get_result(req_body)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;
      
      // Execute the script with task ID as JSON input
      const result = await this.executePythonScript(
        ['-c', scriptContent],
        JSON.stringify({ task_id: taskId })
      );
      
      // Parse the result
      const parsedResult = JSON.parse(result);
      
      if (parsedResult.error) {
        throw new Error(parsedResult.error);
      }
      
      return parsedResult;
      
    } catch (error) {
      console.error('Error getting task result via Python SDK:', error);
      throw error;
    }
  }
}

/**
 * Create a singleton instance of VolcengineWrapper
 */
export const volcengineWrapper = new VolcengineWrapper();