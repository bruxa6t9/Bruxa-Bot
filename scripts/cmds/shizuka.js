const axios = require('axios');
const rakibapis = new global.utils.RakibApis();
const getRakibBase = async () => `${rakibapis.apiUrl}/shizuka`;
const rakibApiKey = global.BruxaBot?.config?.bruxaApiKey || process.env.RAKIB_API_KEY;

const API_TIMEOUT_MS = 8000;
const http = axios.create({ timeout: API_TIMEOUT_MS });

const autoReplies = [
  'vag vai bukachuda eshe geche 🏃‍♂️🏃‍♀️',
  'হুম জান বলো 😚',
  'eto baby boilo na lojja lage🙈',
  'কি হইছে বলো তাড়াতাড়ি😒',
  'জান বাল ফালাবা?🙂',
  'এতো ডাকিস কেন?🙄',
  'জান পাট খেতে যাবা?🙂',
  'message my owner m.me/RAKIB.404X 🙂',
  'কি বলবি বল?😒',
  'তোর চাকর নাকি, এতো চিল্লাস কেন?😒',
  'তোর জন্য একটা গল্প আছে!',
  'kicche eto dakos kn..😾?',
  '😍😘',
  '🐰🐦'
];

const autoEmojis = ['👀','🫶','🫦','😍','😘','🥵','👽','😻','😽','💗','🤡','😾','🙈','💅','🐸','🐰'];
const keywords = ['bot', 'bby', 'baby', 'shizuka', 'bbe', 'বট', 'বেবি'];
const MIN_AUTOLEARN_LENGTH = 2;
const TEACH_HEADERS = { headers: { "x-api-key": rakibApiKey } };

const sendMessage = (api, threadID, message, messageID) =>
  api.sendMessage(message, threadID, (err) => {
    if (err) console.log('[SHIZUKA] sendMessage failed:', err);
  }, messageID);

const cError = (api, threadID, messageID) =>
  sendMessage(api, threadID, 'API Error! Please try again later..', messageID);

const delayTyping = async (api, threadID, time = 1500) => {
  return new Promise(resolve => {
    api.sendTypingIndicator(threadID, true);
    setTimeout(() => {
      api.sendTypingIndicator(threadID, false);
      resolve();
    }, time);
  });
};

const userName = async (api, uid) => {
  try {
    const info = await api.getUserInfo(uid);
    if (!info) return 'Unknown';
    return info?.name || info[uid]?.name || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

const startsWithEmojis = (text = '') => /^[^\p{L}\p{N}\s]/u.test(text);

const reactSafely = (api, messageID, emoji) => {
  if (!emoji) return;
  try {
    api.setMessageReaction(emoji, messageID, () => {}, true);
  } catch (reactErr) {
    console.log('[SHIZUKA] reaction failed, message already sent:', reactErr?.message || reactErr);
  }
};

global.temp = global.temp || {};
global.temp.autoLearnCache = global.temp.autoLearnCache || {};
const AUTOLEARN_TTL = 5 * 60 * 1000;

const isAutoLearnOn = async (threadID, forceRefresh = false) => {
  const cached = global.temp.autoLearnCache[threadID];
  if (!forceRefresh && cached && Date.now() - cached.ts < AUTOLEARN_TTL) return cached.value;

  try {
    const rakib = await getRakibBase();
    const res = await http.get(`${rakib}/autolearn?threadID=${threadID}`);
    const value = res.data?.autoLearn !== false;
    global.temp.autoLearnCache[threadID] = { value, ts: Date.now() };
    return value;
  } catch {
    return true;
  }
};

const setAutoLearn = async (threadID, enabled) => {
  const rakib = await getRakibBase();
  await http.post(`${rakib}/autolearn`, { threadID, enabled });
  global.temp.autoLearnCache[threadID] = { value: enabled, ts: Date.now() };
};

const chatWithBot = async (api, threadID, messageID, senderID, input) => {
  try {
    const rakib = await getRakibBase();

    if (!input || input.trim().length === 0) {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      await delayTyping(api, threadID);
      return api.sendMessage(reply, threadID, (err, info) => {
        if (err) console.log('[SHIZUKA] sendMessage failed:', err);
        if (!info?.messageID) return;
        global.BruxaBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: 'reply'
        });
      }, messageID);
    }

    const res = await http.get(`${rakib}/chat?text=${encodeURIComponent(input)}&font=3&apikey=${rakibApiKey}`);
    const replyFromAPI = res.data?.reply || '';
    const source = res.data?.source;
    await delayTyping(api, threadID);

    const autoLearnOn = source === 'teachPrompt' ? await isAutoLearnOn(threadID) : false;

    return api.sendMessage(replyFromAPI, threadID, (err, info) => {
      if (err) console.log('[SHIZUKA] sendMessage failed:', err);
      if (!info?.messageID) return;
      global.BruxaBot.onReply.set(info.messageID, {
        commandName: module.exports.config.name,
        type: 'reply',
        author: senderID,
        pendingAsk: autoLearnOn ? input : null
      });
    }, messageID);

  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const teachBot = async (api, threadID, messageID, senderID, teach) => {
  const dashIndex = teach.indexOf('-');
  if (dashIndex === -1)
    return sendMessage(api, threadID, 'Format: teach <ask1>, <ask2> - <ans1>, <ans2>', messageID);

  const askPart = teach.slice(0, dashIndex).trim();
  const valuePart = teach.slice(dashIndex + 1).trim();

  if (!askPart || !valuePart)
    return sendMessage(api, threadID, 'Missing ask or value.', messageID);

  const askArray = askPart.split(',').map(a => a.trim()).filter(Boolean);
  const valueArray = valuePart.split(',').map(a => a.trim()).filter(Boolean);

  if (!askArray.length)
    return sendMessage(api, threadID, 'Please provide at least one question.', messageID);
  if (!valueArray.length)
    return sendMessage(api, threadID, 'Please provide at least one answer.', messageID);

  try {
    const rakib = await getRakibBase();
    await http.post(`${rakib}/teach`, { ask: askArray, answers: valueArray, uid: senderID }, TEACH_HEADERS);
    await delayTyping(api, threadID);

    const askList = askArray.map(a => `"${a}"`).join(' or ');
    const ansList = valueArray.map(a => `"${a}"`).join(', ');
    return sendMessage(
      api, threadID,
      `Learned! When someone says ${askList}, I might reply with ${ansList}.\n(An answer that's entirely emoji is kept as the reply itself — trailing emoji on TEXT still join the shared reply-flavor pool. Say the answer back later and I'll give you the trigger.)`,
      messageID
    );

  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const removeTaught = async (api, threadID, messageID, ask) => {
  if (!ask) return sendMessage(api, threadID, 'Format: remove <trigger>', messageID);
  try {
    const rakib = await getRakibBase();
    const res = await http.delete(`${rakib}/teach`, { ...TEACH_HEADERS, data: { ask } });
    await delayTyping(api, threadID);
    return sendMessage(api, threadID, res.data.message, messageID);
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const removeSingleResponse = async (api, threadID, messageID, body) => {
  const dashIndex = body.indexOf('-');
  if (dashIndex === -1)
    return sendMessage(api, threadID, 'Format: rm <trigger> - <index>', messageID);

  const ask = body.slice(0, dashIndex).trim();
  const index = body.slice(dashIndex + 1).trim();
  if (!ask || !index)
    return sendMessage(api, threadID, 'Format: rm <trigger> - <index>', messageID);

  try {
    const rakib = await getRakibBase();
    const res = await http.delete(`${rakib}/teach`, { ...TEACH_HEADERS, data: { ask, index } });
    await delayTyping(api, threadID);
    return sendMessage(api, threadID, res.data.message, messageID);
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const editTaught = async (api, threadID, messageID, body) => {
  const dashIndex = body.indexOf('-');
  if (dashIndex === -1)
    return sendMessage(api, threadID, 'Format: edit <trigger> - <newAnswer>', messageID);

  const ask = body.slice(0, dashIndex).trim();
  const newAnswer = body.slice(dashIndex + 1).trim();
  if (!ask || !newAnswer)
    return sendMessage(api, threadID, 'Format: edit <trigger> - <newAnswer>', messageID);

  try {
    const rakib = await getRakibBase();
    const res = await http.put(`${rakib}/teach`, { ask, newAnswer }, TEACH_HEADERS);
    await delayTyping(api, threadID);
    return sendMessage(api, threadID, res.data.message, messageID);
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const showAllTeach = async (api, threadID, messageID) => {
  try {
    const rakib = await getRakibBase();
    const res = await http.get(`${rakib}/allteach?apikey=${rakibApiKey}`);
    const { totalTeachCount, totalReactCount, totalQsn, recent } = res.data;
    await delayTyping(api, threadID);

    const recentLine = recent?.length
      ? `\n\nLast few I've picked up:\n${recent.map((r, i) => `${i + 1}. "${r.trigger}" (${r.responseCount} response${r.responseCount === 1 ? '' : 's'})`).join('\n')}`
      : '';

    return sendMessage(
      api, threadID,
      `I know ${totalQsn} thing${totalQsn === 1 ? '' : 's'} to say, with ${totalTeachCount} total responses and ${totalReactCount || 0} emoji in the shared pool.${recentLine}`,
      messageID
    );
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const showTeachers = async (api, threadID, messageID) => {
  try {
    const rakib = await getRakibBase();
    const res = await http.get(`${rakib}/teacher?apikey=${rakibApiKey}`);

    if (!res.data?.teachers || !Array.isArray(res.data.teachers) || res.data.teachers.length === 0)
      return sendMessage(api, threadID, 'No teachers found..', messageID);

    let list = [];
    for (const [i, t] of res.data.teachers.entries()) {
      const name = await userName(api, t._id);
      list.push(`${i + 1}. ${name} → ${t.teaches}`);
    }

    await delayTyping(api, threadID);
    return sendMessage(api, threadID, `👨‍🏫 Teachers:\n${list.join('\n')}`, messageID);

  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const searchMsg = async (api, threadID, messageID, askedText) => {
  if (!askedText.length)
    return sendMessage(api, threadID, 'Format: msg <search term>', messageID);

  try {
    const rakib = await getRakibBase();
      const res = await http.get(`${rakib}/msg?msg=${encodeURIComponent(askedText)}&font=1&apikey=${rakibApiKey}`);
    const { matches, count } = res.data;

    if (!matches?.length)
      return sendMessage(api, threadID, `No matches for "${askedText}".`, messageID);

    const lines = matches.map((m, i) => {
      const preview = m.previewAnswers.join(', ');
      const more = m.totalAnswers > m.previewAnswers.length ? ` (+${m.totalAnswers - m.previewAnswers.length} more)` : '';
      return `${i + 1}. "${m.trigger}" → ${preview}${more}`;
    });

    await delayTyping(api, threadID);
    api.sendMessage(
      `Found ${count} match(es) for "${askedText}":\n${lines.join('\n')}`,
      threadID,
      (err, info) => {
        if (err) console.log('[SHIZUKA] sendMessage failed:', err);
        if (!info?.messageID) return;
        setTimeout(() => api.unsendMessage(info.messageID), 15000);
      },
      messageID
    );

  } catch (err) {
    if (err.response?.status === 404) {
      return sendMessage(api, threadID, `No matches for "${askedText}".`, messageID);
    }
    console.log(err);
    return cError(api, threadID, messageID);
  }
};

module.exports = {
  config: {
    name: 'shizuka',
    aliases: ['bby', 'baby'],
    version: '3.3.0',
    author: 'Rakib Adil',
    countDown: 5,
    role: 0,
    category: 'chat',
    description: {
      en: 'Smart chatbot, multi-ask/multi-answer teaching, editing, and passive learning.'
    },
    guide: {
      en: [
        'Chat: {pn} <text>',
        'Teach (single): {pn} teach hi - hello, hey there',
        'Teach (multi): {pn} teach hi, hello, hey - sup, what up, yo',
        'Teach with emoji: {pn} teach 😕 - 🙂 (emoji-only asks and answers both work now)',
        'End a text answer with emoji and it joins the shared reply-flavor pool: {pn} teach hi - hello 😊',
        'Answer-to-trigger: teach hi - hlw, then later saying "hlw" gets you "hi" back (random pick if more than one trigger shares that answer)',
        'Edit: {pn} edit hi - new default reply',
        'Remove a trigger entirely: {pn} remove hi',
        'Remove one response: {pn} rm hi - 2',
        'Search: {pn} msg <term>',
        'All stats: {pn} allteach',
        'Teachers: {pn} teachers',
        'My stats: {pn} mystats',
        'Toggle passive learning: {pn} autolearn on OR {pn} autolearn off OR {pn} autolearn stats',
        '',
        'Autolearn: reply to anything I say and I\'ll quietly learn it as the answer — works even when I\'m just improvising.',
        '',
        'After I learn something, I\'ll ask what\'s next — reply again and the cycle keeps going: answered from what I already know, or learned on the spot if it\'s new.',
        '',
        'No exact match gets a close-match guess before I ever say I don\'t know.',
      ].join('\n')
    }
  },

  onStart: async function ({ api, args, event }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(' ').trim().toLowerCase();
    const cmd = input.match(/^(teachers|teach|allteach|msg|mystats|autolearn|remove|rm|edit)/);

    try {
      if (cmd) {
        const command = cmd[1];
        const rest = input.slice(command.length).trim();

        switch (command) {
          case 'teach': return teachBot(api, threadID, messageID, senderID, rest);
          case 'msg': return searchMsg(api, threadID, messageID, rest);
          case 'allteach': return showAllTeach(api, threadID, messageID);
          case 'teachers': return showTeachers(api, threadID, messageID);
          case 'remove': return removeTaught(api, threadID, messageID, rest);
          case 'rm': return removeSingleResponse(api, threadID, messageID, rest);
          case 'edit': return editTaught(api, threadID, messageID, rest);
          case 'autolearn': {
            if (rest === 'stats') {
              const on = await isAutoLearnOn(threadID, true);
              return sendMessage(api, threadID, `🧠 Autolearn is currently ${on ? 'ON' : 'OFF'} for this thread.`, messageID);
            }
            if (rest !== 'on' && rest !== 'off')
              return sendMessage(api, threadID, 'Format: autolearn on OR autolearn off OR autolearn stats', messageID);
            await setAutoLearn(threadID, rest === 'on');
            return sendMessage(api, threadID, `🧠 Autolearn is now ${rest === 'on' ? 'ON' : 'OFF'} for this thread.`, messageID);
          }
          case 'mystats': {
            const rakib = await getRakibBase();
            const res = await http.get(`${rakib}/mystats?uid=${senderID}`);
            await delayTyping(api, threadID);
            return sendMessage(api, threadID, `🧠 Your Teachings: ${res.data?.yourTeachings || 0}`, messageID);
          }
        }
      }

      return chatWithBot(api, threadID, messageID, senderID, input);

    } catch (error) {
      console.log(error);
      cError(api, threadID, messageID);
    }
  },

  onChat: async function ({ api, event }) {
    try {
      const body = (event.body || '').toLowerCase().trim();
      if (!body) return;
      if (startsWithEmojis(body)) return;

      const keyword = keywords.find(k => body === k || body.startsWith(k + ' '));
      if (!keyword) return;

      const query = body === keyword ? '' : body.slice(keyword.length).trim();

      if (!query) {
        const emoji = autoEmojis[Math.floor(Math.random() * autoEmojis.length)];
        const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

        await delayTyping(api, event.threadID);
        const outgoing = api.sendMessage(reply, event.threadID, (err, info) => {
          if (err) console.log('[SHIZUKA] sendMessage failed:', err);
          if (!info?.messageID) return;
          global.BruxaBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: 'reply'
          });
        }, event.messageID);

        reactSafely(api, event.messageID, emoji);

        return outgoing;
      }

      return chatWithBot(api, event.threadID, event.messageID, event.senderID, query);

    } catch (error) {
      console.log(error);
      return cError(api, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      if (!Reply || Reply.commandName !== module.exports.config.name) return;
      const { senderID, threadID, messageID } = event;
      const userMsg = (event.body || '').trim();
      if (!userMsg) return;

      if (Reply.pendingAsk && userMsg.length >= MIN_AUTOLEARN_LENGTH) {
        try {
          const rakib = await getRakibBase();
          await http.post(`${rakib}/teach`, {
            ask: [Reply.pendingAsk],
            answers: [userMsg],
            uid: senderID
          }, TEACH_HEADERS);

          await delayTyping(api, threadID);
          reactSafely(api, messageID, '🧠');

          return api.sendMessage(
            `Got it — I'll remember to say "${userMsg}" next time someone says "${Reply.pendingAsk}", your next question is?`,
            threadID,
            (err, info) => {
              if (err) console.log('[SHIZUKA] sendMessage failed:', err);
              if (!info?.messageID) return;
              global.BruxaBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: 'reply',
                author: senderID
              });
            },
            messageID
          );
        } catch (error) {
          console.log(error);
          return cError(api, threadID, messageID);
        }
      }

      return chatWithBot(api, threadID, messageID, senderID, userMsg);
    } catch (error) {
      console.log(error);
      return cError(api, event.threadID, event.messageID);
    }
  }
};