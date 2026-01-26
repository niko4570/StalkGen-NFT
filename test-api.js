const { getApiUrl } = require('./frontend/src/lib/api-url.cjs');

// Test the API URL generation
console.log('Testing API URL configuration...');

// Simulate client-side
console.log('\nClient-side (browser):');
global.window = {}; // Simulate browser environment
try {
  const clientUrl = getApiUrl();
  console.log(`  API URL: ${clientUrl}`);
  console.log(`  Environment variable: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
} catch (error) {
  console.error('  Error:', error.message);
}

// Simulate server-side
delete global.window; // Simulate server environment
try {
  const serverUrl = getApiUrl();
  console.log('\nServer-side:');
  console.log(`  API URL: ${serverUrl}`);
  console.log(`  Internal URL: ${process.env.API_INTERNAL_URL}`);
  console.log(`  Public URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
} catch (error) {
  console.error('  Error:', error.message);
}

// Test actual API call
const axios = require('axios');
console.log('\nTesting actual API call to backend...');

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';

axios.get(`${apiUrl}/api/health`)
  .then(response => {
    console.log('  Success! API health check passed:');
    console.log(`    Status: ${response.data.status}`);
    console.log(`    Environment: ${response.data.environment}`);
    console.log(`    Message: ${response.data.message}`);
  })
  .catch(error => {
    console.error('  Error calling API:');
    if (error.response) {
      console.error(`    Status: ${error.response.status}`);
      console.error(`    Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('    No response received from server');
    } else {
      console.error(`    Error: ${error.message}`);
    }
  });
