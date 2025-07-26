# Render Deployment Guide for Blogify

## Overview
This guide explains how to deploy your Blogify application on Render and keep it from auto-sleeping.

## Deployment Steps

### 1. Initial Setup on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `blogify-app` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or upgrade to paid for no sleep)

### 2. Environment Variables
Add these environment variables in your Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will override this)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### 3. Health Check Configuration
- **Health Check Path**: `/health`
- **Health Check Timeout**: `10 seconds`

## Keeping Your App Alive (Free Tier Solutions)

### Option 1: External Monitoring Services (Recommended)

#### Using UptimeRobot (Free)
1. Sign up at [UptimeRobot](https://uptimerobot.com)
2. Add a new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Check Interval**: 5 minutes
   - **Alert When Down**: Yes

#### Using Cron-job.org (Free)
1. Go to [Cron-job.org](https://cron-job.org)
2. Create a new cronjob:
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Schedule**: Every 14 minutes
   - **Timeout**: 10 seconds

#### Using Pingdom (Free tier available)
1. Sign up at [Pingdom](https://pingdom.com)
2. Add a new uptime monitor:
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Check Interval**: 5 minutes

### Option 2: Self-Hosted Keep-Alive Script
If you have another server or VPS running 24/7:

1. Clone this repository on your server
2. Update the `APP_URL` in `keep-alive.js` with your Render URL
3. Run: `npm run keep-alive`

### Option 3: GitHub Actions (Free)
The workflow file `.github/workflows/keep-alive.yml` is already created. To set it up:

1. **Add GitHub Secret**:
   - Go to your GitHub repository
   - Click "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - **Name**: `APP_URL`
   - **Value**: `https://your-app-name.onrender.com` (replace with your actual Render URL)
   - Click "Add secret"

2. **Enable GitHub Actions**:
   - Go to "Actions" tab in your repository
   - The workflow will automatically start running every 14 minutes
   - You can also manually trigger it from the Actions tab

The workflow will automatically ping your app every 14 minutes to keep it alive.

## Paid Solutions

### Render Pro Plan ($7/month)
- No auto-sleep
- Always-on service
- Better performance
- Custom domains

### Render Starter Plan ($25/month)
- No auto-sleep
- Always-on service
- Better performance
- Custom domains
- More resources

## Troubleshooting

### App Not Responding After Sleep
1. Wait 30-60 seconds for the first request to wake up the service
2. Check the health endpoint: `https://your-app-name.onrender.com/health`
3. Monitor logs in Render dashboard

### Health Check Failing
1. Verify your `/health` endpoint is working locally
2. Check if your app is starting correctly
3. Review Render logs for errors

### Environment Variables Issues
1. Ensure all required environment variables are set in Render
2. Check if your MongoDB connection string is correct
3. Verify Cloudinary credentials

## Monitoring Your App

### Render Dashboard
- Monitor logs in real-time
- Check deployment status
- View resource usage

### Health Endpoint
Visit `https://your-app-name.onrender.com/health` to check:
- App status
- Uptime
- Environment information

## Best Practices

1. **Use External Monitoring**: Set up at least one external monitoring service
2. **Monitor Logs**: Regularly check Render logs for errors
3. **Test Health Endpoint**: Ensure `/health` returns 200 status
4. **Set Up Alerts**: Configure notifications for downtime
5. **Consider Upgrading**: For production apps, consider the paid plan

## Cost Comparison

| Service | Cost | Features |
|---------|------|----------|
| Render Free | $0 | Auto-sleep after 15min |
| Render Pro | $7/month | Always-on, no sleep |
| Render Starter | $25/month | Always-on, more resources |
| UptimeRobot | $0 (free tier) | 50 monitors, 5min intervals |
| Cron-job.org | $0 | Unlimited cronjobs |
| Pingdom | $0 (free tier) | 1 monitor, 5min intervals |

## Notes
- Free tier auto-sleep is a Render limitation, not a bug
- The first request after sleep may take 30-60 seconds
- Health checks help ensure your app is working correctly
- Consider upgrading to paid plans for production applications 