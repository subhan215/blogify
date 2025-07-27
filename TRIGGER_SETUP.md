# Trigger.dev Health Check Setup Guide

## Overview
This guide will help you set up Trigger.dev to run health checks every 5 minutes for your Blogify application.

## Prerequisites
1. A Trigger.dev account (sign up at https://trigger.dev)
2. Your app deployed and accessible via HTTPS
3. Node.js and npm installed

## Step 1: Create Trigger.dev Project

1. Go to [Trigger.dev Dashboard](https://cloud.trigger.dev)
2. Create a new project called "blogify-health-check"
3. Note down your Project ID and API Key

## Step 2: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Trigger.dev Configuration
TRIGGER_API_KEY=your_trigger_dev_api_key_here
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_PROJECT_ID=your_project_id_here

# Your App URL
APP_URL=https://your-app-url.onrender.com

# Environment
NODE_ENV=production
```

## Step 3: Deploy the Health Check Job

1. Install the Trigger.dev CLI:
```bash
npm install -g @trigger.dev/cli
```

2. Login to Trigger.dev:
```bash
npx trigger.dev@latest login
```

3. Deploy your jobs:
```bash
npm run trigger:deploy
```

## Step 4: Verify Setup

1. Check your Trigger.dev dashboard to see the deployed job
2. The job should show as "Active" and run every 5 minutes
3. You can manually trigger the job from the dashboard to test it

## Step 5: Monitor Health Checks

1. Go to your Trigger.dev dashboard
2. Click on the "health-check" job
3. View the execution logs to see health check results
4. Set up alerts for failed health checks (optional)

## Job Configuration

The health check job is configured to:
- Run every 5 minutes using cron: `*/5 * * * *`
- Check your app's `/health` endpoint
- Log detailed information about each check
- Handle errors gracefully
- Provide metrics and uptime information

## Customization

You can modify the health check job in `jobs/health-check.js`:

- Change the cron schedule
- Add custom alerting (email, Slack, etc.)
- Modify the health check logic
- Add additional endpoints to check

## Troubleshooting

### Job not running
1. Check your API key is correct
2. Verify the job is deployed successfully
3. Check the Trigger.dev dashboard for errors

### Health checks failing
1. Verify your app URL is correct
2. Check your app's `/health` endpoint is working
3. Ensure your app is accessible from the internet

### Environment variables
1. Make sure all required env vars are set
2. Restart your deployment after changing env vars
3. Check the Trigger.dev dashboard for configuration errors

## Support

- Trigger.dev Documentation: https://trigger.dev/docs
- Trigger.dev Community: https://discord.gg/trigger-dev
- GitHub Issues: Create an issue in this repository 