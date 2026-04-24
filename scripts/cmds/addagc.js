module.exports = {
  config: {
    name: "addagc",
	aliases: ["chatgc"],
    version: "1.0",
    author: "Rakib Adil",
    countDown: 5,
    role: 0,
    shortDescription: "Join the chat group",
    longDescription:  "Join the official Chat Messenger group of Neuralcoe Alliance..", 
    category: "info",
    guide: "use {pn}botgc or {pn} supportgc "
  },

  onStart: async function ({ api, event, threadsData, message }) {
    const supportGroupID = "4282405345413435"; // Messenger group thread ID
    const senderID = event.senderID;
    const senderName = event.senderName || (await api.getUserInfo(senderID))[senderID]?.name || "User";

    try {
      const { members } = await threadsData.get(supportGroupID);
      const alreadyInGroup = members.some(member => member.userID === senderID && member.inGroup);

      if (alreadyInGroup) {
        return message.reply(
          `⚠️ ${senderName}, আপনি ইতিমধ্যেই আড্ডা গ্রুপে যুক্ত আছেন! \n Your already involved in the chatgc`
        );
      }

      await api.addUserToGroup(senderID, supportGroupID);

      return message.reply(
        `✅ ${senderName}, আপনাকে সফলভাবে আড্ডা গ্রুপে যুক্ত করা হয়েছে!\n` +
        `\nদয়া করে গ্রুপে অ্যাক্টিভ থাকুন এবং সমস্যা জানাতে মেসেজ দিন।\n You have been added to the chat gc. If you have any question please feel free to ask 😊 `
      );

    } catch (err) {
      console.error("Error adding user to chat group:", err);
      return message.reply(
        `❌ ${senderName}, আপনাকে আড্ডা গ্রুপে এড করতে ব্যর্থ হয়েছি।\n Faild to add you to chat group` +
        `\n➡️ আমাকে Friend Request পাঠান অথবা আপনার প্রোফাইল আনলক করুন এবং আবার চেষ্টা করুন।\n Sent me friend request or try again and unlock your profile`
      );
    }
  }
};