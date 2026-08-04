const axios = require('axios');

const config = {
  name: "quiz",
  aliases: ["qz"],
  version: "1.0.2",
  author: "Rakib Adil",
  role: 0,
  countDown: 3,
  category: "game",
  description: "play quiz game in bengali and win coins..",
  guide: "/quiz"
};

const onStart = async ({ args, message, event }) => {
  let lang = args[0] || 'bn';
  lang = lang.toLowerCase();
  const category = ["bn", "bangla", "en", "english"];
  
  if (!category.includes(lang)) {
    return message.reply('Use: /quiz en or /quiz bn');
  }
  if (lang === 'bangla') lang = 'bn';
  if (lang === 'english') lang = 'en';
  
  const quiz = await axios.get(`https://bruxa-vault.vercel.app/admin/apis?apiKey=bruxa-admin-6251x&fileName=quizzes/${lang}_Quiz.json`);
  const d = quiz.data;
  const data = getRandomQuiz(d);
  const ans = data.answer || data.Answer;
  let msg = `╔─── ¤ ◎ Quiz ◎ ¤ ───╗\n`;
  msg += `➥ ${data.question}\n`;
  msg += `├──────────────────┤\n`;
  msg += `Ꭺ ➙ ${data.A}\n`;
  msg += `Ᏼ ➙ ${data.B}\n`;
  msg += `Ꮯ ➙ ${data.C}\n`;
  msg += `Ꭰ ➙ ${data.D}\n`;
  msg += `├──────────────────┤\n`;
  msg += `Reply with your answer. A, B, C or D\n You have only 40 sec to answer..\n`;
  msg += `╚───────────────────╝`;
  
  message.reply({ body: msg }, (err, info) => {
    if (err) return;
    global.GoatBot.onReply.set(info.messageID, {
      commandName: config.name,
      author: event.senderID,
      messageID: info.messageID,
      type: 'choice',
      attempts: 0,
      ans
    });
    setTimeout(() => {
      message.unsend(info.messageID)
      global.GoatBot.onReply.delete(info.messageID);
    }, 40000);
  });
  
  function getRandomQuiz(catName) {
    return catName[Math.floor(Math.random() * catName.length)];
  }
};

const onReply = async ({ args, message, event, Reply, usersData }) => {
  const { author, messageID, type, attempts, ans } = Reply;
  if (event.senderID !== author) return message.reply("this isn’t' for you nigga..🏳️‍🌈");
  
  if (type === "choice") {
    let a = event.body.trim().toUpperCase();
    const ansWords = ["A", "B", "C", "D"]
    if (!ansWords.includes(a)) return message.reply("Answer with A, B, C or D letter..");
    
    const maxAttempts = 2;
    let newAttempts = attempts + 1;
    
    const userName = await usersData.get(author);
    const money = 300;
    const xp = 120;
    
    if (a === ans.toUpperCase()) {
      await message.unsend(messageID);
      await message.reply(`【🎉】➻ Congrats ${userName.name}! You earned $${money} coins and ${xp} exp`);
      await usersData.set(author, {
        money: userName.money + money,
        exp: userName.exp + xp,
      });
      
      global.GoatBot.onReply.delete(messageID);
    } else {
      if (newAttempts >= maxAttempts) {
        await message.unsend(messageID);
        await message.reply(`｢❌｣ ➸ You've reached max attempts ➩〖${maxAttempts}〗`);
        global.GoatBot.onReply.delete(messageID);
      } else {
        await message.reply(`｢⚠️｣ ⟹ Good try,  you have ${maxAttempts - newAttempts} tries left..`);
        global.GoatBot.onReply.set(messageID, { ...Reply, attempts: newAttempts })
      }
    }
  }
};

module.exports = {
  config,
  onStart,
  onReply
};