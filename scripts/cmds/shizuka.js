const axios = require('axios');

const getAPIBase = async () => {
  const base = await axios.get(
    'https://gitlab.com/Rakib-Adil-69/shizuoka-command-store/-/raw/main/apiUrls.json'
  );
  return base.data.rakib;
};

const autoReplies = [
  'vag vai bukachuda eshe geche 🏃‍♂️🏃‍♀️',
  'হুম জান বলো 😚',
  'eto baby boilo na lojja lage🙈',
  'কি হইছে বলো তাড়াতাড়ি😒',
  'জান বাল ফালাবা?🙂',
  'জাবলো..',
  'আমি ন পাট খেতে যাবা?🙂',
  'message my owner m.me/RAKIB.404X 🙂',
  'কি বলবি বল?😒',
  'হুম, কি তোর চাকর নাকি?😒',
  'তোর জন্য একটা গল্প আছে!',
  'kicche eto dakos kn..😾?',
  '😍😘'
];

const autoEmojis = ['👀','🫶','🫦','😍','😘','🥵','👽','😻','😽','💗','🤡','😾','🙈','💅','🐸','🐰'];

const keywords = ['bot', 'bby', 'baby', 'shizuka', 'bbe', 'বট', 'বেবি'];

const sendMessage = (api, threadID, message, messageID) =>
  api.sendMessage(message, threadID, () => {}, messageID);

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
    if (!info) return 'Bolod';
    return (info[uid] && info[uid].name) || Object.values(info)[0]?.name || 'Vondo';
  } catch {
    return 'Bokacda';
  }
};

const startsWithEmojis = (text = '') => /^[^\w\s]/.test(text);

const chatWithBot = async (api, threadID, messageID, senderID, input) => {
  try {
    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.get(`${rakib}/chat?text=${encodeURIComponent(input)}`);

    // ntg..
    if (!input || input.trim().length === 0) {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      await delayTyping(api, threadID);

      return api.sendMessage(reply, threadID, (err, info) => {
        if (!info?.messageID) return;

        global.BruxaBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: 'reply',
        });
      }, messageID);
    }

    const replyFromAPI = res.data?.reply;

    await delayTyping(api, threadID);

   const finalMsg = replyFromAPI || 'Please teach me this sentence! 🦆💨';

    return api.sendMessage(finalMsg, threadID, (err, info) => {
      if (!info?.messageID) return;

      global.BruxaBot.onReply.set(info.messageID, {
        commandName: module.exports.config.name,
        type: 'reply',
        author: senderID
      });
    }, messageID);

  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const teachBot = async (api, threadID, messageID, senderID, teach) => {
  const [ask, answers] = teach.split('-').map(t => (t || '').trim());
  if (!ask || !answers)
    return sendMessage(api, threadID, 'Format: teach <ask> - <ans1>,<ans2>', messageID);

  const answerArray = answers.split(',').map(a => a.trim()).filter(Boolean);
  const an = answerArray.join(', ');

  try {
    const rakib = `${await getAPIBase()}/rakib`;
    await axios.post(`${rakib}/teach`, {
      ask,
      answers: an,
      uid: senderID
    });

    await delayTyping(api, threadID);
    return sendMessage(api, threadID, `Teached!\nAsk: "${ask}"\nAns: "${an}"`, messageID);

  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const showAllTeach = async (api, threadID, messageID) => {
  try {
    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.get(`${rakib}/allteach`);

    const { totalTeachCount, totalQsn } = res.data;

    await delayTyping(api, threadID);
    return sendMessage(
      api,
      threadID,
      `📊 Stats:\n📝 Q: ${totalQsn}\n📚 Teach: ${totalTeachCount}`,
      messageID
    );

  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const showTeachers = async (api, threadID, messageID) => {
  try {
    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.get(`${rakib}/teacher`);

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
    return sendMessage(api, threadID, 'Format: msg <ask>', messageID);

  try {
    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.get(`${rakib}/msg?msg=${encodeURIComponent(askedText)}`);

    const data = res.data;

    if (!Array.isArray(data.ans))
      return sendMessage(api, threadID, 'No messages found..', messageID);

    const msgs = data.ans.map((m, i) => `${i + 1}. ${m}`);

    await delayTyping(api, threadID);

    api.sendMessage(
      `Question: ${data.msg}\n___________\n${msgs.join('\n')}`,
      threadID,
      (err, info) => {
        if (!info?.messageID) return;
        setTimeout(() => api.unsendMessage(info.messageID), 15000);
      },
      messageID
    );

  } catch (err) {
    console.log(err);
    return cError(api, threadID, messageID);
  }
};

module.exports = {
  config: {
    name: 'shizuka',
    aliases: ['bby', 'baby'],
    version: '2.1.10',
    author: 'Rakib Adil',
    countDown: 5,
    role: 0,
    category: 'chat',
    description: {
      en: 'Smart chatbot, better than all simsimi yk. teach, chat, see teachers list, get all teach count & see your stats.'
    },
    guide: {
      en: 'Teach: {pn} teach <ask> - <answer1>,<answer2>   All Teachers: {pn} teachers   Total Teach Stats: {pn} allteach   My Stats: {pn} mystats'
    }
  },

  onStart: async function ({ api, args, event }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(' ').trim();

    const cmd = input.match(/^(teach|msg|allteach|teachers|mystats)/);

    const rakib = `${await getAPIBase()}/rakib`;

    try {
      if (cmd) {
        const command = cmd[1];
        const rest = input.slice(command.length).trim();

        switch (command) {
          case 'teach': return teachBot(api, threadID, messageID, senderID, rest);
          case 'msg': return searchMsg(api, threadID, messageID, rest);
          case 'allteach': return showAllTeach(api, threadID, messageID);
          case 'teachers': return showTeachers(api, threadID, messageID);
          case 'mystats': {
            const res = await axios.get(`${rakib}/mystats?uid=${senderID}`);
            await delayTyping(api, threadID);
            return sendMessage(api, threadID, `🧠 Teachings: ${res.data?.yourTeachings || 0}`, messageID);
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

        api.setMessageReaction(emoji, event.messageID, () => {}, true);
        await delayTyping(api, event.threadID);
        return api.sendMessage(reply, event.threadID, (err, info) => {
          if (!info?.messageID) return;

          global.BruxaBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: 'reply',
          });
        }, event.messageID);
      }

      return chatWithBot(api, event.threadID, event.messageID, event.senderID, query);

    } catch (error) {
      console.log(error);
      return cError(api, event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
  try {
    if (!Reply || Reply.commandName !== module.exports.config.name) return;

    const { senderID, threadID, messageID } = event;
    const userMsg = (event.body || '').trim();
    if (!userMsg) return;

    return chatWithBot(api, threadID, messageID, senderID, userMsg);

  } catch (error) {
    console.log(error);
    return cError(api, event.threadID, event.messageID);
  }
}
};