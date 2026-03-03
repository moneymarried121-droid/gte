# Telegram Notifications Troubleshooting Guide

## Quick Fix Steps

### Step 1: Test Your Telegram Bot
Run this command to test if your bot credentials are working:

```bash
node test-telegram.js
```

You should see:
- ✅ Bot Token and Chat ID detected
- ✅ Test message sent successfully
- A test message appears in your Telegram chat

If this fails, your .env file or bot credentials have an issue.

---

### Step 2: Start Both Servers

**Option A - Easy (Recommended):**
```bash
start-servers.bat
```
This opens TWO windows (one for each server).

**Option B - Manual:**

Terminal 1:
```bash
node telegram-notify.js
```

Terminal 2:
```bash
node server.js
```

---

## Common Issues

### ❌ "Telegram notification error: fetch failed"
**Problem:** telegram-notify.js server is not running on port 3001

**Solution:** 
1. Make sure you started BOTH servers
2. Check Terminal 1 - you should see "Telegram Notification Server" running
3. Use start-servers.bat to ensure both start

---

### ❌ "Missing token or chat id"
**Problem:** .env file is missing or incorrect

**Solution:**
1. Check that .env file exists in the project root
2. Open .env and verify it has:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```
3. No spaces around the = sign
4. No quotes around values

---

### ❌ "Telegram API error: Unauthorized"
**Problem:** Invalid bot token

**Solution:**
1. Create a new bot with @BotFather on Telegram
2. Copy the new token
3. Update .env file with the correct token
4. Restart servers

---

### ❌ "Telegram API error: Chat not found"
**Problem:** Invalid chat ID

**Solution:**
1. Message @userinfobot on Telegram
2. Copy your chat ID (including the minus sign if present)
3. Update .env file
4. Restart servers

---

## Verify Servers Are Running

When both servers are running correctly, you should see:

**Terminal 1 (Telegram Server):**
```
🤖 ================================
   Telegram Notification Server
   ================================
   Port: 3001
   Bot Token: ✅ Configured
   Chat ID: ✅ Configured
   ================================
```

**Terminal 2 (Main Server):**
```
🌐 ================================
   Main Server Started
   ================================
   Main Site:    http://localhost:3000
   Admin Panel:  http://localhost:3000/admin
   Login Page:   http://localhost:3000/login.html
   ================================
```

---

## Testing the Flow

1. Make sure BOTH servers are running
2. Open http://localhost:3000/login.html
3. Fill in a test username and password
4. Click continue/submit
5. Check the terminal windows:
   - Terminal 2 should show: "✅ Telegram notification sent successfully"
   - Terminal 1 should show: "📨 Received notification request" followed by "✅ Message sent to Telegram successfully"
6. Check your Telegram app - you should receive a notification

---

## Still Not Working?

### Check Firewall
Make sure Windows Firewall isn't blocking:
- Node.js
- Port 3000 and 3001

### Check Network
Make sure you have internet connection (needed to reach Telegram API)

### Check Logs
Look at BOTH terminal windows for error messages:
- Red ❌ symbols indicate errors
- Green ✅ symbols indicate success

### Test Direct API Call
Run test-telegram.js to isolate the issue:
```bash
node test-telegram.js
```

If this works but the servers don't send notifications, the issue is with the server communication, not Telegram.

---

## Need to Change Bot Credentials?

1. Edit .env file
2. Update TELEGRAM_BOT_TOKEN and/or TELEGRAM_CHAT_ID
3. Restart BOTH servers
4. Run test-telegram.js to verify

---

## Port Already in Use?

If you see "port already in use" errors:

**Kill processes using those ports:**
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

Then restart servers.
