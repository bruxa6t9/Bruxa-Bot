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

// Register / update bot info — uses botUids as identifier, auto-creates if new
app.post('/api/register', async (req, res) => {
  try {
    const { botUids, adminUids, botName, botPassword, email, prefix, timeZone, language } = req.body;
    if (!botUids) return res.status(400).json({ error: 'botUids is required' });

    await db.collection('bots').updateOne(
      { botUids },
      {
        $set: {
          botUids,
          adminUids: adminUids || [],
          botName: botName || '',
          botPassword: botPassword || '',
          email: email || '',
          prefix: prefix || '/',
          timeZone: timeZone || 'N/A',
          language: language || 'en',
          status: 'online',
          lastSeen: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bots
app.get('/api/bots', async (req, res) => {
  try {
    const bots = await db.collection('bots').find().toArray();
    res.json(bots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single bot by botUids
app.get('/api/bots/:botUids', async (req, res) => {
  try {
    const bot = await db.collection('bots').findOne({ botUids: req.params.botUids });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    res.json(bot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bot
app.delete('/api/bots/:botUids', async (req, res) => {
  try {
    await db.collection('bots').deleteOne({ botUids: req.params.botUids });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark offline if no update in 1 minute
setInterval(async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    await db.collection('bots').updateMany(
      { lastSeen: { $lt: oneMinuteAgo } },
      { $set: { status: 'offline' } }
    );
  } catch (err) {
    console.error('Offline check error:', err.message);
  }
}, 30000);

app.listen(3000, () => console.log('API running on port 3000'));
