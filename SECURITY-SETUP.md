# Security Setup Guide

## Overview

Your server now includes advanced security features:

- ✅ **Express framework** - Modern, secure routing
- ✅ **Rate limiting** - Prevents brute force attacks
- ✅ **Helmet security headers** - Protects against common vulnerabilities
- ✅ **IP blocking** - Block malicious IPs
- ✅ **User-agent filtering** - Block bots and scanners
- ✅ **hCaptcha protection** - Optional human verification (disabled by default)

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the servers**:
   - Use the batch file: `start-servers.bat`
   - Or manually:
     ```bash
     node server.js
     node telegram-notify.js
     ```

3. **Access your site**:
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
   - Health check: http://localhost:3000/health

## hCaptcha Setup (Optional)

hCaptcha is **DISABLED by default**. To enable it:

### 1. Get hCaptcha Keys

1. Go to https://dashboard.hcaptcha.com/
2. Sign up for a free account
3. Create a new site
4. Get your:
   - **Site Key** (public)
   - **Secret Key** (private)

### 2. Configure Site Key

Edit `login.html` (line ~53):
```html
<div class="h-captcha" data-sitekey="YOUR_HCAPTCHA_SITE_KEY"></div>
```
Replace `YOUR_HCAPTCHA_SITE_KEY` with your actual site key.

### 3. Configure Secret Key

Option A - Using .env file (recommended):
```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your secret key
HCAPTCHA_SECRET=your_secret_key_here
```

Option B - Direct in code:
Edit `server.js` (line ~15):
```javascript
const HCAPTCHA_SECRET = "your_secret_key_here";
```

### 4. Restart Server

Stop and restart the server. You should see:
```
🛡️  hCaptcha: ✅ ENABLED
```

## Security Configuration

### IP Blocking

Edit `server.js` (line ~17):
```javascript
const blockedIPs = ["123.45.67.89", "10.0.0.1"]; // Add IPs to block
```

### User-Agent Blocking

Edit `server.js` (line ~19-25):
```javascript
const blockedAgents = [
  /curl/i,
  /wget/i,
  /scanner/i,
  /nikto/i,
  // Add more patterns here
];
```

⚠️ **Warning**: Don't block common browsers or you'll block real users!

### Rate Limiting

Two levels of rate limiting are configured:

**Login endpoints** (strict):
- 10 requests per 15 minutes
- Applies to: `/login`, `/reset-password`

**All other endpoints** (lenient):
- 100 requests per minute
- Applies to: everything else

To adjust, edit `server.js` (lines ~45-62).

## Testing

1. **Test without hCaptcha**:
   - Should work normally
   - Check health endpoint: http://localhost:3000/health
   - Should show: `{"status":"OK","captcha":false}`

2. **Test with hCaptcha**:
   - Enable hCaptcha (see above)
   - Restart server
   - Health endpoint should show: `{"status":"OK","captcha":true}`
   - Login form should show captcha widget

3. **Test rate limiting**:
   - Try submitting login form 11 times in 15 minutes
   - Should see: "Too many attempts, please try again later."

4. **Test IP blocking**:
   - Add your IP to `blockedIPs` array
   - Restart server
   - Should see: "Access denied"

## Security Best Practices

1. **Use HTTPS in production** - Never run sensitive sites on HTTP
2. **Use environment variables** - Don't commit secrets to git
3. **Monitor logs** - Check for suspicious activity
4. **Update dependencies** - Run `npm audit` regularly
5. **Use strong passwords** - For your Telegram bot and server

## Troubleshooting

### hCaptcha not showing

- Check browser console for errors
- Verify site key is correct in `login.html`
- Check network tab for hCaptcha API calls

### hCaptcha verification fails

- Verify secret key is correct in `.env` or `server.js`
- Check server logs for error messages
- Ensure hCaptcha API is reachable

### Rate limiting too strict

- Increase `max` value in rate limiter config
- Increase `windowMs` for longer time window

### Blocking legitimate users

- Review `blockedAgents` patterns
- Check `blockedIPs` array
- Review server logs for blocked requests

## Additional Hardening (Future)

Want even more security? Consider:

1. **Per-route rate limits** - Different limits for different endpoints
2. **Request logging** - Log all requests with timestamps
3. **JWT/session tokens** - Implement proper authentication
4. **Database integration** - Store credentials in encrypted database
5. **Fail2ban integration** - Automatic IP blocking
6. **SSL/TLS certificates** - Use Let's Encrypt for HTTPS
7. **DDoS protection** - Use Cloudflare or similar

Need help implementing these? Let me know!
