const axios = require("axios");

module.exports = {
  config: {
    name: "spy",
    version: "2.0",
    author: "Rakib Adil x Shikaki",
    countDown: 30,
    role: 0,
    shortDescription: "Get user info with avatar",
    longDescription: "Get profile info by mention, UID, or reply",
    category: "image",
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) uid = match[1];
      }
    }

    if (!uid) {
      uid = event.type === "message_reply"
        ? event.messageReply.senderID
        : uid2 || uid1;
    }

    api.getUserInfo(uid, async (err, userInfo) => {
      if (err) return message.reply("Failed to fetch user information.");

      const avatarUrl = await usersData.getAvatarUrl(uid);

      const user = userInfo[uid];
      const genderText = user.gender === 1 ? "👧 Girl"
                       : user.gender === 2 ? "👦 Boy"
                       : "⚧️ Unknown";

      const birthday = user.birthday ? `🎂 ${user.birthday}` : "❌ Not available";
      const userType = user.type === "User" ? "👤 Regular User" : `🧑‍💼 ${user.type}`;

      const info = 
`╔═════『 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 』═════╗
║ 🆔 UID: ${uid}
║ 📝 Name: ${user.name}
║ 🌐 Profile: ${user.profileUrl}
║ 🧬 Gender: ${genderText}
║ 🧾 Type: ${userType}
║ 👫 Friend: ${user.isFriend ? "✅ Yes" : "❌ No"}
║ 🎉 Birthday Today: ${user.isBirthday ? "✅ Yes" : "❌ No"}
║ 📅 Birthday Date: ${birthday}
╚═════════════════════╝`;

      message.reply({
        body: info,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });
    });
  }
};