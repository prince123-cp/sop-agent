# Render Deployment Setup Guide

## ✅ Code Verification Complete
Your backend code is already correctly configured:

- ✅ `server.js` uses `process.env.MONGODB_URI`
- ✅ `server.js` uses `process.env.PORT`
- ✅ Environment variables are loaded via `config/env.js`

## 📋 Step-by-Step Setup

### Step 1️⃣: Get MongoDB Atlas Connection String

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. Sign in with your account
3. Navigate to **Cluster → Connect**
4. Choose **Drivers** connection method
5. Select **Node.js** driver
6. Copy the connection string that looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sopagent?retryWrites=true&w=majority
   ```
7. **Replace:**
   - `username` with your MongoDB Atlas username
   - `password` with your MongoDB Atlas password
8. **Keep** the database name (e.g., `sopagent`)

**Example:**
```
mongodb+srv://admin:myPassword123@cluster0.abcd1234.mongodb.net/sopagent?retryWrites=true&w=majority
```

---

### Step 2️⃣: Allow Render to Access MongoDB

1. In **MongoDB Atlas**, go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Enter: `0.0.0.0/0` (allows all IPs - secure enough for Render)
4. Click **Confirm**
5. Wait for the status to change to **Active**

---

### Step 3️⃣: Add Environment Variables in Render Dashboard

1. Go to **[Render.com](https://render.com)** and log in
2. Navigate to your **sopagent** service
3. Click **Environment** (or **Settings → Environment**)
4. Add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sopagent?retryWrites=true&w=majority` | From MongoDB Atlas |
| `GEMINI_API_KEY` | Your Google Gemini API key | Get from [aistudio.google.com](https://aistudio.google.com/app/apikeys) |
| `PORT` | `10000` | Optional (Render assigns automatically) |
| `NODE_ENV` | `production` | Recommended |

5. Click **Save Changes**
6. Render will automatically redeploy with the new environment variables

---

### Step 4️⃣: Update Local .env for Testing (Optional)

If you want to test locally with MongoDB Atlas instead of localhost:

Edit `backend/.env`:
```javascript
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sopagent?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key
```

---

### Step 5️⃣: Deploy to Render

**Option A: Automatic (Recommended)**
- Push your code to GitHub
- Render will detect and redeploy automatically
```bash
git add .
git commit -m "Fix MongoDB configuration for Render"
git push origin main
```

**Option B: Manual Deploy in Render Dashboard**
1. Go to your service on Render
2. Click **Manual Deploy** (at the top)
3. Choose **Deploy latest commit**
4. Watch the build logs

---

### Step 6️⃣: Verify Deployment Success

After deployment, check **Render Logs** for these messages:

```
MongoDB connected ✅
Server running on port 10000 ✅
```

If you see errors, check:
- MongoDB connection string is correct
- IP address is whitelisted in MongoDB Atlas
- Username and password are correct
- MONGODB_URI environment variable is set in Render

---

## 🔍 Troubleshooting

| Error | Solution |
|-------|----------|
| `MongoServerError: connect ECONNREFUSED` | Check MongoDB Atlas IP whitelist (0.0.0.0/0) |
| `MongoAuthError: invalid username/password` | Verify MongoDB Atlas credentials |
| `Cannot connect to mongodb.net` | Check internet connection and MongoDB Atlas status |
| `Port already in use` | Use `process.env.PORT` (already done in your code) |
| `Cannot find module 'dotenv'` | Run `npm install` (should be in build.sh) |

---

## 📝 Checklist Before Deploying

- [ ] MongoDB Atlas account created
- [ ] Cluster created in MongoDB Atlas
- [ ] Network Access allows `0.0.0.0/0`
- [ ] Connection string copied and credentials verified
- [ ] Render environment variables added
- [ ] Code pushed to GitHub
- [ ] Render service configured (build & start commands)
- [ ] Logs show "MongoDB connected"

---

## 🚀 Example: Full Deployment Flow

1. **Local Setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Should show: `MongoDB connected` and `Server running on port 5000`

2. **MongoDB Atlas Setup:**
   - Whitelist IP: `0.0.0.0/0`
   - Copy connection string with correct credentials

3. **Render Setup:**
   - Set `MONGODB_URI` env variable
   - Set `GEMINI_API_KEY` env variable
   - Ensure build command: `bash build.sh`
   - Ensure start command: `cd backend && npm start`

4. **Deploy:**
   ```bash
   git push origin main
   ```

5. **Verify:**
   - Check Render logs for success messages
   - Visit `https://your-service-name.onrender.com`

---

## 📞 Support Resources

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Render Docs:** https://render.com/docs
- **Express.js Docs:** https://expressjs.com/
