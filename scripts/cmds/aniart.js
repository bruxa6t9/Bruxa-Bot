const axios = require('axios');
const fs = require("fs");
const path = require("path");
const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/bruxa6t9/BRUXA-BOT-UTILITIES/refs/heads/main/apiUrls.json");
  return base.data.api;
};

const apiKey = global.GoatBot.config?.bruxaApiKey;

module.exports = {
  config: {
    name: "aniart",
    aliases: ["anigen", "animeart"],
    author: "Rakib Adil",
    version: "1.0.5",
    countDown: 10,
    description: "Generate anime art image from a prompt",
    guide: "{pn} <prompt>",
    category: "image"
  },
  
  onStart: async function({ api, args, event, message }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return api.sendMessage(
      `Please provide a prompt to generate anime art image or use: \n {pn}aniart <prompt> or \n {pn}aniart cyberpunk anime girl`, event.threadID, event.messageID);
    
    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    
    const loadMsg = await api.sendMessage("⏳𝙬𝙖𝙞𝙩 𝙗𝙗𝙮, 𝙮𝙤𝙪𝙧 𝙞𝙢𝙖𝙜𝙚 𝙞𝙨 𝙘𝙧𝙚𝙖𝙩𝙞𝙣𝙜.", event.threadID, event.messageID);
    
    try {
      const baseUrl = await baseApiUrl();
      
      const response = await axios.post(`${baseUrl}/rakib`,
      { inputText: prompt },
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        }
      });
      
      const imageUrl = response.data.resultUrl;
      
      if (!imageUrl) {
        message.reply("no img url found..");
        message.reaction("❌", event.messageID);
      }
      
      const tmpDir = path.join(__dirname, "cache", `rakib_${Date.now()}.png`);
      
      const img = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });
      
      fs.writeFileSync(tmpDir, img.data)
      
     // const adil = imageUrl.split('.').pop().split("?")[0];
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      api.unsendMessage(loadMsg.messageID);
      
      await api.sendMessage({
        body: `Here is your image: ${prompt} `,
        attachment: fs.createReadStream(tmpDir)
      } , event.threadID,() => fs.unlinkSync(tmpDir), event.messageID)
    } catch (err) {
      console.log(err);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.sendMessage(`An error occurred while generating your anime art, please try again later..🙂: ${err}`,
        event.threadID,
        event.messageID);
    };
  }
};