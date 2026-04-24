const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "2.0.1",
    author: "NTKhang || Rakib",
    countDown: 5,
    role: 0,
    description: "Change or view the bot prefix (thread/system)",
    category: "config",
    guide: {
      en: "   {pn} <new prefix>: change new prefix in your box chat" +
        "\n   Example:" +
        "\n    {pn} #" +
        "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)" +
        "\n   Example:" +
        "\n    {pn} # -g" +
        "\n\n   {pn} reset: change prefix in your box chat to default"
    }
  },
  
  langs: {
    en: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only Rakib can change prefix of system bot",
      confirmGlobal: "Please react to this message to confirm change prefix of system bot",
      confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
      successGlobal: "Changed prefix of system bot to: %1",
      successThisThread: "Changed prefix in your box chat to: %1",
      myPrefix: "🌐 System prefix: %1\n🛸 Your box chat prefix: %2\n🌩️ baka yare"
    }
  },
  
  onStart: async function({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0])
      return message.SyntaxError();
    
    if (args[0] == 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.BruxaBot.config.prefix));
    }
  
    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };
    
    if (args[1] === "-g")
      if (role < 2)
        return message.reply(getLang("onlyAdmin"));
      else
        formSet.setGlobal = true;
    else
      formSet.setGlobal = false;
    
    return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
      formSet.messageID = info.messageID;
      global.BruxaBot.onReaction.set(info.messageID, formSet);
    });
  },
  
  onReaction: async function({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author)
      return;
    if (setGlobal) {
      global.BruxaBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
message.unsend(Reaction.messageID);
    }
    else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },
  
  onChat: async function({ event, message, getLang }) {
    
    
    if (event.body && event.body.toLowerCase() === "prefix")
      return () => {
        return message.reply({
          body: getLang("myPrefix", global.BruxaBot.config.prefix, utils.getPrefix(event.threadID))
        });
      };
  }
};