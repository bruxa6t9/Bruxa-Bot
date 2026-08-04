const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

const API_URL = "https://raw.githubusercontent.com/bruxa6t9/BRUXA-BOT-UTILITIES/refs/heads/main/apiUrls.json";
const CACHE_DIR = path.join(__dirname, "cache");
const apiKey = global.GoatBot?.config?.bruxaApiKey;

let cachedApiBase = null;

async function getApiBase() {
	if (cachedApiBase) return cachedApiBase;
	const res = await axios.get(API_URL, { timeout: 10000 });
	if (!res.data?.api) throw new Error("apiUrls.json is missing the 'api' field");
	cachedApiBase = res.data.api;
	return cachedApiBase;
}

async function fetchSongAudio(videoUrl) {
	const apiBase = await getApiBase();
	const res = await axios.get(`${apiBase}/sing`, {
		params: { url: videoUrl },
		responseType: "arraybuffer",
		timeout: 120000,
		headers: {
			"x-api-key": apiKey,
			"Content-Type": "application/json"
		}
	}, );
	return Buffer.from(res.data);
}

function extractApiErrorMessage(err) {
	const raw = err.response?.data;
	if (raw) {
		try {
			const text = Buffer.isBuffer(raw) ? raw.toString("utf-8") : Buffer.from(raw).toString("utf-8");
			const parsed = JSON.parse(text);
			if (parsed?.message) return parsed.message;
		} catch (_) {
			// response wasn't JSON — fall through to err.message
		}
	}
	return err.message;
}

function saveAudioToTempFile(buffer) {
	if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
	const file = path.join(CACHE_DIR, `sing_${Date.now()}.mp3`);
	fs.writeFileSync(file, buffer);
	return file;
}

async function sendSong(message, video, captionExtra) {
	const audioBuffer = await fetchSongAudio(video.url);
	const file = saveAudioToTempFile(audioBuffer);
	
	try {
		await message.reply({
			body: `🎶 ${video.title}\n${captionExtra}🕒 ${video.timestamp}`,
			attachment: fs.createReadStream(file)
		});
	} finally {
		try {
			fs.unlinkSync(file);
		} catch (err) {
			console.error("[sing] cleanup error:", err.message);
		}
	}
}

module.exports = {
	config: {
		name: "sing",
		aliases: ["song"],
		version: "3.1.1",
		author: "Bruxa | Rakib Adil",
		role: 0,
		category: "music",
		description: "search mudic by name.."
	},
	
	onStart: async function({ message, args, event, usersData }) {
	
		const query = args.join(" ");
		if (!query) return message.reply("❌ Enter song name");
		
		const userName = await usersData.getName(event.senderID);
		const processing = await message.reply(`⏳ Searching "${query}"...`);
		
		try {
			const search = await yts(query);
			if (!search.videos.length) {
				await message.unsend(processing.messageID);
				return message.reply("❌ No results found");
			}
			
			const top = search.videos.slice(0, 6);
			let msg = `🔍 Results for "${query}"\n\n`;
			const att = [];
			
			top.forEach(async (v, i) => {
				msg += `${i + 1}. ${v.title}\n 🕒${v.timestamp}\n\n`;
			
			const { data: s} = await axios.get(v.thumbnail, {
				responseType: 'stream',
				timeout: 10000
			});
			
			att.push(s);
			});
			msg += "👉 Reply with number";
			
			await message.unsend(processing.messageID);
			
			return message.reply( { body: msg, attachment: att }, (err, info) => {
				global.BruxaBot.onReply.set(info.messageID, {
					commandName: module.exports.config.name,
					author: event.senderID,
					videos: top
				});
			});
		} catch (e) {
			console.error(e);
			await message.unsend(processing.messageID);
			return message.reply("❌ Error: " + e.message);
		}
	},
	
	onReply: async function({ message, event, Reply, usersData }) {
		if (event.senderID !== Reply.author) {
			return message.reply("⚠️ Not your request");
		}
		
		const choice = parseInt(event.body);
		if (isNaN(choice) || choice < 1 || choice > Reply.videos.length) {
			return message.reply("❌ Invalid choice");
		}
		
		const video = Reply.videos[choice - 1];
		const userName = await usersData.getName(event.senderID);
		const dlMsg = await message.reply(`⬇️ Downloading: ${video.title}`);
		
		try {
			await sendSong(message, video, `👤 Requested by: ${userName}\n`);
		} catch (err) {
			console.error(err);
			return message.reply("❌ Download failed: " + extractApiErrorMessage(err));
		} finally {
			await message.unsend(dlMsg.messageID);
		}
	}
};