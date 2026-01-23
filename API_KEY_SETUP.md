# Seedream API Key Setup and Troubleshooting

## Overview

This guide provides instructions for setting up and troubleshooting Seedream API keys in the StalkGen NFT project. The Seedream API is used to generate meme images that can be minted as NFTs.

## Required API Keys

The project requires two API keys from Seedream:

1. **Access Key (AK)**: Used for identifying your account
2. **Secret Key (SK)**: Used for authenticating API requests

## Configuration Steps

### 1. Obtain Seedream API Keys

- Register for a Seedream API account at [Seedream API Portal](https://seedream.bytedance.com/)
- Navigate to the API Keys section in your account dashboard
- Generate a new API key pair (AK and SK)

### 2. Configure Environment Variables

#### Step 2.1: Locate the .env file

The project uses a single `.env` file located at the project root:

```
/home/niko/code/StalkGen-NFT/.env
```

#### Step 2.2: Update the .env file

Add or update the following lines in your `.env` file:

```env
# Seedream API (frontend accessible)
NEXT_PUBLIC_SEEDREAM_API_AK=your_seedream_access_key_here
NEXT_PUBLIC_SEEDREAM_API_SK=your_seedream_secret_key_here
```

**Important Notes:**

- The `NEXT_PUBLIC_` prefix is required for frontend access to these variables
- Never commit your actual API keys to version control
- Always use secure methods to manage and share API keys

### 3. Restart Development Servers

After updating the `.env` file, restart both frontend and backend servers:

```bash
# In frontend directory
pnpm dev

# In backend directory
pnpm dev
```

## Troubleshooting

### Common Error: "Seedream API keys are missing"

#### Error Messages

- `缺少 Seedream API Access Key (AK)，请检查环境变量配置`
- `缺少 Seedream API Secret Key (SK)，请检查环境变量配置`
- `Seed
ream API keys are missing`

#### Possible Causes and Solutions

1. **Incorrect Environment Variable Names**
   - **Cause**: Using wrong variable names without the `NEXT_PUBLIC_` prefix
   - **Solution**: Ensure you're using `NEXT_PUBLIC_SEEDREAM_API_AK` and `NEXT_PUBLIC_SEEDREAM_API_SK`

2. **Missing Environment Variables**
   - **Cause**: Variables not defined in the `.env` file
   - **Solution**: Add both variables to your `.env` file with valid keys

3. **Server Not Restarted**
   - **Cause**: Changes to `.env` file not loaded by running servers
   - **Solution**: Restart both frontend and backend servers

4. **Incorrect File Location**
   - **Cause**: `.env` file placed in wrong directory
   - **Solution**: Ensure `.env` file is in the project root directory

5. **Invalid API Keys**
   - **Cause**: Keys are expired, revoked, or malformed
   - **Solution**: Generate new API keys from the Seedream portal

### Debugging Tips

1. **Check Console Logs**
   - The application logs detailed error information to the browser console
   - Look for messages like: `Seedream API Access Key (AK) is missing`

2. **Verify Environment Variables**
   - Add temporary console logs to check if variables are loaded correctly
   - Example: `console.log("Seedream AK:", process.env.NEXT_PUBLIC_SEEDREAM_API_AK)`

3. **Test API Keys Directly**
   - Use curl or Postman to test your API keys with the Seedream API
   - Example curl command:
     ```bash
     curl -X POST "https://seedream-api.bytedance.com/api/v3/text2image" \
     -H "Content-Type: application/json" \
     -H "X-TOP-Account-Id: YOUR_AK" \
     -H "X-TOP-Signature: YOUR_GENERATED_SIGNATURE" \
     -H "X-TOP-Timestamp: CURRENT_TIMESTAMP" \
     -H "X-TOP-Nonce: RANDOM_NONCE" \
     -d '{"model": "seedream-universal-3.0", "prompt": "test", "n": 1, "size": "1024x1024"}'
     ```

## Security Best Practices

1. **Never Expose API Keys in Code**
   - Always use environment variables for API keys
   - Never hardcode keys in source files

2. **Restrict API Key Permissions**
   - Set appropriate permissions for your API keys in the Seedream portal
   - Limit usage to only what's necessary for the project

3. **Rotate Keys Regularly**
   - Change your API keys periodically
   - Update them in all environments immediately after rotation

4. **Monitor API Usage**
   - Check your Seedream API dashboard for unusual activity
   - Set up alerts for excessive usage

## Additional Resources

- [Seedream API Documentation](https://seedream.bytedance.com/docs/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Solana NFT Minting Documentation](https://docs.solana.com/developing/programming-model/calling-between-programs)

## Support
If you continue to experience issues with Seedream API keys, please:
1. Check the application logs for detailed error information
2. Verify your API key configuration against this guide
3. Test your API keys directly with the Seedream API
4. Contact Seedream support for API-specific issues
5. Check the project GitHub issues for similar problems

By following this guide, you should be able to successfully configure and troubleshoot Seedream API keys for the StalkGen NFT project.