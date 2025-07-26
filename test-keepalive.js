const https = require('https');
const http = require('http');

// Test configuration
const TEST_URL = process.env.APP_URL || 'http://localhost:3000';
const TEST_INTERVAL = 5000; // 5 seconds for testing

function testKeepAlive() {
  const url = new URL(TEST_URL);
  const protocol = url.protocol === 'https:' ? https : http;
  
  console.log(`🧪 Testing keep-alive for: ${TEST_URL}/health`);
  
  const req = protocol.get(TEST_URL + '/health', (res) => {
    console.log(`[${new Date().toISOString()}] Test response: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Keep-alive test successful!');
    } else {
      console.log('⚠️ Test responded but with non-200 status');
    }
  });

  req.on('error', (err) => {
    console.error(`❌ Test error: ${err.message}`);
  });

  req.setTimeout(5000, () => {
    console.error('❌ Test timeout');
    req.destroy();
  });
}

// Run test
console.log('🚀 Starting keep-alive test...');
console.log(`⏰ Testing every ${TEST_INTERVAL / 1000} seconds`);

// Initial test
testKeepAlive();

// Set up periodic testing
setInterval(testKeepAlive, TEST_INTERVAL);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive test stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive test stopped');
  process.exit(0);
}); 