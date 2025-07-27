import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  id: "blogify-health-check",
  name: "Blogify Health Check",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
  
  // Define your jobs
  jobs: {
    healthCheck: {
      id: "health-check",
      name: "Health Check Job",
      version: "1.0.0",
      trigger: {
        cron: "*/5 * * * *", // Every 5 minutes
      },
    },
  },
  
  // Environment configuration
  environments: {
    development: {
      apiKey: process.env.TRIGGER_API_KEY_DEV,
      endpointUrl: "http://localhost:3000",
    },
    production: {
      apiKey: process.env.TRIGGER_API_KEY_PROD,
      endpointUrl: process.env.APP_URL,
    },
  },
}); 