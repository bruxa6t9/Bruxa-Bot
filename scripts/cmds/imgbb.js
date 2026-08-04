const axios = require('axios');

module.exports = {
  config: {
    name: 'imgbb',
    aliases: ['ibb'],
    version: '1.2',
    author: 'Rakib Adil',
    countDown: 5,
    role: 0,
    usePrefix: false,
    premium: false,
    shortDescription: 'Upload image to Imgbb',
    longDescription: 'Upload image to Imgbb by replying to an image. this is a no prefix command maked by Rakib Adil',
    category: 'tools',
    guide: 'Reply to an image to upload it.'
  },
  
  onStart: async function({ api, event }) {
    const imageUrl = event.messageReply?.attachments[0]?.url;
    if (!imageUrl) return api.sendMessage('Please reply to an image.', event.threadID, event.messageID);
    
    try {
      const res = await axios.get(
        `https://bruxas-api.vercel.app/api/upload?url=${encodeURIComponent(
          imageUrl
        )}`
      );
      const { image } = res.data;
      
      api.setMessageReaction(
        '🔗',
        event.messageID,
        () => {},
        true
      );
      
      return await api.sendMessage(image, event.threadID, event.messageID);
    } catch (error) {
      console.log(error);
      return api.sendMessage(
        'Failed to upload image to Imgbb.',
        event.threadID,
        event.messageID
      );
    }
  }
};