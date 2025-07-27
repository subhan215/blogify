// Test script to verify scheduling mechanism
const PING_INTERVAL = 10 * 1000; // 10 seconds
let counter = 0;

function testPing() {
  counter++;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔄 Test ping #${counter} executed`);
  
  // Simulate a health check
  setTimeout(() => {
    console.log(`[${new Date().toISOString()}] ✅ Test ping #${counter} completed successfully`);
  }, 1000);
}

console.log('🧪 Starting scheduling test...');
console.log(`⏰ Will ping every ${PING_INTERVAL / 1000} seconds`);

// Initial ping
testPing();

// Set up periodic pinging
const testInterval = setInterval(() => {
  try {
    testPing();
  } catch (error) {
    console.error('❌ Error in test interval:', error);
  }
}, PING_INTERVAL);

// Stop after 1 minute (6 pings)
setTimeout(() => {
  console.log('\n🛑 Test completed after 1 minute');
  clearInterval(testInterval);
  console.log(`📊 Total pings executed: ${counter}`);
  process.exit(0);
}, 60000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test stopped by user');
  clearInterval(testInterval);
  console.log(`📊 Total pings executed: ${counter}`);
  process.exit(0);
}); 