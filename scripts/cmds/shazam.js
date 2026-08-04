const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "https://raw.githubusercontent.com/bruxa6t9/BRUXA-BOT-UTILITIES/refs/heads/main/apiUrls.json";
const CACHE_DIR = path.join(__dirname, "cache");
const apiKey = global.GoatBot.config?.bruxaApiKey;

let cachedApiBase = null;

async function getApiBase() {
	if (cachedApiBase) return cachedApiBase;
	const res = await axios.get(API_URL, { timeout: 10000 });
	if (!res.data?.api) throw new Error("apiUrls.json is missing the 'api' field");
	cachedApiBase = res.data.api;
	return cachedApiBase;
}

function ensureCacheDir() {
	if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function downloadToTempFile(url, extension) {
	ensureCacheDir();
	const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
	const filePath = path.join(CACHE_DIR, `shazam_${Date.now()}.${extension}`);
	fs.writeFileSync(filePath, Buffer.from(res.data));
	return filePath;
}

function cleanupFile(filePath) {
	try {
		if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
	} catch (err) {
		console.error("[shazam] cleanup error:", err.message);
	}
}

module.exports = {
	config: {
		name: "shazam",
		aliases: [],
		version: "3.1.1",
		author: "Bruxa | Rakib Adil",
		countDown: 5,
		role: 0,
		shortDescription: { en: "Identify songs from audio/video" },
		longDescription: { en: "Reply to an audio or video message with !shazam to identify the song" },
		category: "music",
		guide: { en: "Reply to an audio/video with: !shazam or !shazam info for detailed information" }
	},
	
	onStart: async function({ message, args, event, usersData }) {
		const userName = await usersData.getName(event.senderID);
		
		if (!event.messageReply) {
			return message.reply("⚠️ Please reply to an audio or video message with !shazam");
		}
		
		const attachments = event.messageReply.attachments;
		if (!attachments || attachments.length === 0) {
			return message.reply("⚠️ The message you replied to doesn't contain any audio or video.");
		}
		
		const mediaAttachment = attachments.find((att) => att.type === "audio" || att.type === "video");
		if (!mediaAttachment) {
			return message.reply("⚠️ Please reply to a message containing audio or video.");
		}
		
		const showDetailedInfo = args[0]?.toLowerCase() === "info";
		const processingMsg = await message.reply(`🎵 ${userName}, identifying song... Please wait.`);
		
		try {
			const apiBase = await getApiBase();
			
			const { data } = await axios.post(
				`${apiBase}/shazam/recognize`, { url: mediaAttachment.url, type: mediaAttachment.type }, {
					headers: {
						"x-api-key": apiKey,
						"Content-Type": "application/json"
					}
				}, { timeout: 60000 }
			);
			
			await message.unsend(processingMsg.messageID);
			
			if (!data?.success || !data.song) {
				return message.reply("❌ No matches found. The song might not be in Shazam's database.");
			}
			
			return showDetailedInfo ?
				await replyWithDetails(message, data.song) :
				await replyWithBasic(message, data.song);
		} catch (err) {
			console.error(err);
			await message.unsend(processingMsg.messageID);
			const apiMessage = err.response?.data?.message;
			return message.reply("⚠️ Error during recognition: " + (apiMessage || err.message));
		}
	}
};

async function replyWithBasic(message, song) {
	let basicMessage = `✅ Song Found!\n\n🎵 ${song.title}\n👤 ${song.artist}`;
	
	if (!song.previewUrl) {
		basicMessage += `\n\n⚠️ No audio preview available`;
		return message.reply(basicMessage);
	}
	
	let previewPath = null;
	try {
		previewPath = await downloadToTempFile(song.previewUrl, "mp3");
		await message.reply({
			body: basicMessage,
			attachment: fs.createReadStream(previewPath)
		});
	} catch (err) {
		console.error("Audio preview error:", err.message);
		basicMessage += `\n\n⚠️ Audio preview unavailable`;
		await message.reply(basicMessage);
	} finally {
		if (previewPath) setTimeout(() => cleanupFile(previewPath), 5000);
	}
}

async function replyWithDetails(message, song) {
	const minutes = Math.floor(song.durationSeconds / 60);
	const seconds = Math.floor(song.durationSeconds % 60);
	
	let infoMessage = `✅ Song Information\n\n🎵 ${song.title}\n👤 ${song.artist}\n`;
	if (song.album) infoMessage += `💿 ${song.album.name}\n📅 ${song.album.releaseDate}\n`;
	if (song.label) infoMessage += `🏷️ ${song.label}\n`;
	if (song.genre) infoMessage += `🎸 ${song.genre}\n`;
	infoMessage += `⏱️ ${minutes}:${seconds.toString().padStart(2, "0")}`;
	
	const attachments = [];
	const downloadedPaths = [];
	
	if (song.coverArtUrl) {
		try {
			const artPath = await downloadToTempFile(song.coverArtUrl, "jpg");
			attachments.push(fs.createReadStream(artPath));
			downloadedPaths.push(artPath);
		} catch (err) {
			console.error("Cover art error:", err.message);
		}
	}
	
	if (song.previewUrl) {
		try {
			const audioPath = await downloadToTempFile(song.previewUrl, "m4a");
			attachments.push(fs.createReadStream(audioPath));
			downloadedPaths.push(audioPath);
		} catch (err) {
			console.error("Audio preview error:", err.message);
			infoMessage += `\n\n⚠️ Audio preview unavailable`;
		}
	} else {
		infoMessage += `\n\n⚠️ No audio preview available`;
	}
	
	if (attachments.length > 0) {
		await message.reply({ body: infoMessage, attachment: attachments });
	} else {
		await message.reply(infoMessage);
	}
	
	if (downloadedPaths.length > 0) {
		setTimeout(() => downloadedPaths.forEach((p) => cleanupFile(p)), 5000);
	}
}