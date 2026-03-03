const http = require('http');
const { URL } = require('url');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.TELEGRAM_NOTIFY_PORT || 3001;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
}

const sendTelegram = async message => {
  if (!TOKEN || !CHAT_ID) return { ok: false, error: 'Missing token or chat id' };
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (data.ok) {
      console.log('✅ Message sent to Telegram successfully');
    } else {
      console.error('❌ Telegram API error:', data);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Network error sending to Telegram:', error.message);
    return { ok: false, error: error.message };
  }
};

const handleRequest = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method !== 'POST' || url.pathname !== '/notify') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const message = payload.message || 'Login continue clicked.';
      console.log('📨 Received notification request');
      const result = await sendTelegram(message);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error('❌ Error processing request:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: error.message }));
    }
  });
};

http.createServer(handleRequest).listen(PORT, () => {
  console.log('\n🤖 ================================');
  console.log('   Telegram Notification Server');
  console.log('   ================================');
  console.log(`   Port: ${PORT}`);
  console.log(`   Bot Token: ${TOKEN ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Chat ID: ${CHAT_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log('   ================================\n');
  
  if (!TOKEN || !CHAT_ID) {
    console.error('⚠️  WARNING: Telegram credentials missing in .env file!\n');
  }
});
