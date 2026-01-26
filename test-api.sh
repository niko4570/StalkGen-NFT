#!/bin/bash

echo "Testing API URL configuration..."

# Print current environment variables
echo "\nCurrent environment variables:"
echo "NEXT_PUBLIC_BACKEND_URL: $NEXT_PUBLIC_BACKEND_URL"
echo "API_INTERNAL_URL: $API_INTERNAL_URL"

# Test actual API call to backend
echo "\nTesting actual API call to backend..."

API_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:3005}

# Test with curl
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json "$API_URL/api/health")
STATUS_CODE=$?

if [ $STATUS_CODE -eq 0 ]; then
  echo "  Success! API call completed with status code: $RESPONSE"
  echo "  Response data:"
  cat /tmp/response.json | jq .
else
  echo "  Error: curl command failed with exit code: $STATUS_CODE"
fi

# Test CORS configuration
echo "\nTesting CORS configuration..."

CORS_RESPONSE=$(curl -s -I -H "Origin: https://example.com" "$API_URL/api/health")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  echo "  Success! CORS headers found:"
  echo "$CORS_RESPONSE" | grep -i "access-control"
else
  echo "  Warning: No CORS headers found in response"
  echo "  Response headers:"
  echo "$CORS_RESPONSE"
fi

# Cleanup
rm -f /tmp/response.json
