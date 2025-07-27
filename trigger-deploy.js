import { TriggerClient, cron } from "@trigger.dev/sdk";

// Initialize Trigger.dev client
const client = new TriggerClient({
  id: "blogify-health-check",
  apiKey: process.env.TRIGGER_API_KEY,
});

// Health check job that runs every 5 minutes
client.defineJob({
  id: "health-check",
  name: "Health Check Job",
  version: "1.0.0",
  trigger: cron("*/5 * * * *"), // Every 5 minutes
  maxDuration: 30, // 30 seconds max duration
  run: async (payload, io, ctx) => {
    const appUrl = process.env.APP_URL || "https://blogify-htyd.onrender.com";
    
    io.logger.info(`🔍 Starting health check for: ${appUrl}`);
    
    try {
      // Make HTTP request to health endpoint
      const response = await fetch(`${appUrl}/health`, {
        method: "GET",
        headers: {
          "User-Agent": "Trigger.dev-Health-Check/1.0",
        },
      });
      
      const statusCode = response.status;
      
      io.logger.info(`📊 Health check response: ${statusCode}`);
      
      if (statusCode === 200) {
        // Try to parse JSON response
        try {
          const data = await response.json();
          io.logger.info("✅ App is healthy", {
            status: data.status,
            uptime: data.uptime,
            environment: data.environment,
            timestamp: data.timestamp,
          });
        } catch (parseError) {
          io.logger.warn("⚠️ Health check succeeded but couldn't parse JSON response", {
            statusCode,
            error: parseError.message,
          });
        }
      } else {
        // Health check failed
        io.logger.error("❌ Health check failed", {
          statusCode,
          statusText: response.statusText,
          url: `${appUrl}/health`,
        });
      }
      
    } catch (error) {
      // Network or other error
      io.logger.error("💥 Health check error", {
        error: error.message,
        url: `${appUrl}/health`,
        timestamp: new Date().toISOString(),
      });
    }
  },
});

console.log("✅ Trigger.dev job defined successfully");
console.log("🚀 Ready for deployment with: npx trigger.dev@latest deploy"); 