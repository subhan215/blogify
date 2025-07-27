// Test script for Trigger.dev health check
import { TriggerClient } from "@trigger.dev/sdk";

// Test configuration
const TEST_APP_URL = process.env.APP_URL || "https://your-app-url.onrender.com";

async function testHealthCheck() {
  console.log("🧪 Testing Trigger.dev health check functionality...");
  console.log(`📡 Testing endpoint: ${TEST_APP_URL}/health`);
  
  try {
    // Test the health endpoint directly
    const response = await fetch(`${TEST_APP_URL}/health`, {
      method: "GET",
      headers: {
        "User-Agent": "Trigger.dev-Test/1.0",
      },
      timeout: 10000,
    });
    
    const statusCode = response.status;
    console.log(`📊 Response status: ${statusCode}`);
    
    if (statusCode === 200) {
      try {
        const data = await response.json();
        console.log("✅ Health check successful!");
        console.log("📋 Response data:", {
          status: data.status,
          uptime: data.uptime,
          environment: data.environment,
          timestamp: data.timestamp,
        });
        
        // Test Trigger.dev client initialization
        console.log("\n🔧 Testing Trigger.dev client...");
        const client = new TriggerClient({
          id: "blogify-health-check-test",
          apiKey: process.env.TRIGGER_API_KEY || "test-key",
        });
        
        console.log("✅ Trigger.dev client initialized successfully");
        console.log("📝 Client ID:", client.id);
        
        console.log("\n🎉 All tests passed! Your setup is ready for Trigger.dev deployment.");
        console.log("\n📋 Next steps:");
        console.log("1. Set up your Trigger.dev account");
        console.log("2. Configure environment variables");
        console.log("3. Run: npm run trigger:deploy");
        console.log("4. Monitor health checks in your Trigger.dev dashboard");
        
      } catch (parseError) {
        console.log("⚠️ Health check succeeded but couldn't parse JSON response");
        console.log("Error:", parseError.message);
      }
    } else {
      console.log("❌ Health check failed");
      console.log("Status:", statusCode);
      console.log("Status Text:", response.statusText);
    }
    
  } catch (error) {
    console.error("💥 Test failed with error:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Check if your app is running and accessible");
    console.log("2. Verify the APP_URL environment variable is correct");
    console.log("3. Ensure your app's /health endpoint is working");
    console.log("4. Check network connectivity");
  }
}

// Run the test
testHealthCheck().catch(console.error); 