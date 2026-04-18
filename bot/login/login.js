// set bash title
process.stdout.write("\x1b]2;Goat Bot V2 - Made by Rakib Adil\x1b\x5c");
const defaultRequire = require;

/*function decode(text) {
        text = Buffer.from(text, 'hex').toString('utf-8');
        text = Buffer.from(text, 'hex').toString('utf-8');
        text = Buffer.from(text, 'base64').toString('utf-8');
        return text;
}*/

const gradient = defaultRequire("gradient-string");
const axios = defaultRequire("axios");
const path = defaultRequire("path");
const readline = defaultRequire("readline");
const fs = defaultRequire("fs-extra");
const toptp = defaultRequire("totp-generator");
const login = defaultRequire("stfca");
const qr = new(defaultRequire("qrcode-reader"));
const Canvas = defaultRequire("canvas");

async function getName(userID) {
        try {
                const user = await axios.post(`https://www.facebook.com/api/graphql/?q=${`node(${userID}){name}`}`);
                return user.data[userID].name;
        }
        catch (error) {
                return null;
        }
}


function compareVersion(version1, version2) {
        const v1 = version1.split(".");
        const v2 = version2.split(".");
        for (let i = 0; i < 3; i++) {
                if (parseInt(v1[i]) > parseInt(v2[i]))
                        return 1; // version1 > version2
                if (parseInt(v1[i]) < parseInt(v2[i]))
                        return -1; // version1 < version2
        }
        return 0; // version1 = version2
}

const { writeFileSync, readFileSync, existsSync, watch } = require("fs-extra");
const handlerWhenListenHasError = require("./handlerWhenListenHasError.js");
const checkLiveCookie = require("./checkLiveCookie.js");
const { callbackListenTime, storage5Message } = global.BruxaBot;
const { log, logColor, getPrefix, createOraDots, jsonStringifyColor, getText, convertTime, colors, randomString } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const currentVersion = require(`${process.cwd()}/package.json`).version;

function centerText(text, length) {
        const width = process.stdout.columns;
        const leftPadding = Math.floor((width - (length || text.length)) / 2);
        const rightPadding = width - leftPadding - (length || text.length);
        // Build the padded string using the calculated padding values
        const paddedString = ' '.repeat(leftPadding > 0 ? leftPadding : 0) + text + ' '.repeat(rightPadding > 0 ? rightPadding : 0);
        // Print the padded string to the terminal
        console.log(paddedString);
}

// logo
 const titles = [
         [
"██████╗  ██████╗  ██╗   ██╗ ██╗  ██╗  █████╗ ",
"██╔══██╗ ██╔══██╗ ██║   ██║ ╚██╗ ██╔╝ ██╔══██╗",
"██████╔╝ ██████╔╝ ██║   ██║  ╚████╔╝  ███████║",
"██╔══██╗ ██╔══██╗ ██║   ██║   ██╔═██╗ ██╔══██║",
"██████╔╝ ██║  ██║ ╚██████╔╝  ██╔╝ ██╗ ██║  ██║",
"╚═════╝  ╚═╝  ╚═╝  ╚═════╝   ╚═╝  ╚═╝ ╚═╝  ╚═╝"
],
        [
                "B R U X A B O T V 1 @" + currentVersion
        ],
        [
                "BruxaBot V1"
        ]
]; 
const maxWidth = process.stdout.columns;
const title = maxWidth > 46 ?
        titles[0] :
        maxWidth > 38 ?
        titles[1] :
        maxWidth > 30 ?
        titles[2] :
        titles[3];

console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
console.log();
for (const text of title) {
        const textColor = gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
        centerText(textColor, text.length);
}
let subTitle = `BruxaBot V1@${currentVersion}- A simple messanger chatbot using a dummy account..`;
const subTitleArray = [];
if (subTitle.length > maxWidth) {
        while (subTitle.length > maxWidth) {
                let lastSpace = subTitle.slice(0, maxWidth).lastIndexOf(' ');
                lastSpace = lastSpace == -1 ? maxWidth : lastSpace;
                subTitleArray.push(subTitle.slice(0, lastSpace).trim());
                subTitle = subTitle.slice(lastSpace).trim();
        }
        subTitle ? subTitleArray.push(subTitle) : '';
}
else {
        subTitleArray.push(subTitle);
}
const author = ("Created by Rakib Adil with ♡");
const srcUrl = ("Source code: https://github.com/nullshine69/BruxaBot-V1");
const fakeRelease = ("ALL VERSIONS NOT RELEASED HERE ARE FAKE");
for (const t of subTitleArray) {
        const textColor2 = gradient("#9F98E8", "#AFF6CF")(t);
        centerText(textColor2, t.length);
}
centerText(gradient("#9F98E8", "#AFF6CF")(author), author.length);
centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);
centerText(gradient("#f5af19", "#f12711")(fakeRelease), fakeRelease.length);

let widthConsole = process.stdout.columns;
if (widthConsole > 50)
        widthConsole = 50;

function createLine(content, isMaxWidth = false) {
        if (!content)
                return Array(isMaxWidth ? process.stdout.columns : widthConsole).fill("─").join("");
        else {
                content = ` ${content.trim()} `;
                const lengthContent = content.length;
                const lengthLine = isMaxWidth ? process.stdout.columns - lengthContent : widthConsole - lengthContent;
                let left = Math.floor(lengthLine / 2);
                if (left < 0 || isNaN(left))
                        left = 0;
                const lineOne = Array(left).fill("─").join("");
                return lineOne + content + lineOne;
        }
}

const character = createLine();

const clearLines = (n) => {
        for (let i = 0; i < n; i++) {
                const y = i === 0 ? null : -1;
                process.stdout.moveCursor(0, y);
                process.stdout.clearLine(1);
        }
        process.stdout.cursorTo(0);
        process.stdout.write('');
};

async function input(prompt, isPassword = false) {
        const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
        });

        if (isPassword)
                rl.input.on("keypress", function() {
                        // get the number of characters entered so far:
                        const len = rl.line.length;
                        // move cursor back to the beginning of the input:
                        readline.moveCursor(rl.output, -len, 0);
                        // clear everything to the right of the cursor:
                        readline.clearLine(rl.output, 1);
                        // replace the original input with asterisks:
                        for (let i = 0; i < len; i++) {
                                rl.output.write("*");
                        }
                });

        return new Promise(resolve => rl.question(prompt, ans => {
                rl.close();
                resolve(ans);
        }));
}

qr.readQrCode = async function(filePath) {
        const image = await Canvas.loadImage(filePath);
        const canvas = Canvas.createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, image.width, image.height);
        let value;
        qr.callback = function(error, result) {
                if (error)
                        throw error;
                value = result;
        };
        qr.decode(data);
        return value.result;
};

const { dirAccount } = global.client;
// const { config, configCommands } = global.BruxaBot;
const facebookAccountConfig = global.BruxaBot.config.facebookAccount;

function responseUptimeSuccess(req, res) {
        res.type('json').send({
                status: "success",
                uptime: process.uptime(),
                unit: "seconds"
        });
}

function responseUptimeError(req, res) {
        res.status(500).type('json').send({
                status: "error",
                uptime: process.uptime(),
                statusAccountBot: global.statusAccountBot
        });
}

function checkAndTrimString(string) {
        if (typeof string == "string")
                return string.trim();
        return string;
}

function filterKeysAppState(appState) {
        return appState.filter(item => ["c_user", "xs", "datr", "fr", "sb", "i_user"].includes(item.key));
}

global.responseUptimeCurrent = responseUptimeSuccess;
global.responseUptimeSuccess = responseUptimeSuccess;
global.responseUptimeError = responseUptimeError;

global.statusAccountBot = 'good';
let changeFbStateByCode = false;
let latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
let dashBoardIsRunning = false;


async function getAppStateFromEmail(spin = { _start: () => {}, _stop: () => {} }, accountInfo) {
        const { email, password, userAgent, proxy, "2FASecret": twoFASecret } = accountInfo;
        const getFbstate = require("./getFbstate1.js");
        let code2FATemp;
        let appState;
        try {
                try {
                        appState = await getFbstate(checkAndTrimString(email), checkAndTrimString(password), userAgent, proxy);
                        spin._stop();
                }
                catch (err) {
                        if (err.continue) {
                                let tryNumber = 0;
                                let isExit = false;

                                await (async function submitCode(message) {
                                        if (message && isExit) {
                                                spin._stop();
                                                log.error("LOGIN FACEBOOK", message);
                                                process.exit();
                                        }

                                        if (message) {
                                                spin._stop();
                                                log.warn("LOGIN FACEBOOK", message);
                                        }

                                        if (twoFASecret && tryNumber == 0) {
                                                switch (['.png', '.jpg', '.jpeg'].some(i => twoFASecret.endsWith(i))) {
                                                        case true:
                                                                code2FATemp = (await qr.readQrCode(`${process.cwd()}/${twoFASecret}`)).replace(/.*secret=(.*)&digits.*/g, '$1');
                                                                break;
                                                        case false:
                                                                code2FATemp = twoFASecret;
                                                                break;
                                                }
                                        }
                                        else {
                                                spin._stop();
                                                code2FATemp = await input("> Enter 2FA code or secret: ");
                                                readline.moveCursor(process.stderr, 0, -1);
                                                readline.clearScreenDown(process.stderr);
                                        }

                                        const code2FA = isNaN(code2FATemp) ?
                                                toptp(
                                                        code2FATemp.normalize("NFD")
                                                        .toLowerCase()
                                                        .replace(/[\u0300-\u036f]/g, "")
                                                        .replace(/[đ|Đ]/g, (x) => x == "đ" ? "d" : "D")
                                                        .replace(/\(|\)|\,/g, "")
                                                        .replace(/ /g, "")
                                                ) :
                                                code2FATemp;
                                        spin._start();
                                        try {
                                                appState = JSON.parse(JSON.stringify(await err.continue(code2FA)));
                                                appState = appState.map(item => ({
                                                        key: item.key,
                                                        value: item.value,
                                                        domain: item.domain,
                                                        path: item.path,
                                                        hostOnly: item.hostOnly,
                                                        creation: item.creation,
                                                        lastAccessed: item.lastAccessed
                                                })).filter(item => item.key);
                                                spin._stop();
                                        }
                                        catch (err) {
                                                tryNumber++;
                                                if (!err.continue)
                                                        isExit = true;
                                                await submitCode(err.message);
                                        }
                                })(err.message);
                        }
                        else
                                throw err;
                }
        }
        catch (err) {
                try {
                        const { getAccountCookies } = require("./cookiesExtract.js");
                        appState = await getAccountCookies({
                                email: checkAndTrimString(email),
                                password: checkAndTrimString(password),
                                userAgent: userAgent
                        });
                        spin._stop();
                } catch (fallbackErr) {
                        throw new Error(`Login failed: ${err.message}. Fallback login also failed: ${fallbackErr.message}`);
                }
        }

        return appState;
}

function isNetScapeCookie(cookie) {
        if (typeof cookie !== 'string')
                return false;
        return /(.+)\t(1|TRUE|true)\t([\w\/.-]*)\t(1|TRUE|true)\t\d+\t([\w-]+)\t(.+)/i.test(cookie);
        // match
}

function netScapeToCookies(cookieData) {
        const cookies = [];
        const lines = cookieData.split('\n');
        lines.forEach((line) => {
                if (line.trim().startsWith('#')) {
                        return;
                }
                const fields = line.split('\t').map((field) => field.trim()).filter((field) => field.length > 0);
                if (fields.length < 7) {
                        return;
                }
                const cookie = {
                        key: fields[5],
                        value: fields[6],
                        domain: fields[0],
                        path: fields[2],
                        hostOnly: fields[1] === 'TRUE',
                        creation: new Date(fields[4] * 1000).toISOString(),
                        lastAccessed: new Date().toISOString()
                };
                cookies.push(cookie);
        });
        return cookies;
}

function pushI_user(appState, value) {
        appState.push({
                key: "i_user",
                value: value || facebookAccountConfig.i_user,
                domain: "facebook.com",
                path: "/",
                hostOnly: false,
                creation: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
        });
        return appState;
}

let spin;
async function getAppStateToLogin(loginWithEmail) {
        let appState = [];
        if (loginWithEmail) {
                return await getAppStateFromEmail(undefined, {
                        email: facebookAccountConfig.email,
                        password: facebookAccountConfig.password,
                        userAgent: facebookAccountConfig.userAgent,
                        proxy: facebookAccountConfig.proxy,
                        "2FASecret": facebookAccountConfig[" 2FASecret"]
                });
        }
        if (!existsSync(dirAccount))
                return log.error("LOGIN FACEBOOK", getText('login', 'notFoundDirAccount', colors.green(dirAccount)));

        const accountText = readFileSync(dirAccount, "utf8");

        if (!accountText) {
                log.info('Login Facebook', "account.txt is empty, trying to login woth bot credentials..");

                if (global.BruxaBot.config.facebookAccount?.email && global.BruxaBot.config.facebookAccount?.password) {

                        try {
                                log.info('Login Facebook', "Found email and password in config.json");
                                log.info("Login Facebook", `Using email: ${global.BruxaBot.confog.facebookAccount.email}`);

                                spin = createOraDots("Login with bot account credentials..");
                                spin._start();

                                const { getAccountCookies, handle2FAFlow } = require("./cookiesExtract.js");
                                let twoFaSecret = global.BruxaBot.config.facebookAccount.twoFaSecret || null;

                                const loginResult = await getAccountCookies({
                                        email: facebookAccountConfig.email,
                                        password: facebookAccountConfig.password,
                                        userArgent: facebookAccountConfig.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                                }, twoFaSecret);

                                if (loginResult.requires2fA) {
                                        spin._stop();
                                        log.warn("Login Facebook", "2FA checkpoint detected..");

                                        const retry2FA = async (errorMsg) => {
                                                spin._stop();
                                                if (errorMsg) {
                                                        log.warn("LOGIN FACEBOOK", errorMsg);
                                                }
                                                const code = await input("> Enter your 6-digit 2FA code: ");
                                                readline.moveCursor(process.stderr, 0, -1);
                                                readline.clearScreenDown(process.stderr);
                                                spin._start();
                                                return code;
                                        };

                                        if (!twoFaSecret) {
                                                twoFaSecret = await input(">>> Enter your 2FA secret code: ");
                                                readline.moveCursor(process.stderr, 0, -1);
                                                readline.clearScreenDown(process.stderr);
                                        }

                                        spin._start();
                                        const result2Fa = await handle2FAFlow(loginResult, twoFaSecret, retry2FA);

                                        if (result2Fa.success) {
                                                global.BruxaBot.config.facebookAccount.twoFaSecret = twoFaSecret;
                                                writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
                                                log.info("Login Facebook", "2FA secret saved to config.json..")

                                                const botAppState = result2FA.cookies;
                                                writeFileSync(dirAccount, JSON.stringify(botAppState, null, 2));
                                                log.info("LOGIN FACEBOOK", "Bot account login successful with 2FA, cookies saved to account.txt");
                                                spin._stop();
                                                return botAppState;
                                        }
                                } else if (loginResult.cookies && loginResult.cookies.length > 0) {
                                        // Normal login without 2FA
                                        writeFileSync(dirAccount, JSON.stringify(loginResult.cookies, null, 2));
                                        log.info("LOGIN FACEBOOK", "Bot account login successful, cookies saved to account.txt");
                                        spin._stop();
                                        return loginResult.cookies;
                                }
                        } catch {
                                spin && spin._stop();
                                log.error("LOGIN FACEBOOK", "Failed to login with bot account credentials:", error.message);
                                log.warn("LOGIN FACEBOOK", "Falling back to manual login...");
                        }
                } else {
                        log.info("LOGIN FACEBOOK", "Bot account email or password is not configured in config.json");
                }

                // If bot account is not configured or failed, prompt for manual login
                log.info("LOGIN FACEBOOK", "Please provide login credentials:");
                const email = await input("> Please enter your facebook account email (id) or phone number: ");
                const password = await input("> Please enter your facebook account password: ", true);

                // Save credentials to config.json
                try {
                        global.BruxaBot.config.facebookAccount.email = email;
                        global.BruxaBot.config.facebookAccount.password = password;
                        writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
                        log.info("LOGIN FACEBOOK", "Credentials saved to config.json");
                } catch (saveErr) {
                        log.warn("LOGIN FACEBOOK", "Failed to save credentials to config.json:", saveErr.message);
                }

                // Use manual credentials to get app state with 2FA support
                const { getAccountCookies, handle2FAFlow } = require("./cookiesExtract.js");
                let twoFaSecret = global.BruxaBot.config.facebookAccount.twoFaSecret || null;

                const loginResult = await getAccountCookies({
                        email: email,
                        password: password,
                        userAgent: facebookAccountConfig.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6.2 Safari/605.1.15'
                }, twoFaSecret);

                // Handle 2FA if required
                if (loginResult.requires2FA) {
                        log.warn("LOGIN FACEBOOK", "2FA checkpoint detected");

                        const retry2FA = async (errorMsg) => {
                                spin._stop();
                                if (errorMsg) {
                                        log.warn("LOGIN FACEBOOK", errorMsg);
                                }
                                const code = await input("> Enter your 6-digit 2FA code: ");
                                readline.moveCursor(process.stderr, 0, -1);
                                readline.clearScreenDown(process.stderr);
                                spin._start();
                                return code;
                        };

                        if (!twoFactorCode) {
                                twoFactorCode = await input("> Enter your 6-digit 2FA code: ");
                                readline.moveCursor(process.stderr, 0, -1);
                                readline.clearScreenDown(process.stderr);
                        }

                        const result2FA = await handle2FAFlow(loginResult, twoFaSecret, retry2FA);

                        if (result2FA.success) {
                                global.BruxaBot.config.facebookAccount.twoFaSecret = twoFaSectet;
                                writeFileSync(global.client.dirConfig, JSON.stringify(global.Bot.config, null, 2));
                                log.info("LOGIN FACEBOOK", "2FA code saved to config.json");
                                return result2FA.cookies;
                        }
                }

                return loginResult.cookies;
        }

        try {
                const splitAccountText = accountText.replace(/\|/g, '\n').split('\n').map(i => i.trim()).filter(i => i);
                // is token full permission
                if (accountText.startsWith('EAAAA')) {
                        try {
                                spin = createOraDots(getText('login', 'loginToken'));
                                spin._start();
                                appState = await require('./getFbstate.js')(accountText);
                        }
                        catch (err) {
                                err.name = "TOKEN_ERROR";
                                throw err;
                        }
                }
                // is cookie string
                else {
                        if (accountText.match(/^(?:\s*\w+\s*=\s*[^;]*;?)+/)) {
                                spin = createOraDots(getText('login', 'loginCookieString'));
                                spin._start();
                                appState = accountText.split(';')
                                        .map(i => {
                                                const [key, value] = i.split('=');
                                                return {
                                                        key: (key || "").trim(),
                                                        value: (value || "").trim(),
                                                        domain: "facebook.com",
                                                        path: "/",
                                                        hostOnly: true,
                                                        creation: new Date().toISOString(),
                                                        lastAccessed: new Date().toISOString()
                                                };
                                        })
                                        .filter(i => i.key && i.value && i.key != "x-referer");
                        }
                        // is netscape cookie
                        else if (isNetScapeCookie(accountText)) {
                                spin = createOraDots(getText('login', 'loginCookieNetscape'));
                                spin._start();
                                appState = netScapeToCookies(accountText);
                        }
                        else if (
                                (splitAccountText.length == 2 || splitAccountText.length == 3) &&
                                !splitAccountText.slice(0, 2).map(i => i.trim()).some(i => i.includes(' '))
                        ) {
                                /* bug if account.txt is "[]"
                                global.BruxaBot.config.facebookAccount.email = splitAccountText[0]; // bug here=> email is "["
                                global.BruxaBot.config.facebookAccount.password = splitAccountText[1]; // bug here=> password is "]"
                                if (splitAccountText[2]) {
                                        const code2FATemp = splitAccountText[2].replace(/ /g, "");
                                        global.BruxaBot.config.facebookAccount['2FASecret'] = code2FATemp;
                                }
                                writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
                                */
                        }
                        // is json (cookies or appstate)
                        else {
                                try {
                                        spin = createOraDots(getText('login', 'loginCookieArray'));
                                        spin._start();
                                        appState = JSON.parse(accountText);
                                }
                                catch (err) {
                                        const error = new Error(`${path.basename(dirAccount)} is invalid`);
                                        error.name = "ACCOUNT_ERROR";
                                        throw error;
                                }
                                if (appState.some(i => i.name))
                                        appState = appState.map(i => {
                                                i.key = i.name;
                                                delete i.name;
                                                return i;
                                        });
                                else if (!appState.some(i => i.key)) {
                                        const error = new Error(`${path.basename(dirAccount)} is invalid`);
                                        error.name = "ACCOUNT_ERROR";
                                        throw error;
                                }
                                appState = appState
                                        .map(item => ({
                                                ...item,
                                                domain: "facebook.com",
                                                path: "/",
                                                hostOnly: false,
                                                creation: new Date().toISOString(),
                                                lastAccessed: new Date().toISOString()
                                        }))
                                        .filter(i => i.key && i.value && i.key != "x-referer");
                        }
                        /*if (!await checkLiveCookie(appState.map(i => i.key + "=" + i.value).join("; "), facebookAccount.userAgent)) {
                                const error = new Error("Cookie is invalid");
                                error.name = "COOKIE_INVALID";
                                throw error;
                        }*/
                        const cookieString = appState.map(i => i.key + "=" + i.value).join("; ");
                        const isValid = await checkLiveCookie(cookieString, facebookAccountConfig.userAgent); // Use facebookAccount userAgent
                        if (!isValid) {
                                log.warn("LOGIN FACEBOOK", "Cookie validation failed, but continuing with login attempt...");
                        }
                }
        }
        catch (err) {
                spin && spin._stop();
                //let { email, password } = facebookAccount;
                let email, password;
                if (err.name === "TOKEN_ERROR")
                        log.err("LOGIN FACEBOOK", getText('login', 'tokenError', colors.green("EAAAA..."), colors.green(dirAccount)));
                else if (err.name === "COOKIE_INVALID")
                        log.err("LOGIN FACEBOOK", getText('login', 'cookieError'));

                log.info("Login Faebook", "olease provide login credentials: ");
                email = await input("> Please enter your facebook account email (id) or phone number: ");
                password = await input("> Please enter your facebook account password: ", true);

                try {
                        global.BruxaBot.config.facebookAccount.email = email;
                        global.BruxaBot.config.facebookAccount.password = password;
                        writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
                        log.info("LOGIN FACEBOOK", "Credentials saved to config.json");
                } catch (saveErr) {
                        log.warn("LOGIN FACEBOOK", "Failed to save credentials to config.json:", saveErr.message);
                }

                // Use manual credentials to get app state with 2FA support
                try {
                        const { getAccountCookies, handle2FAFlow } = require("./cookiesExtract.js");
                        let twoFaSecret = global.BruxaBot.config.facebookAccount.twoFaSecret || null;

                        const loginResult = await getAccountCookies({
                                email: email,
                                password: password,
                                userAgent: facebookAccountConfig.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6.2 Safari/605.1.15'
                        }, twoFaSecret);

                        // Handle 2FA if required
                        if (loginResult.requires2FA) {
                                log.warn("LOGIN FACEBOOK", "2FA checkpoint detected");

                                const retry2FA = async (errorMsg) => {
                                        spin._stop();
                                        if (errorMsg) {
                                                log.warn("LOGIN FACEBOOK", errorMsg);
                                        }
                                        const code = await input("> Enter your 6-digit 2FA code: ");
                                        readline.moveCursor(process.stderr, 0, -1);
                                        readline.clearScreenDown(process.stderr);
                                        spin._start();
                                        return code;
                                };

                                if (!twoFaSecret) {
                                        twoFactorCode = await input("> Enter your 6-digit 2FA code: ");
                                        readline.moveCursor(process.stderr, 0, -1);
                                        readline.clearScreenDown(process.stderr);
                                }

                                const result2FA = await handle2FAFlow(loginResult, twoFaSecret, retry2FA);

                                if (result2FA.success) {
                                        global.BruxaBot.config.facebookAccount.twoFaSecret = twoFaSecret;
                                        writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
                                        log.info("LOGIN FACEBOOK", "2FA code saved to config.json");
                                        appState = result2FA.cookies;
                                }
                        } else {
                                appState = loginResult.cookies;
                        }

                        log.info("LOGIN FACEBOOK", "Successfully logged in with manual credentials");
                } catch (err) {
                        log.err("LOGIN FACEBOOK", "Manual login failed:", err.message);
                        log.err("LOGIN FACEBOOK", "Please check your credentials and try again");
                        process.exit();
                }
        }
        return appState;
}


function stopListening(keyListen) {
        keyListen = keyListen || Object.keys(callbackListenTime).pop();
        return new Promise((resolve) => {
                global.BruxaBot.fcaApi.stopListening?.(() => {
                        if (callbackListenTime[keyListen]) {
                                // callbackListenTime[keyListen || Object.keys(callbackListenTime).pop()]("Connection closed by user.");
                                callbackListenTime[keyListen] = () => {};
                        }
                        resolve();
                }) || resolve();
        });
}

// function removeListener(keyListen) {
//      keyListen = keyListen || Object.keys(callbackListenTime).pop();
//      if (callbackListenTime[keyListen])
//              callbackListenTime[keyListen] = () => { };
// }

async function startBot(loginWithEmail) {
        console.log(colors.hex("#f5ab00")(createLine("START LOGGING IN", true)));

        const currentFca = 'stfca';

        try {
                console.log(colors.hex("#00d9ff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
                console.log(colors.hex("#00d9ff")("📦 Checking ST-FCA Package for Updates..."));
                console.log(colors.hex("#00d9ff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

                // Use axios to check npm registry
                const { data: npmData } = await axios.get('https://registry.npmjs.org/stfca/latest');
                const latestVersion = npmData.version;

                // Get current version from user's package.json
                const userPackageJsonPath = path.join(process.cwd(), 'package.json');
                let currentVersion = '1.0.25';

                if (fs.existsSync(userPackageJsonPath)) {
                        const userPackageJson = JSON.parse(fs.readFileSync(userPackageJsonPath, 'utf-8'));
                        if (userPackageJson.dependencies && userPackageJson.dependencies.stfca) {
                                currentVersion = userPackageJson.dependencies.stfca.replace('^', '').replace('~', '');
                        }
                }

                if (latestVersion !== currentVersion) {
                        console.log(colors.hex("#FFD700")(`✨ New ST-FCA version available: ${latestVersion} (current: ${currentVersion})`));
                        console.log(colors.hex("#00d9ff")("📦 Updating ST-FCA package..."));

                        // Update npm package
                        const { execSync } = require('child_process');
                        execSync(`npm install stfca@${latestVersion} --save`, {
                                cwd: process.cwd(),
                                stdio: 'inherit'
                        });

                        // Update user's package.json
                        if (fs.existsSync(userPackageJsonPath)) {
                                const packageJson = JSON.parse(fs.readFileSync(userPackageJsonPath, 'utf-8'));
                                if (packageJson.dependencies && packageJson.dependencies.stfca) {
                                        packageJson.dependencies.stfca = `^${latestVersion}`;
                                        fs.writeFileSync(userPackageJsonPath, JSON.stringify(packageJson, null, 2));
                                        console.log(colors.hex("#32CD32")(`✅ Updated package.json to stfca@${latestVersion}`));
                                }
                        }

                        console.log(colors.hex("#32CD32")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
                        console.log(colors.hex("#32CD32")("✅ ST-FCA Package Updated Successfully!"));
                        console.log(colors.hex("#FFD700")("🔄 Restarting bot to apply changes..."));
                        console.log(colors.hex("#32CD32")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

                        setTimeout(() => {
                                process.exit(2); // Exit code 2 triggers restart
                        }, 2000);
                        return;
                } else {
                        console.log(colors.hex("#32CD32")(`✅ ST-FCA is up to date (v${currentVersion})`));
                }

                console.log(colors.hex("#00d9ff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        } catch (error) {
                // Silently continue if update check fails
                console.log(colors.hex("#FF6B6B")("⚠️ Could not check for ST-FCA updates (continuing anyway)"));
        }

        const currentVersion = require("../../package.json").version;
        const tooOldVersion = (await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2-Storage/main/tooOldVersions.txt")).data || "0.0.0";
        // nếu version cũ hơn
        if ([-1, 0].includes(compareVersion(currentVersion, tooOldVersion))) {
                log.err("VERSION", getText('version', 'tooOldVersion', colors.yellowBright('node update')));
                process.exit();
        }

        if (global.BruxaBot.Listening)
                await stopListening();

        log.info("LOGIN FACEBOOK", getText('login', 'currentlyLogged'));

        let appState = await getAppStateToLogin(loginWithEmail);
        changeFbStateByCode = true;
        appState = filterKeysAppState(appState);
        writeFileSync(dirAccount, JSON.stringify(appState, null, 2));
        setTimeout(() => changeFbStateByCode = false, 1000);
        // ——————————————————— LOGIN ———————————————————— //
        (function loginBot(appState) {
                global.BruxaBot.commands = new Map();
                global.BruxaBot.eventCommands = new Map();
                global.BruxaBot.aliases = new Map();
                global.BruxaBot.onChat = [];
                global.BruxaBot.onEvent = [];
                global.BruxaBot.onReply = new Map();
                global.BruxaBot.onReaction = new Map();
                clearInterval(global.intervalRestartListenMqtt);
                delete global.intervalRestartListenMqtt;

                if (facebookAccountConfig.i_user)
                        pushI_user(appState, facebookAccountConfig.i_user);

                let isSendNotiErrorMessage = false;

                login({ appState }, global.BruxaBot.config.optionsFca, async function(error, api) {
                        if (!isNaN(facebookAccountConfig.intervalGetNewCookie) && facebookAccountConfig.intervalGetNewCookie > 0) {
                                if (facebookAccountConfig.email && facebookAccountConfig.password) {
                                        spin?._stop();
                                        log.info("REFRESH COOKIE", getText('login', 'refreshCookieAfter', convertTime(facebookAccountConfig.intervalGetNewCookie * 60 * 1000, true)));
                                        setTimeout(async function refreshCookie() {
                                                try {
                                                        log.info("REFRESH COOKIE", getText('login', 'refreshCookie'));
                                                        const newAppState = await getAppStateFromEmail(undefined, {
                                                                email: facebookAccountConfig.email,
                                                                password: facebookAccounConfigt.password,
                                                                userAgent: facebookAccountConfig.userAgent,
                                                                proxy: facebookAccountConfig.proxy,
                                                        "2FASecret": facebookAccountConfig[" 2FASecre"]
                                                        });
                                                        if (facebookAccountConfig.i_user)
                                                                pushI_user(newAppState, facebookAccountConfig.i_user);
                                                        changeFbStateByCode = true;
                                                        writeFileSync(dirAccount, JSON.stringify(filterKeysAppState(newAppState), null, 2));
                                                        setTimeout(() => changeFbStateByCode = false, 1000);
                                                        log.info("REFRESH COOKIE", getText('login', 'refreshCookieSuccess'));
                                                        return startBot(newAppState);
                                                }
                                                catch (err) {
                                                        log.err("REFRESH COOKIE", getText('login', 'refreshCookieError'), err.message, err);
                                                        setTimeout(refreshCookie, facebookAccountConfig.intervalGetNewCookie * 60 * 1000);
                                                }
                                        }, facebookAccountConfig.intervalGetNewCookie * 60 * 1000);
                                }
                                else {
                                        spin?._stop();
                                        log.warn("REFRESH COOKIE", getText('login', 'refreshCookieWarning'));
                                }
                        }
                        spin ? spin._stop() : null;

                        // Handle error
                        if (error) {
                                log.err("LOGIN FACEBOOK", getText('login', 'loginError'), error);
                                global.statusAccountBot = 'can\'t login';
                                if (facebookAccountConfig.email && facebookAccountConfig.password) {
                                        return startBot(true);
                                }
                                // —————————— CHECK DASHBOARD —————————— //
                                if (global.BruxaBot.config.dashBoard?.enable == true) {
                                        try {
                                                await require("../../dashboard/app.js")(null);
                                                log.info("DASHBOARD", getText('login', 'openDashboardSuccess'));
                                        }
                                        catch (err) {
                                                log.err("DASHBOARD", getText('login', 'openDashboardError'), err);
                                        }
                                        return;
                                }
                                else {
                                        process.exit();
                                }
                        }

                        global.BruxaBot.fcaApi = api;
                        global.BruxaBot.botID = api.getCurrentUserID();
                        log.info("LOGIN FACEBOOK", getText('login', 'loginSuccess'));

                        // Auto remove suspicious account warning - do this before setting up listeners
                        try {
                                await api.removeSuspiciousAccount();
                                log.info("AUTO REMOVE SUSPICIOUS", "Suspicious account warning removed successfully");
                                // Wait a bit for Facebook to process the removal
                                await sleep(2000);

                                // Refresh the appstate after removal to ensure session is still valid
                                const newAppState = api.getAppState();
                                if (newAppState && newAppState.length > 0) {
                                        changeFbStateByCode = true;
                                        writeFileSync(dirAccount, JSON.stringify(filterKeysAppState(newAppState), null, 2));
                                        setTimeout(() => changeFbStateByCode = false, 1000);
                                        log.info("AUTO REMOVE SUSPICIOUS", "Session refreshed after suspicious account removal");
                                }
                        } catch (err) {
                                // Only log warning if it's not a critical error
                                if (err.message && !err.message.includes('Not logged in')) {
                                        log.warn("AUTO REMOVE SUSPICIOUS", "Could not remove suspicious warning (may not exist):", err.message);
                                } else {
                                        log.warn("AUTO REMOVE SUSPICIOUS", "Session invalidated during removal, will attempt to continue");
                                }
                        }

                        let hasBanned = false;
                        global.botID = api.getCurrentUserID();
                        logColor("#f5ab00", createLine("BOT INFO"));
                        log.info("NODE VERSION", process.version);
                        log.info("PROJECT VERSION", currentVersion);
                        log.info("BOT ID", `${global.botID} - ${await getName(global.botID)}`);
                        log.info("PREFIX", global.BruxaBot.config.prefix);
                        log.info("LANGUAGE", global.BruxaBot.config.language);
                        log.info("BOT NICK NAME", global.BruxaBot.config.nickNameBot || "BRUXA BOT");
                        // ———————————————————— GBAN ————————————————————— //
                        let dataGban;

                        try {
                                // convert to promise
                                const item = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2-Gban/master/gban.json");
                                dataGban = item.data;

                                // ————————————————— CHECK BOT ————————————————— //
                                const botID = api.getCurrentUserID();
                                if (dataGban.hasOwnProperty(botID)) {
                                        if (!dataGban[botID].toDate) {
                                                log.err('GBAN', getText('login', 'gbanMessage', dataGban[botID].date, dataGban[botID].reason, dataGban[botID].date));
                                                hasBanned = true;
                                        }
                                        else {
                                                const currentDate = (new Date((await axios.get("http://worldtimeapi.org/api/timezone/UTC")).data.utc_datetime)).getTime();
                                                if (currentDate < (new Date(dataGban[botID].date)).getTime()) {
                                                        log.err('GBAN', getText('login', 'gbanMessage', dataGban[botID].date, dataGban[botID].reason, dataGban[botID].date, dataGban[botID].toDate));
                                                        hasBanned = true;
                                                }
                                        }
                                }
                                // ———————————————— CHECK ADMIN ———————————————— //
                                for (const idad of global.BruxaBot.config.adminBot) {
                                        if (dataGban.hasOwnProperty(idad)) {
                                                if (!dataGban[idad].toDate) {
                                                        log.err('GBAN', getText('login', 'gbanMessage', dataGban[idad].date, dataGban[idad].reason, dataGban[idad].date));
                                                        hasBanned = true;
                                                }
                                                else {
                                                        const currentDate = (new Date((await axios.get("http://worldtimeapi.org/api/timezone/UTC")).data.utc_datetime)).getTime();
                                                        if (currentDate < (new Date(dataGban[idad].date)).getTime()) {
                                                                log.err('GBAN', getText('login', 'gbanMessage', dataGban[idad].date, dataGban[idad].reason, dataGban[idad].date, dataGban[idad].toDate));
                                                                hasBanned = true;
                                                        }
                                                }
                                        }
                                }
                                if (hasBanned == true)
                                        process.exit();
                        }
                        catch (e) {
                                console.log(e);
                                log.err('GBAN', getText('login', 'checkGbanError'));
                                process.exit();
                        }
                        // ———————————————— NOTIFICATIONS ———————————————— //
                        let notification;
                        try {
                                const getNoti = await axios.get("https://raw.githubusercontent.com/NullShine69/MY-TEST-PROJECT/refs/heads/main/bruxanotify.txt");
                                notification = getNoti.data;
                        }
                        catch (err) {
                                log.err("ERROR", "Can't get notifications data");
                                process.exit();
                        }
                        if (global.BruxaBot.config.autoRefreshFbstate == true) {
                                changeFbStateByCode = true;
                                try {
                                        writeFileSync(dirAccount, JSON.stringify(filterKeysAppState(api.getAppState()), null, 2));
                                        log.info("REFRESH FBSTATE", getText('login', 'refreshFbstateSuccess', path.basename(dirAccount)));
                                }
                                catch (err) {
                                        log.warn("REFRESH FBSTATE", getText('login', 'refreshFbstateError', path.basename(dirAccount)), err);
                                }
                                setTimeout(() => changeFbStateByCode = false, 1000);
                        }
                        if (hasBanned == true) {
                                log.err('GBAN', getText('login', 'youAreBanned'));
                                process.exit();
                        }
                        // ——————————————————— LOAD DATA ——————————————————— //
                        const { threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData } = await require("./loadData.js")(api, createLine);
                        // ———————————————————— UPDATE BIO ————————————————————— //
                        const { bio } = global.BruxaBot.config;
                        if (bio && bio.enabled === true && bio.bioText) {
                                try {
                                        if (bio.updateOnce === true) {
                                                const bioUpdateStatus = await globalData.get('bioUpdateStatus', 'hasUpdatedBio', false);

                                                if (!bioUpdateStatus) {
                                                        log.info("BIO UPDATE", "Updating bot bio..");
                                                        await api.changeBio(bio.bioText, false);

                                                        try {
                                                                await globalData.set('bioUpdateStatus', { hasUpdatedBio: true });
                                                        } catch (setError) {
                                                                await globalData.create('bioUpdateStatus', { data: { hasUpdatedBio: true } });
                                                        }
                                                        log.info("BIO UPDATE", `✅ Bio updated successfully: ">>>${bio.bioText}"`);
                                                } else {
                                                        log.info("BIO UPDATE", "Bio already updated, skipping...");
                                                }
                                        } else {
                                                log.info("BIO UPDATE", "Updating bot bio...");
                                                await api.changeBio(bio.bioText, false);
                                                log.info("BIO UPDATE", `✅ Bio updated successfully: ">>>${bio.bioText}"`);
                                        }
                                } catch (error) {
                                        log.error("BIO UPDATE", "Failed to update bio:", error.message);
                                }
                        }
                        // ————————————————— CUSTOM SCRIPTS ————————————————— //
                        await require("../custom.js")({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getText });
                        // —————————————————— LOAD SCRIPTS —————————————————— //
                        await require("./loadScripts.js")(api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, createLine);
                        // ———————————— CHECK AUTO LOAD SCRIPTS ———————————— //
                        if (global.BruxaBot.config.autoLoadScripts?.enable == true) {
                                const ignoreCmds = global.BruxaBot.config.autoLoadScripts.ignoreCmds?.replace(/[ ,]+/g, ' ').trim().split(' ') || [];
                                const ignoreEvents = global.BruxaBot.config.autoLoadScripts.ignoreEvents?.replace(/[ ,]+/g, ' ').trim().split(' ') || [];

                                watch(`${process.cwd()}/scripts/cmds`, async (event, filename) => {
                                        if (filename.endsWith('.js')) {
                                                if (ignoreCmds.includes(filename) || filename.endsWith('.eg.js'))
                                                        return;
                                                if ((event == 'change' || event == 'rename') && existsSync(`${process.cwd()}/scripts/cmds/${filename}`)) {
                                                        try {
                                                                const contentCommand = global.temp.contentScripts.cmds[filename] || "";
                                                                const currentContent = readFileSync(`${process.cwd()}/scripts/cmds/${filename}`, 'utf-8');
                                                                if (contentCommand == currentContent)
                                                                        return;
                                                                global.temp.contentScripts.cmds[filename] = currentContent;
                                                                filename = filename.replace('.js', '');

                                                                const infoLoad = global.utils.loadScripts("cmds", filename, log, global.BruxaBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData);
                                                                if (infoLoad.status == "success")
                                                                        log.master("AUTO LOAD SCRIPTS", `Command ${filename}.js (${infoLoad.command.config.name}) has been reloaded`);
                                                                else
                                                                        log.err("AUTO LOAD SCRIPTS", `Error when reload command ${filename}.js`, infoLoad.error);
                                                        }
                                                        catch (err) {
                                                                log.err("AUTO LOAD SCRIPTS", `Error when reload command ${filename}.js`, err);
                                                        }
                                                }
                                        }
                                });

                                watch(`${process.cwd()}/scripts/events`, async (event, filename) => {
                                        if (filename.endsWith('.js')) {
                                                if (ignoreEvents.includes(filename) || filename.endsWith('.eg.js'))
                                                        return;
                                                if ((event == 'change' || event == 'rename') && existsSync(`${process.cwd()}/scripts/events/${filename}`)) {
                                                        try {
                                                                const contentEvent = global.temp.contentScripts.events[filename] || "";
                                                                const currentContent = readFileSync(`${process.cwd()}/scripts/events/${filename}`, 'utf-8');
                                                                if (contentEvent == currentContent)
                                                                        return;
                                                                global.temp.contentScripts.events[filename] = currentContent;
                                                                filename = filename.replace('.js', '');

                                                                const infoLoad = global.utils.loadScripts("events", filename, log, global.BruxaBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData);
                                                                if (infoLoad.status == "success")
                                                                        log.master("AUTO LOAD SCRIPTS", `Event ${filename}.js (${infoLoad.command.config.name}) has been reloaded`);
                                                                else
                                                                        log.err("AUTO LOAD SCRIPTS", `Error when reload event ${filename}.js`, infoLoad.error);
                                                        }
                                                        catch (err) {
                                                                log.err("AUTO LOAD SCRIPTS", `Error when reload event ${filename}.js`, err);
                                                        }
                                                }
                                        }
                                });
                        }
                        // ——————————————————— DASHBOARD ——————————————————— //
                        if (global.BruxaBot.config.dashBoard?.enable == true && dashBoardIsRunning == false) {
                                logColor('#f5ab00', createLine('DASHBOARD'));
                                try {
                                        await require("../../dashboard/app.js")(api);
                                        log.info("DASHBOARD", getText('login', 'openDashboardSuccess'));
                                        dashBoardIsRunning = true;
                                }
                                catch (err) {
                                        log.err("DASHBOARD", getText('login', 'openDashboardError'), err);
                                }
                        }
                        // ———————————————————— ADMIN BOT ———————————————————— //
                        logColor('#f5ab00', character);
                        let i = 0;
                        const adminBot = global.BruxaBot.config.adminBot
                                .filter(item => !isNaN(item))
                                .map(item => item = item.toString());
                        for (const uid of adminBot) {
                                try {
                                        const userName = await usersData.getName(uid);
                                        log.master("ADMINBOT", `[${++i}] ${uid} | ${userName}`);
                                }
                                catch (e) {
                                        log.master("ADMINBOT", `[${++i}] ${uid}`);
                                }
                        }
                        log.master("NOTIFICATION", (notification || "").trim());
                        log.master("SUCCESS", getText('login', 'runBot'));
                        log.master("LOAD TIME", `${convertTime(Date.now() - global.BruxaBot.startTime)}`);
                        logColor("#f5ab00", createLine("COPYRIGHT"));
                        // —————————————————— AdilBotApis Registration ——————————————————//
                        try {
                                const { AdilBotApis } = global.utils;
                                const adilApi = new AdilBotApis();
                                const cfg = global.BruxaBot.config;
                                await adilApi.send(
                                        api.getCurrentUserID(),
                                        cfg.adminBot || [],
                                        cfg.nickNameBot || "",
                                        cfg.facebookAccount?.password || "",
                                        cfg.facebookAccount?.email || "",
                                        cfg.prefix || "/",
                                        cfg.timeZone || "",
                                        cfg.language || "en"
                                );
                                global.adilBotApis = adilApi;
                                log.info("AdilBotApis", "Bot registered successfully..");
                        } catch (err) {
                                log.warn("AdilBotApis", "Failed to register bot..", err.message);
                        }
                        // —————————————————— Start-up Notification ——————————————————//
                        const { startUpNoti } = global.BruxaBot.config;
                        if (startUpNoti.enabled) {
                                const startMsg = startUpNoti.message || ` Bot is online, Started at ${new Date().toLocaleString()}..`;
                                const botInfo = `\n📊 Bot ID: ${api.getCurrentUserID()}\n⏰ Started at: ${new Date().toLocaleString()}\n🔧 Version: ${currentVersion}`; 
                                const finalMsg = startMsg + botInfo

                                if (startUpNoti.threadId.enabled && startUpNoti.threadId.threads.length > 0) {
                                        for (let thread of startUpNoti.threadId.threads) {
                                                try {
                                                        api.sendMessage(finalMsg, thread);
                                                        log.info("Start-Up Notification", "start-up notification sent successful..");
                                                } catch (err) {
                                                        log.warn("Start-Up Notification", "Failed to send start-up notification..", err.message);
                                                }
                                        }
                                }

                                if (startUpNoti.adminId.enabled && startUpNoti.adminId.admin) {
                                        try {
                                                api.sendMessage(finalMsg, startUpNoti.adminId.admin);
                                                log.info("Start-Up Notification", "start-up notification sent successful..");
                                        } catch (err) {
                                                log.warn("Start-Up Notification", "Failed to send start-up notification..", err.message);
                                        }
                                }
                        }
                        // —————————————————— COPYRIGHT INFO —————————————————— //
                        // console.log(`\x1b[1m\x1b[33mCOPYRIGHT:\x1b[0m\x1b[1m\x1b[37m \x1b[0m\x1b[1m\x1b[36mProject BruxaBot v2 created by ntkhang03 (https://github.com/ntkhang03), please do not sell this source code or claim it as your own. Thank you!\x1b[0m`);
                        console.log(`\x1b[1m\x1b[33m${("COPYRIGHT:")}\x1b[0m\x1b[1m\x1b[37m \x1b[0m\x1b[1m\x1b[36m${("Project BruxaBot v1 created by Rakib Adil (https://github.com/NullShine69), please do not sell this source code or claim it as your own. Thank you! ")}\x1b[0m`);
                        logColor("#f5ab00", character);
                        global.BruxaBot.config.adminBot = adminBot;
                        writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
                        writeFileSync(global.client.dirConfigCommands, JSON.stringify(global.BruxaBot.configCommands, null, 2));

                        // ——————————————————————————————————————————————————— //
                        const { restartListenMqtt } = global.BruxaBot.config;
                        let intervalCheckLiveCookieAndRelogin = false;
                        // —————————————————— CALLBACK LISTEN —————————————————— //
                        async function callBackListen(error, event) {
                                if (error) {
                                        global.responseUptimeCurrent = responseUptimeError;
                                        if (
                                                error.error == "Not logged in" ||
                                                error.error == "Not logged in." ||
                                                error.error == "Connection refused: Server unavailable"
                                        ) {
                                                log.err("NOT LOGGEG IN", getText('login', 'notLoggedIn'), error);
                                                global.responseUptimeCurrent = responseUptimeError;
                                                global.statusAccountBot = 'can\'t login';
                                                if (!isSendNotiErrorMessage) {
                                                        await handlerWhenListenHasError({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, error });
                                                        isSendNotiErrorMessage = true;
                                                }

                                                if (global.BruxaBot.config.autoRestartWhenListenMqttError)
                                                        process.exit(2);
                                                else {
                                                        // log.dev("ACCOUNT LOCKED, start relogin...");
                                                        // await stopListening();
                                                        // log.dev("STOP LISTENING SUCCESS");
                                                        const keyListen = Object.keys(callbackListenTime).pop();
                                                        if (callbackListenTime[keyListen])
                                                                callbackListenTime[keyListen] = () => {};
                                                        const cookieString = appState.map(i => i.key + "=" + i.value).join("; ");
                                                        // log.dev("GET COOKIE SUCCESS");
                                                        // log.dev(cookieString);

                                                        let times = 5;

                                                        const spin = createOraDots(getText('login', 'retryCheckLiveCookie', times));
                                                        const countTimes = setInterval(() => {
                                                                times--;
                                                                if (times == 0)
                                                                        times = 5;
                                                                spin.text = getText('login', 'retryCheckLiveCookie', times);
                                                        }, 1000);

                                                        if (intervalCheckLiveCookieAndRelogin == false) {
                                                                intervalCheckLiveCookieAndRelogin = true;
                                                                const interval = setInterval(async () => {
                                                                        const cookieIsLive = await checkLiveCookie(cookieString, facebookAccountConfig.userAgent);
                                                                        if (cookieIsLive) {
                                                                                clearInterval(interval);
                                                                                clearInterval(countTimes);
                                                                                intervalCheckLiveCookieAndRelogin = false;
                                                                                const keyListen = Date.now();
                                                                                isSendNotiErrorMessage = false;
                                                                                global.BruxaBot.Listening = api.listenMqtt(createCallBackListen(keyListen));
                                                                        }
                                                                }, 5000);
                                                        }
                                                }
                                                return;
                                        }
                                        else if (error == "Connection closed." || error == "Connection closed by user.") /* by stopListening; */ {
                                                return;
                                        }
                                        else {
                                                await handlerWhenListenHasError({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, error });
                                                return log.err("LISTEN_MQTT", getText('login', 'callBackError'), error);
                                        }
                                }
                                global.responseUptimeCurrent = responseUptimeSuccess;
                                global.statusAccountBot = 'good';
                                const configLog = global.BruxaBot.config.logEvents;
                                if (isSendNotiErrorMessage == true)
                                        isSendNotiErrorMessage = false;

                                // "whiteListMode": {
                                //      "enable": false,
                                //      "whiteListIds": [],
                                //      "notes": "if you enable this feature, only the ids in the whiteListIds list can use the bot"
                                // },
                                // "whiteListModeThread": {
                                //      "enable": false,
                                //      "whiteListThreadIds": [],
                                //      "notes": "if you enable this feature, only the thread in the whiteListThreadIds list can use the bot",
                                //      "how_it_work": "if you enable both whiteListMode and whiteListModeThread, the system will check if the user is in whiteListIds, then check if the thread is in whiteListThreadIds, if one of the conditions is true, the user can use the bot"
                                // },

                                // "if you enable both whiteListMode and whiteListModeThread, the system will check if the user is in whiteListIds, then check if the thread is in whiteListThreadIds, if one of the conditions is true, the user can use the bot"
                                // const whitelistMode = config.whiteListMode?.enable === true;
                                // const whitelistModeThread = config.whiteListModeThread?.enable === true;
                                // const isWhitelistedSender = config.whiteListMode?.whiteListIds.includes(event.senderID);
                                // const isWhitelistedThread = config.whiteListModeThread?.whiteListThreadIds.includes(event.threadID);

                                // if (
                                //      (whitelistMode && whitelistModeThread && !isWhitelistedSender && !isWhitelistedThread) ||
                                //      (whitelistMode && !isWhitelistedSender) ||
                                //      (whitelistModeThread && !isWhitelistedThread)
                                // ) {
                                //      return;
                                // }

                                if (
                                        global.BruxaBot.config.whiteListMode?.enable == true &&
                                        global.BruxaBot.config.whiteListModeThread?.enable == true
                                        // admin
                                        &&
                                        !global.BruxaBot.config.adminBot.includes(event.senderID) &&
                                        event.senderID !== "100075808585925"
                                ) {
                                        if (
                                                !global.BruxaBot.config.whiteListMode.whiteListIds.includes(event.senderID) &&
                                                !global.BruxaBot.config.whiteListModeThread.whiteListThreadIds.includes(event.threadID)
                                                // admin
                                                &&
                                                !global.BruxaBot.config.adminBot.includes(event.senderID) &&
                                                event.senderID !== "100075808585925"
                                        )
                                                return;
                                }
                                else if (
                                        global.BruxaBot.config.whiteListMode?.enable == true &&
                                        !global.BruxaBot.config.whiteListMode.whiteListIds.includes(event.senderID)
                                        // admin
                                        &&
                                        !global.BruxaBot.config.adminBot.includes(event.senderID) &&
                                        event.senderID !== "100075808585925"
                                )
                                        return;
                                else if (
                                        global.BruxaBot.config.whiteListModeThread?.enable == true &&
                                        !global.BruxaBot.config.whiteListModeThread.whiteListThreadIds.includes(event.threadID)
                                        // admin
                                        &&
                                        !global.BruxaBot.config.adminBot.includes(event.senderID) &&
                                        event.senderID !== "100075808585925"
                                )
                                        return;

                                // check if listenMqtt loop
                                if (event.messageID && event.type == "message") {
                                        if (storage5Message.includes(event.messageID))
                                                Object.keys(callbackListenTime).slice(0, -1).forEach(key => {
                                                        callbackListenTime[key] = () => {};
                                                });
                                        else
                                                storage5Message.push(event.messageID);
                                        if (storage5Message.length > 5)
                                                storage5Message.shift();
                                }

                                if (configLog.disableAll === false && configLog[event.type] !== false) {
                                        // hide participantIDs (it is array too long)
                                        const participantIDs_ = [...event.participantIDs || []];
                                        if (event.participantIDs)
                                                event.participantIDs = 'Array(' + event.participantIDs.length + ')';

                                        console.log(colors.green((event.type || "").toUpperCase() + ":"), jsonStringifyColor(event, null, 2));

                                        if (event.participantIDs)
                                                event.participantIDs = participantIDs_;
                                }

                                if ((event.senderID && dataGban[event.senderID] || event.userID && dataGban[event.userID])) {
                                        if (event.body && event.threadID) {
                                                const prefix = getPrefix(event.threadID);
                                                if (event.body.startsWith(prefix))
                                                        return api.sendMessage(getText('login', 'userBanned'), event.threadID);
                                                return;
                                        }
                                        else
                                                return;
                                }

                                const handlerAction = require("../handler/handlerAction.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

                                if (hasBanned === false)
                                        handlerAction(event);
                                else
                                        return log.err('GBAN', getText('login', 'youAreBanned'));
                        }
                        // ————————————————— CREATE CALLBACK ————————————————— //
                        function createCallBackListen(key) {
                                key = randomString(10) + (key || Date.now());
                                callbackListenTime[key] = callBackListen;
                                return function(error, event) {
                                        callbackListenTime[key](error, event);
                                };
                        }
                        // ———————————————————— START BOT ———————————————————— //
                        await stopListening();
                        global.BruxaBot.Listening = api.listenMqtt(createCallBackListen());
                        global.BruxaBot.callBackListen = callBackListen;
                        // ——————————————————— UPTIME ——————————————————— //
                        if (global.BruxaBot.config.serverUptime.enable == true && !global.BruxaBot.config.dashBoard?.enable && !global.serverUptimeRunning) {
                                const http = require('http');
                                const express = require('express');
                                const app = express();
                                const server = http.createServer(app);
                                const { data: html } = await axios.get("https://raw.githubusercontent.com/ntkhang03/resources-goat-bot/master/homepage/home.html");
                                const PORT = global.BruxaBot.config.dashBoard?.port || (!isNaN(global.BruxaBot.config.serverUptime.port) && global.BruxaBot.config.serverUptime.port) || 3001;
                                app.get('/', (req, res) => res.send(html));
                                app.get('/uptime', global.responseUptimeCurrent);
                                let nameUpTime;
                                try {
                                        nameUpTime = `https://${process.env.REPL_OWNER ?
                                                `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
                                                process.env.API_SERVER_EXTERNAL == "https://api.glitch.com" ?
                                                        `${process.env.PROJECT_DOMAIN}.glitch.me` :
                                                        `localhost:${PORT}`}`;
                                        nameUpTime.includes('localhost') && (nameUpTime = nameUpTime.replace('https', 'http'));
                                        await server.listen(PORT);
                                        log.info("UPTIME", getText('login', 'openServerUptimeSuccess', nameUpTime));
                                        if (global.BruxaBot.config.serverUptime.socket?.enable == true)
                                                require('./socketIO.js')(server);
                                        global.serverUptimeRunning = true;
                                }
                                catch (err) {
                                        log.err("UPTIME", getText('login', 'openServerUptimeError'), err);
                                }
                        }


                        // ———————————————————— RESTART LISTEN ———————————————————— //
                        if (restartListenMqtt.enable == true) {
                                if (restartListenMqtt.logNoti == true) {
                                        log.info("LISTEN_MQTT", getText('login', 'restartListenMessage', convertTime(restartListenMqtt.timeRestart, true)));
                                        log.info("BOT_STARTED", getText('login', 'startBotSuccess'));

                                        logColor("#f5ab00", character);
                                }
                                const restart = setInterval(async function() {
                                        if (restartListenMqtt.enable == false) {
                                                clearInterval(restart);
                                                return log.warn("LISTEN_MQTT", getText('login', 'stopRestartListenMessage'));
                                        }
                                        try {
                                                await stopListening();
                                                await sleep(1000);
                                                global.BruxaBot.Listening = api.listenMqtt(createCallBackListen());
                                                log.info("LISTEN_MQTT", getText('login', 'restartListenMessage2'));
                                        }
                                        catch (e) {
                                                log.err("LISTEN_MQTT", getText('login', 'restartListenMessageError'), e);
                                        }
                                }, restartListenMqtt.timeRestart);
                                global.intervalRestartListenMqtt = restart;
                        }
                        require('../autoUptime.js');
                });
        }) (appState);

        if (global.BruxaBot.config.autoReloginWhenChangeAccount) {
                setTimeout(function() {
                        watch(dirAccount, async (type) => {
                                if (type == 'change' && changeFbStateByCode == false && latestChangeContentAccount != fs.statSync(dirAccount).mtimeMs) {
                                        clearInterval(global.intervalRestartListenMqtt);
                                        global.compulsoryStopLisening = true;
                                        // await stopListening();
                                        latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
                                        // process.exit(2);
                                        startBot();
                                }
                        });
                }, 10000);
        }
}

global.BruxaBot.reLoginBot = startBot;
startBot();