# CareDock Deployment Guide

## 🚀 Deploy to Railway (Recommended)

### Prerequisites
- GitHub account
- Railway account (free signup at railway.app)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your CareDock repository
5. Railway will automatically detect it's a Python app

### Step 3: Set Environment Variables
In Railway dashboard, go to Variables and add:
- `DEEPSEEK_API_KEY`: Your DeepSeek API key
- `DATABASE_URL`: Railway will provide this automatically if you add MySQL
- `JWT_SECRET_KEY`: Generate a secure random string

### Step 4: Add Database
1. In Railway, click "Add Service"
2. Choose "MySQL"
3. Railway will automatically set DATABASE_URL

### Step 5: Update Frontend API Base
Update your frontend JavaScript files to use the Railway URL instead of localhost.

## 🌐 Alternative Options

### Heroku
- Similar process to Railway
- Free tier available
- Good documentation

### DigitalOcean App Platform
- More advanced features
- Starts at $5/month
- Great for scaling

### AWS/Google Cloud
- Most powerful but complex
- Pay-as-you-use pricing
- Requires more technical knowledge

## 📱 Frontend Hosting
You can also host the frontend separately on:
- Vercel (free)
- Netlify (free)
- GitHub Pages (free, static only)

## 🔒 Security Considerations
- Use environment variables for all secrets
- Enable HTTPS (most platforms do this automatically)
- Set up proper CORS settings
- Consider rate limiting for APIs

## 📊 Monitoring
- Set up uptime monitoring
- Monitor database usage
- Check API response times
- Set up error logging
