# Render Deployment Configuration Guide

## Overview
To fix the "Root directory does not exist" error on Render, follow these steps:

## What We've Done
1. **Updated `backend/app.js`** - Now serves the frontend build files as static assets
2. **Created `render.yaml`** - Defines build and deployment configuration
3. **Created `build.sh`** - Script to build the entire application

## Render Dashboard Configuration

### Option 1: Using render.yaml (Recommended if using GitHub)
If you connect your GitHub repo and Render detects `render.yaml`:
- Render will automatically use the configuration from `render.yaml`
- Build Command: `bash build.sh`
- Start Command: `cd backend && npm start`

### Option 2: Manual Configuration in Render Dashboard
If you prefer manual setup in the Render dashboard:

1. **Create New Service → Web Service**
2. **Connect your repository**
3. **Configuration Settings:**
   - **Name:** sopagent
   - **Environment:** Node
   - **Region:** Oregon (or your preferred region)
   - **Branch:** main (or your deployment branch)
   - **Build Command:** 
     ```
     bash build.sh
     ```
   - **Start Command:** 
     ```
     cd backend && npm start
     ```
   - **Root Directory:** Leave blank (it will be auto-detected)

4. **Environment Variables** (in Render dashboard):
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `PORT`: (Render sets this automatically, but Node defaults to 5000 if not set)

## File Structure
```
sopagent/
├── backend/
│   ├── app.js (UPDATED - now serves frontend)
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/
│   ├── dist/ (built by build.sh)
│   ├── src/
│   ├── package.json
│   └── ...
├── render.yaml (NEW - deployment config)
├── build.sh (NEW - build script)
└── ...
```

## How It Works
1. **Build Phase (bash build.sh):**
   - Installs backend dependencies
   - Installs frontend dependencies
   - Builds frontend (creates `frontend/dist/`)

2. **Start Phase (cd backend && npm start):**
   - Starts the Node.js server
   - Server listens on the PORT assigned by Render
   - Backend serves static frontend files from `frontend/dist/`
   - API routes (`/api/*`) work as normal
   - All other routes serve `index.html` for React Router support

## Troubleshooting

### Error: "Root directory does not exist"
- Ensure the **Root Directory** field is blank in Render dashboard
- Check that `build.sh` has execute permissions locally
- Verify the Build Command is set to `bash build.sh`

### Error: "Cannot find module or localhost:3000 shows blank"
- The frontend build didn't complete
- Check Render build logs for compilation errors
- Ensure `frontend/package.json` exists and has `build` script

### Error: "API calls returning 404"
- Your backend routes are correct
- Check MongoDB connection string in Render environment variables
- Verify `MONGODB_URI` is set in Render dashboard

### Error: "Cannot GET /"
- This should not happen with new `app.js`
- Clear browser cache
- Rebuild the application in Render dashboard

## Deployment Steps
1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix Render deployment configuration"
   git push
   ```

2. In Render dashboard:
   - Go to your service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Monitor the build logs

3. Once deployment is complete, your app will be live at: `https://your-service-name.onrender.com`

## Notes
- The first deployment may take a few minutes due to npm installations
- Subsequent deployments will use caching and be faster
- Make sure MongoDB Atlas is accessible from Render (whitelist all IPs or Render's IP)
