import { TriggerClient, cron } from "@trigger.dev/sdk";

// Initialize Trigger.dev client
const client = new TriggerClient({
  id: "blogify-health-check",
  apiKey: process.env.TRIGGER_API_KEY,
});

// Health check job that runs every 5 minutes
export const healthCheckJob = client.defineJob({
  id: "health-check",
  name: "Health Check Job",
  version: "1.0.0",
  trigger: cron("*/5 * * * *"), // Every 5 minutes
  run: async (payload, io, ctx) => {
    const appUrl = process.env.APP_URL || "https://your-app-url.onrender.com";
    
    io.logger.info(`🔍 Starting health check for: ${appUrl}`);
    
    try {
      // Make HTTP request to health endpoint
      const response = await fetch(`${appUrl}/health`, {
        method: "GET",
        headers: {
          "User-Agent": "Trigger.dev-Health-Check/1.0",
        },
        timeout: 10000, // 10 second timeout
      });
      
      const statusCode = response.status;
      const responseTime = Date.now();
      
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
          
          // Log success metrics
          await io.logger.info("📈 Health check successful", {
            statusCode,
            responseTime,
            uptime: data.uptime,
            environment: data.environment,
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
        
        // You could add alerting here (email, Slack, etc.)
        await io.logger.error("🚨 App health check failed - manual intervention may be required", {
          statusCode,
          url: appUrl,
          timestamp: new Date().toISOString(),
        });
      }
      
    } catch (error) {
      // Network or other error
      io.logger.error("💥 Health check error", {
        error: error.message,
        url: `${appUrl}/health`,
        timestamp: new Date().toISOString(),
      });
      
      // You could add alerting here for critical failures
      await io.logger.error("🚨 Critical health check failure", {
        error: error.message,
        url: appUrl,
        timestamp: new Date().toISOString(),
      });
    }
  },
});

// Export the client for use in your app
export default client; 