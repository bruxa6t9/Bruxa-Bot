const axios = require('axios');

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["ibb"],
    version: "1.0",
    author: "Rakib Adil",
    countDown: 5,
    role: 0,
    usePrefix: false,
    premium: false,
    shortDescription: "Upload image to Imgbb",
    longDescription: "Upload image to Imgbb by replying to an image. this is a no prefix command maked by Rakib Adil",
    category: "tools",
    guide: "Reply to an image to upload it."
  },

  onStart: async function ({ api, event }) {

    const imageUrl = event.messageReply?.attachments[0]?.url;
    if (!imageUrl) return api.sendMessage('Please reply to an image.', event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://bruxas-api.vercel.app/api/upload?url=${encodeURIComponent(imageUrl)}`);
      const { image } = res.data;

      return api.sendMessage(`✅ 𝗬𝗼𝘂𝗿 𝗶𝗺𝗮𝗴𝗲 𝘂𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆! 🎉\n\n🔗 𝗵𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗶𝗺𝗮𝗴𝗲 𝗨𝗥𝗟: ${image}\n\n- 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝗥𝗮𝗸𝗶𝗯 𝗔𝗱𝗶𝗹👑`, event.threadID, event.messageID);
    }catch (error) {
      console.log(error);
      return api.sendMessage('Failed to upload image to Imgbb.', event.threadID, event.messageID);
    }
  }
};