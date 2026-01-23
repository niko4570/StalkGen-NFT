#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Volcengine API Client using official SDK

This script provides a Python client for Volcengine API calls,
using the official SDK to handle authentication and requests.
"""

import os
import sys
import json
from typing import Dict, Any, Optional

# Add the parent directory to the path so we can import the shared utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import the Volcengine SDK
# If it's not installed, we'll show an error message
try:
    from volcengine.visual.VisualService import VisualService
except ImportError:
    print("Error: volcengine SDK not installed. Please run 'pip install volcengine' to install it.")
    sys.exit(1)

class VolcengineClient:
    """
    Volcengine API Client using official SDK
    """
    
    def __init__(self, ak: str, sk: str):
        """
        Initialize the Volcengine client
        
        Args:
            ak: Access Key
            sk: Secret Key
        """
        self.ak = ak
        self.sk = sk
        
        # Initialize the VisualService client
        self.visual_service = VisualService()
        self.visual_service.set_ak(ak)
        self.visual_service.set_sk(sk)
    
    def generate_image(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an image using Volcengine Seedream API
        
        Args:
            params: Generation parameters including:
                - prompt: Text prompt for image generation
                - negative_prompt: Negative prompt
                - width: Image width
                - height: Image height
                - seed: Random seed (-1 for random)
                - scale: Guidance scale
                - use_pre_llm: Whether to use pre-LLM processing
        
        Returns:
            Dict containing the generated image URL or other result
        """
        try:
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
            
            print(f"Sending request to Volcengine API with prompt: {params.get('prompt')}")
            print(f"Request body: {json.dumps(req_body, ensure_ascii=False)}")
            
            # Call the API using the official SDK
            # This handles all authentication automatically
            response = self.visual_service.cv_sync2async_submit_task(req_body)
            
            print(f"API response: {json.dumps(response, ensure_ascii=False, indent=2)}")
            
            return response
            
        except Exception as e:
            print(f"Error generating image: {str(e)}")
            raise
    
    def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """
        Get the result of an asynchronous task
        
        Args:
            task_id: Task ID returned from the submit_task API
        
        Returns:
            Dict containing the task result
        """
        try:
            # Prepare the request body
            req_body = {
                "req_key": "high_aes_general_v30l_zt2i",
                "task_id": task_id,
                "req_json": json.dumps({"return_url": True}),
            }
            
            print(f"Getting result for task: {task_id}")
            print(f"Request body: {json.dumps(req_body, ensure_ascii=False)}")
            
            # Call the API using the official SDK
            response = self.visual_service.cv_sync2async_get_result(req_body)
            
            print(f"Task result response: {json.dumps(response, ensure_ascii=False, indent=2)}")
            
            return response
            
        except Exception as e:
            print(f"Error getting task result: {str(e)}")
            raise

if __name__ == "__main__":
    """
    Test the Volcengine client
    """
    # Get AK/SK from environment variables
    ak = os.environ.get("PUBLIC_SEEDREAM_API_AK") or os.environ.get("NEXT_PUBLIC_SEEDREAM_API_AK")
    sk = os.environ.get("PUBLIC_SEEDREAM_API_SK") or os.environ.get("NEXT_PUBLIC_SEEDREAM_API_SK")
    
    if not ak or not sk:
        print("Error: Please set PUBLIC_SEEDREAM_API_AK and PUBLIC_SEEDREAM_API_SK environment variables")
        sys.exit(1)
    
    # Initialize the client
    client = VolcengineClient(ak, sk)
    
    # Test image generation
    test_params = {
        "prompt": "一只猫在海滩上戴着墨镜",
        "width": 1024,
        "height": 1024,
        "negative_prompt": "模糊, 失真, 低质量",
        "seed": -1,
        "scale": 2.5,
        "use_pre_llm": False,
    }
    
    try:
        print("Testing image generation...")
        result = client.generate_image(test_params)
        print(f"Test result: {json.dumps(result, ensure_ascii=False, indent=2)}")
        
        # If we got a task ID, try to get the result
        if "data" in result and "task_id" in result["data"]:
            task_id = result["data"]["task_id"]
            print(f"\nTesting task result retrieval for task ID: {task_id}")
            task_result = client.get_task_result(task_id)
            print(f"Task result: {json.dumps(task_result, ensure_ascii=False, indent=2)}")
            
    except Exception as e:
        print(f"Test failed: {str(e)}")
        sys.exit(1)
