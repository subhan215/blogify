import { TriggerClient } from "@trigger.dev/sdk";
import express from "express";

// Import the health check job
import { healthCheckJob } from "./jobs/health-check.js";

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Trigger.dev client
const client = new TriggerClient({
  id: "blogify-health-check",
  apiKey: process.env.TRIGGER_API_KEY,
});

// Register the health check job
client.defineJob(healthCheckJob);

// Health check endpoint for Trigger.dev
app.get("/api/trigger/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Trigger.dev server is running",
    timestamp: new Date().toISOString(),
  });
});

// Trigger.dev webhook endpoint
app.post("/api/trigger", async (req, res) => {
  try {
    const result = await client.handleRequest(req);
    res.json(result);
  } catch (error) {
    console.error("Trigger.dev webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.TRIGGER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Trigger.dev server running on port ${PORT}`);
  console.log(`📊 Health check job scheduled for every 5 minutes`);
});

export default app; 