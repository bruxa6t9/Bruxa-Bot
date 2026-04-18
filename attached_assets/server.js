const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const MONGO_URI =
  'mongodb+srv://rakib_adil:dbpass22@rakib-bby-api.dijqvo0.mongodb.net/BruxaBotUsers';
mongoose.connect(MONGO_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('MongoDB connected'));

// Create new user
app.post('/api/create-user', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'API key is required' });

    const existing = await db.collection('apikeys').findOne({ apiKey });
    if (existing)
      return res.status(400).json({ error: 'API key already exists' });

    await db.collection('apikeys').insertOne({
      apiKey,
      botName: 'Not registered yet',
      prefix: '/',
      adminUids: [],
      email: '',
      password: '',
      language: 'en',
      timeZone: 'N/A',
      usedRequests: 0,
      remainingRequests: 10000,
      freeRemainingRequests: 10000,
      status: 'offline',
      lastSeen: null,
      createdAt: new Date()
    });

    res.json({ status: 'success', message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('apikeys').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete('/api/users/:apiKey', async (req, res) => {
  try {
    await db.collection('apikeys').deleteOne({ apiKey: req.params.apiKey });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register bot info
app.post('/api/register', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'No API key' });

    const user = await db.collection('apikeys').findOne({ apiKey });
    if (!user) return res.status(401).json({ error: 'Invalid API key' });

    const { botName, prefix, adminUids, email, password, timeZone, language } = req.body;

    await db.collection('apikeys').updateOne(
      { apiKey },
      {
        $set: {
          botName: botName || user.botName,
          prefix: prefix || user.prefix,
          adminUids: adminUids || user.adminUids,
          email: email || user.email,
          password: password || user.password,
          timeZone: timeZone || user.timeZone,
          language: language || user.language,
          status: 'online',
          lastSeen: new Date()
        }
      }
    );

    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Heartbeat
app.post('/api/heartbeat', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'No API key' });

    const user = await db.collection('apikeys').findOne({ apiKey });
    if (!user) return res.status(401).json({ error: 'Invalid API key' });

    await db.collection('apikeys').updateOne(
      { apiKey },
      { $set: { status: 'online', lastSeen: new Date() } }
    );

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark offline if no heartbeat in 1 minute
setInterval(async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    await db.collection('apikeys').updateMany(
      { lastSeen: { $lt: oneMinuteAgo } },
      { $set: { status: 'offline' } }
    );
  } catch (err) {
    console.error('Offline check error:', err.message);
  }
}, 30000);

// Middleware only for /api/info — tracks request usage
async function trackUsage(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'No API key' });

    const user = await db.collection('apikeys').findOne({ apiKey });
    if (!user) return res.status(401).json({ error: 'Invalid API key' });

    if (user.remainingRequests <= 0)
      return res.status(429).json({ error: 'No remaining requests' });

    await db.collection('apikeys').updateOne(
      { apiKey },
      { $inc: { usedRequests: 1, remainingRequests: -1 } }
    );

    const updated = await db.collection('apikeys').findOne({ apiKey });
    res.locals.user = updated;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function setHeaders(res) {
  const u = res.locals.user;
  res.set('x-remaining-requests', String(u.remainingRequests));
  res.set('x-free-remaining-requests', String(u.freeRemainingRequests));
  res.set('x-used-requests', String(u.usedRequests));
}

app.get('/api/info', trackUsage, (req, res) => {
  setHeaders(res);
  res.json({ status: 'success', data: res.locals.user });
});

app.listen(3000, () => console.log('API running on port 3000'));
