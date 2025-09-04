# Production Deployment Guide

## Common Production Issues & Solutions

### 1. 🔑 **Environment Variables**

**Frontend (.env.production or deployment environment):**
```bash
# CRITICAL: Set the correct production API URL
NEXT_PUBLIC_API_URL=https://api.formcraft.digital/api/v1

# CRITICAL: Add your production Gemini API key
GEMINI_API_KEY=your_production_gemini_api_key_here
```

**Backend (production environment):**
```bash
PORT=8080
MONGO_URI=mongodb://your-production-mongodb-uri
DATABASE_NAME=formbuilder

# Optional: JWT secrets for production
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
```

### 2. 🌐 **CORS Configuration**

The backend CORS is configured for:
- `https://www.formcraft.digital`
- `https://formcraft.digital`
- `http://localhost:3000`
- `http://localhost:3001`

**If your production domain is different, update the backend CORS origins.**

### 3. 🛡️ **HTTPS/SSL Issues**

Common problems:
- **Mixed Content**: Production HTTPS frontend calling HTTP backend
- **Certificate Issues**: Self-signed or expired certificates
- **Protocol Mismatch**: Ensure API_URL uses `https://` in production

### 4. 📝 **Build & Runtime Issues**

**Potential Problems:**
1. **Missing API Routes**: Ensure `/api/ai/*` routes are deployed
2. **Server-Side Environment**: `GEMINI_API_KEY` must be available at build time AND runtime
3. **Static Generation**: AI routes are dynamic and need server runtime

**Solution - Check your next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes work in production
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  },
  // For server-side functionality
  output: 'standalone', // if using container deployment
}
```

### 5. 🤖 **Gemini API Issues**

**Debug Steps:**
1. Verify API key is set in production environment
2. Check API quota/limits on Google AI Studio
3. Ensure network access to Google's APIs
4. Check for API key restrictions (HTTP referrers, IP restrictions)

**Test API Key:**
```bash
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
```

### 6. 🗄️ **Database Connection**

**MongoDB Issues:**
- Network restrictions (IP whitelist)
- Connection string format
- Authentication credentials
- Database/collection permissions

### 7. 📊 **Deployment Platform Specific**

**Vercel:**
```bash
# Add environment variables in Vercel dashboard
GEMINI_API_KEY=your_key
NEXT_PUBLIC_API_URL=https://your-backend-url/api/v1
```

**Docker:**
```dockerfile
# Ensure environment variables are passed
ENV GEMINI_API_KEY=your_key
ENV NEXT_PUBLIC_API_URL=https://api.formcraft.digital/api/v1
```

**Railway/Render:**
- Add environment variables in platform settings
- Ensure health checks don't timeout during AI requests

## 🔍 Production Debugging

### Check API Endpoints
```bash
# Test production API health
curl https://api.formcraft.digital/api/v1/health

# Test AI form generation
curl -X POST https://your-frontend-domain/api/ai/generate-form \
  -H "Content-Type: application/json" \
  -d '{"description":"contact form"}'
```

### Browser Console Debugging
1. Open browser DevTools (F12)
2. Check Network tab for failed requests
3. Look for CORS errors in Console
4. Check if environment variables are undefined

### Server Logs
- Check deployment platform logs
- Look for "GEMINI_API_KEY" undefined errors
- Check for network/timeout errors to Google APIs

## 🚀 Quick Production Fixes

### Fix 1: Environment Variable Issues
```bash
# Verify in your deployment platform
echo $GEMINI_API_KEY
echo $NEXT_PUBLIC_API_URL
```

### Fix 2: API URL Mismatch
In your deployment platform, ensure:
- `NEXT_PUBLIC_API_URL` points to your actual backend
- Backend is deployed and accessible
- No trailing slashes in URLs

### Fix 3: CORS Problems
Update backend main.go if needed:
```go
// Add your production domain
origins := []string{
    "https://www.yourdomain.com",
    "https://yourdomain.com",
    "https://www.formcraft.digital",
    "https://formcraft.digital",
}
```

### Fix 4: Missing Dependencies
```bash
# Ensure all dependencies are installed
npm ci
# Check if @google/generative-ai is installed
npm list @google/generative-ai
```

## ✅ Production Verification Checklist

- [ ] Environment variables set correctly
- [ ] API endpoints responding (health check)
- [ ] CORS configured for production domain
- [ ] HTTPS/SSL working properly
- [ ] Database connection established
- [ ] AI form generation API working
- [ ] Form submission working
- [ ] All static assets loading

## 🆘 Emergency Debugging

If everything fails, try these steps:

1. **Deploy without AI features first**
   - Comment out AI-related code temporarily
   - Verify basic form functionality works

2. **Test AI endpoints separately**
   - Create a simple test page that just calls the AI API
   - Check if the issue is with AI integration or overall deployment

3. **Check deployment logs**
   - Look for build-time vs runtime errors
   - Check for out-of-memory or timeout errors

4. **Rollback and redeploy**
   - Sometimes a fresh deployment fixes caching issues
   - Clear build cache if available

## 📞 Need Help?

If you're still having issues, share:
1. Deployment platform (Vercel, Railway, etc.)
2. Error messages from browser console
3. Server logs from your platform
4. Your current environment variable setup (without sensitive values)