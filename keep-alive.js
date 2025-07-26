const https = require('https');
const http = require('http');

// Configuration
const APP_URL = process.env.APP_URL; // Replace with your actual Render URL
const PING_INTERVAL = 10 * 1000; // 10 seconds

function pingApp() {
  const url = new URL(APP_URL);
  const protocol = url.protocol === 'https:' ? https : http;
  
  const req = protocol.get(APP_URL + '/health', (res) => {
    console.log(`[${new Date().toISOString()}] Health check response: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ App is alive and responding');
    } else {
      console.log('⚠️ App responded but with non-200 status');
    }
  });

  req.on('error', (err) => {
    console.error(`❌ Error pinging app: ${err.message}`);
  });

  req.setTimeout(10000, () => {
    console.error('❌ Request timeout');
    req.destroy();
  });
}

// Start the keep-alive process
console.log(`🚀 Starting keep-alive service for: ${APP_URL}`);
console.log(`⏰ Pinging every ${PING_INTERVAL / 1000} seconds`);

// Initial ping
pingApp();

// Set up periodic pinging
setInterval(pingApp, PING_INTERVAL);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive service stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive service stopped');
  process.exit(0);
}); 