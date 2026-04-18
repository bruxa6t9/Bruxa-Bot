'use strict';

const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');
const crypto = require('crypto');

// ─────────────────────────────────────────────
// ENCRYPTION DETAILS (what was used to obfuscate)
// Algorithm : AES-256-GCM
// Key Derive: PBKDF2 with SHA-512, 10000 iterations, 32-byte key
// Master key: "uiid57576U@#" + hex string
// Encoding  : hex + utf8
// ─────────────────────────────────────────────

/**
 * getBotAccountCookies
 *
 * Logs into Facebook with the given credentials and returns session cookies.
 *
 * @param {Object} config
 * @param {string} config.email       - Facebook email/phone
 * @param {string} [config.encpass]   - Pre-encrypted password (from Facebook)
 * @param {string} [config.password]  - Plain-text password (will be encrypted)
 * @param {string} [config.userAgent] - Browser User-Agent string
 * @param {string|null} twoFactorCode - TOTP 2FA code (optional)
 * @returns {Promise<Object>} Login result with cookies or 2FA challenge info
 */
async function getAccountCookies(config, twoFactorCode = null) {
  const { email, encpass, userAgent, password } = config;

  const tokensAndKey = await getLoginTokensAndPublicKey();
  if (!tokensAndKey) {
    throw new Error('Failed to fetch login tokens from Facebook');
  }

  const initialLsd = tokensAndKey.lsd;
  const initialJazoest = tokensAndKey.jazoest;

  let loginEncpass;

  if (encpass) {
    loginEncpass = encpass;
  } else if (password) {
    try {
      if (!tokensAndKey.publicKey || !tokensAndKey.keyId) {
        throw new Error('Public key not available from Facebook login page');
      }
      loginEncpass = encryptPasswordWithNaCl(password, tokensAndKey.publicKey, tokensAndKey.keyId);
    } catch (error) {
      throw new Error(`Cannot login: ${error.message}`);
    }
  } else {
    throw new Error('Either encpass or password must be provided');
  }

  let data = qs.stringify({
    'jazoest': tokensAndKey.jazoest,
    'lsd': tokensAndKey.lsd,
    'email': email,
    'login_source': 'comet_headerless_login',
    'next': '',
    'encpass': loginEncpass
  });

  const privacyTokenTime = Math.floor(Date.now() / 1000);
  const privacyToken = Buffer.from(JSON.stringify({
    type: 0,
    creation_time: privacyTokenTime,
    callsite_id: 381229079575946
  })).toString('base64');

  let requestConfig = {
    method: 'POST',
    maxRedirects: 0,
    validateStatus: function (status) {
      return status >= 200 && status < 400;
    },
    url: `https://www.facebook.com/login/?privacy_mutation_token=${encodeURIComponent(privacyToken)}&next=`,
    headers: {
      'User-Agent': userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded',
      'sec-fetch-site': 'same-origin',
      'priority': 'u=0, i',
      'accept-language': 'en-US,en;q=0.9',
      'sec-fetch-mode': 'navigate',
      'origin': 'https://www.facebook.com',
      'referer': 'https://www.facebook.com/',
      'sec-fetch-dest': 'document',
      'Cookie': 'datr=soC2aJB91tnTkw-4D2h7y3YR; sb=-iDMaMeopIGoBoK29rP-pm4C; dpr=3',
    },
    data: data
  };

  function parseCookies(setCookieHeaders) {
    const cookies = [];
    const now = new Date().toISOString();

    setCookieHeaders.forEach(cookieString => {
      const parts = cookieString.split(';');
      const [key, ...valueParts] = parts[0].split('=');
      const value = valueParts.join('=');

      let domain = "facebook.com";
      const domainPart = parts.find(p => p.trim().toLowerCase().startsWith('domain='));
      if (domainPart) {
        domain = domainPart.split('=')[1].trim();
        if (domain.startsWith('.')) {
          domain = domain.substring(1);
        }
      }

      cookies.push({
        key: key.trim(),
        value: value,
        domain: domain,
        path: "/",
        hostOnly: false,
        creation: now,
        lastAccessed: now
      });
    });

    return cookies;
  }

  return new Promise((resolve, reject) => {
    axios.request(requestConfig)
      .then(async (response) => {
        const setCookieHeaders = response.headers['set-cookie'] || [];
        const cookies = parseCookies(setCookieHeaders);

        const checkpointCookie = cookies.find(c => c.key === 'checkpoint');

        if (checkpointCookie && checkpointCookie.value !== 'deleted') {
          const checkpointData = decodeURIComponent(checkpointCookie.value);

          let fb_dtsg = null;
          let lsd = null;
          let jazoest = null;
          let encryptedContext = null;
          let rev = null;
          let hsi = null;

          try {
            const checkpointObj = JSON.parse(checkpointData);

            if (checkpointObj.n) {
              fb_dtsg = checkpointObj.n;
            }

            const encryptedContextMatch = response.data.match(/encrypted_context=([A-Za-z0-9_-]+)/);
            if (encryptedContextMatch) {
              encryptedContext = encryptedContextMatch[1];
            }

            const $ = cheerio.load(response.data);
            lsd = $("input[name='lsd']").attr("value");
            jazoest = $("input[name='jazoest']").attr("value");

            if (!lsd) {
              let lsdMatch = response.data.match(/"LSD"[^{]*"token"\s*:\s*"([^"]+)"/);
              if (!lsdMatch) lsdMatch = response.data.match(/\["LSD",\[\],\{"token":"([^"]+)"\}/);
              if (!lsdMatch) lsdMatch = response.data.match(/name="lsd"\s+value="([^"]+)"/);
              if (!lsdMatch) lsdMatch = response.data.match(/"lsd"\s*:\s*"([^"]+)"/);
              if (!lsdMatch) lsdMatch = response.data.match(/,lsd:"([^"]+)"/);
              if (!lsdMatch) lsdMatch = response.data.match(/\\"lsd\\":\\"([^"]+)\\"/);
              if (lsdMatch) lsd = lsdMatch[1];
            }

            if (!jazoest) {
              const jazoestMatch = response.data.match(/name="jazoest"\s+value="([^"]+)"/);
              if (jazoestMatch) jazoest = jazoestMatch[1];
            }

            if (!jazoest && fb_dtsg) {
              const sum = fb_dtsg.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              jazoest = '2' + sum;
            }

            const revMatch = response.data.match(/"__rev"\s*:\s*"?(\d+)"?/);
            if (revMatch) rev = revMatch[1];

            const hsiMatch = response.data.match(/"__hsi"\s*:\s*"?(\d+)"?/);
            if (hsiMatch) hsi = hsiMatch[1];

            if (!lsd && initialLsd) lsd = initialLsd;
            if (!jazoest && initialJazoest) jazoest = initialJazoest;

          } catch (e) {
            console.log('[Login] Could not extract tokens from checkpoint:', e.message);
          }

          // If 2FA code is provided, handle it automatically
          if (twoFactorCode) {
            try {
              const loginResult = {
                cookies,
                fb_dtsg,
                lsd,
                jazoest,
                encryptedContext,
                rev,
                hsi,
                userAgent: requestConfig.headers['User-Agent']
              };
              const result2FA = await handle2FAFlow(loginResult, twoFactorCode);
              resolve({
                requires2FA: false,
                cookies: result2FA.cookies
              });
            } catch (err) {
              resolve({
                requires2FA: true,
                checkpointValue: checkpointData,
                cookies: cookies,
                fb_dtsg: fb_dtsg,
                lsd: lsd,
                jazoest: jazoest,
                encryptedContext: encryptedContext,
                rev: rev,
                hsi: hsi,
                userAgent: requestConfig.headers['User-Agent'],
                error2FA: err.message
              });
            }
          } else {
            resolve({
              requires2FA: true,
              checkpointValue: checkpointData,
              cookies: cookies,
              fb_dtsg: fb_dtsg,
              lsd: lsd,
              jazoest: jazoest,
              encryptedContext: encryptedContext,
              rev: rev,
              hsi: hsi,
              userAgent: requestConfig.headers['User-Agent']
            });
          }
        } else if (cookies && cookies.length > 0) {
          resolve({
            requires2FA: false,
            cookies: cookies
          });
        } else {
          reject(new Error('No cookies found in response'));
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

/**
 * handle2FAFlow
 *
 * Handles the Facebook 2-Factor Authentication (TOTP) flow after login.
 *
 * Steps internally:
 *   1. UpdateLoginMutation  - starts the 2FA session
 *   2. GetChallengeMethods  - fetches available 2FA methods
 *   3. TriggerNonceCreator  - generates a security token
 *   4. ValidateTOTP         - submits the TOTP code and completes login
 *
 * @param {Object} loginResult
 * @param {Array}  loginResult.cookies          - Cookies from initial login attempt
 * @param {string} loginResult.fb_dtsg          - Facebook DTSG token
 * @param {string} loginResult.lsd              - LSD token
 * @param {string} loginResult.jazoest          - Jazoest token
 * @param {string} loginResult.encryptedContext - Encrypted 2FA context
 * @param {string} loginResult.rev              - Revision number
 * @param {string} loginResult.hsi              - HSI token
 * @param {string} loginResult.userAgent        - Browser User-Agent
 * @param {string} totpCode                     - 6-digit TOTP code from authenticator app
 * @returns {Promise<{success: boolean, cookies: Array}>}
 */
async function handle2FAFlow(loginResult, totpCode) {
  const { cookies, fb_dtsg, lsd, jazoest, encryptedContext, rev, hsi, userAgent } = loginResult;

  if (!fb_dtsg || !lsd) {
    throw new Error('Missing fb_dtsg or lsd tokens required for 2FA');
  }

  if (!encryptedContext) {
    throw new Error('Missing encryptedContext required for 2FA flow');
  }

  const cookieString = cookiesToString(cookies);

  const sessionParams = {
    fb_dtsg,
    lsd,
    jazoest: jazoest || '21097',
    encryptedContext,
    rev: rev || '1030277950',
    hsi: hsi || '7575637775790753541',
    userAgent
  };

  // Step 1: Start 2FA login mutation
  const step1Result = await step1_UpdateLoginMutation(cookieString, sessionParams);

  // Step 2: Get available 2FA challenge methods
  const step2Result = await step2_GetChallengeMethods(cookieString, sessionParams);
  const methods = step2Result.methods || [];

  // Step 3: Find TOTP method
  const totpMethod = methods.find(m => m.method === 'TOTP');
  if (!totpMethod) {
    throw new Error('TOTP method not available for this account');
  }

  // Step 4: Trigger nonce/security token creation
  const step3Result = await step3_TriggerNonceCreator(cookieString, sessionParams);
  const securityToken = step3Result?.two_step_idr_wizard_input?.security_token;
  const externalFlowId = step3Result?.two_step_idr_wizard_input?.external_flow_id;

  // Step 5: Validate the TOTP code
  const step4Result = await step4_ValidateTOTP(cookieString, sessionParams, totpCode, securityToken, externalFlowId);

  if (!step4Result.is_code_valid) {
    throw new Error(step4Result.error_message || 'Invalid 2FA code');
  }

  const finalCookies = step4Result.cookies || cookies;

  return {
    success: true,
    cookies: finalCookies
  };
}

module.exports = { getAccountCookies, handle2FAFlow };
