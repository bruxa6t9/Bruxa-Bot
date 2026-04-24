const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "1.2",
    author: "Rakib Adil + Loid Butter",
    countDown: 8,
    role: 2,
    shortDescription: "Manage friend requests",
    longDescription: "Accept or delete friend requests via a nice reply format",
    category: "Utility",
  },

  onReply: async function ({  Reply, event, api }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;
    const args = event.body.toLowerCase().trim().split(/\s+/);

    clearTimeout(Reply.unsendTimeout); // Stop auto-unsend timer

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.floor(Math.random() * 100000).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    let action;
    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
      action = "Accepted";
    } else if (args[0] === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
      action = "Deleted";
    } else {
      return api.sendMessage("❌ Please use: add/del <number|all>", event.threadID, event.messageID);
    }

    let targetIDs = args.slice(1);
    if (targetIDs[0] === "all") {
      targetIDs = listRequest.map((_, i) => (i + 1).toString());
    }

    const success = [], failed = [];

    for (const index of targetIDs) {
      const req = listRequest[parseInt(index) - 1];
      if (!req) {
        failed.push(`Invalid index: ${index}`);
        continue;
      }

      form.variables.input.friend_requester_id = req.node.id;
      form.variables = JSON.stringify(form.variables);
      try {
        const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        const json = JSON.parse(res);
        if (json.errors) {
          failed.push(`❌ ${req.node.name}`);
        } else {
          success.push(`✅ ${req.node.name}`);
        }
      } catch (err) {
        failed.push(`❌ ${req.node.name}`);
      }
      form.variables = JSON.parse(form.variables); // Reset
    }

    const response = 
`✨ ${action} ${success.length} friend request(s):

${success.join("\n")}

${failed.length > 0 ? `⚠️ Failed for ${failed.length}:\n${failed.join("\n")}` : ""}`;

    api.sendMessage(response, event.threadID, event.messageID);
    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    try {
      const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const listRequest = JSON.parse(res).data.viewer.friending_possibilities.edges;

      if (!listRequest.length) {
        return api.sendMessage("✅ No pending friend requests.", event.threadID, event.messageID);
      }

      let msg = `👥 Pending Friend Requests:\n━━━━━━━━━━━━━━━\n`;
      listRequest.forEach((user, i) => {
        msg += `\n${i + 1}. ${user.node.name}\nID: ${user.node.id}\nProfile: ${user.node.url.replace("www.facebook", "fb")}\nTime: ${moment(user.time * 1009).tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss")}\n`;
      });

      msg += `\n⚙️ | Reply with:\nadd <number|all>\nor\ndel <number|all>\nto manage requests.`;

      api.sendMessage(msg, event.threadID, (err, info) => {
        global.BruxaBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          unsendTimeout: setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, module.exports.config.countDown * 20000)
        });
      }, event.messageID);
    } catch (err) {
      api.sendMessage("❌ Failed to fetch friend requests.", event.threadID, event.messageID);
    }
  }
};