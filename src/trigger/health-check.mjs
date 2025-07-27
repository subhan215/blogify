import { logger, schedules } from "@trigger.dev/sdk/v3";

export const healthCheckTask = schedules.task({
  id: "health-check",
  // Set maxDuration to 30 seconds for health checks
  maxDuration: 30,
  // Declarative schedule - runs every 5 minutes
  cron: "*/5 * * * *",
  run: async (payload, { ctx }) => {
    const appUrl = process.env.APP_URL || "https://blogify-htyd.onrender.com";
    
    // Log schedule information
    logger.log("🔍 Starting scheduled health check", { 
      appUrl,
      scheduledTime: payload.timestamp,
      lastRun: payload.lastTimestamp,
      timezone: payload.timezone,
      scheduleId: payload.scheduleId,
      upcoming: payload.upcoming
    });
    
    try {
      // Make HTTP request to health endpoint
      const response = await fetch(`${appUrl}/health`, {
        method: "GET",
        headers: {
          "User-Agent": "Trigger.dev-Health-Check/1.0",
        },
      });
      
      const statusCode = response.status;
      
      logger.log("📊 Health check response", { statusCode });
      
      if (statusCode === 200) {
        // Try to parse JSON response
        try {
          const data = await response.json();
          logger.log("✅ App is healthy", {
            status: data.status,
            uptime: data.uptime,
            environment: data.environment,
            timestamp: data.timestamp,
          });
          
          return {
            success: true,
            statusCode,
            data,
            timestamp: new Date().toISOString(),
          };
          
        } catch (parseError) {
          logger.warn("⚠️ Health check succeeded but couldn't parse JSON response", {
            statusCode,
            error: parseError.message,
          });
          
          return {
            success: true,
            statusCode,
            warning: "Could not parse JSON response",
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        // Health check failed
        logger.error("❌ Health check failed", {
          statusCode,
          statusText: response.statusText,
          url: `${appUrl}/health`,
        });
        
        return {
          success: false,
          statusCode,
          statusText: response.statusText,
          url: `${appUrl}/health`,
          timestamp: new Date().toISOString(),
        };
      }
      
    } catch (error) {
      // Network or other error
      logger.error("💥 Health check error", {
        error: error.message,
        url: `${appUrl}/health`,
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: false,
        error: error.message,
        url: `${appUrl}/health`,
        timestamp: new Date().toISOString(),
      };
    }
  },
}); 