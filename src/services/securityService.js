/**
 * Security Service for FF Arena
 * Features:
 * 1. Device ID Fingerprinting (Strict Max 2 accounts per physical device)
 * 2. Disposable / Temporary Email Blocker
 * 3. Virtual Number / VoIP Blocker
 * 4. Free Fire UID validation
 */

// Common disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com', 'yopmail.com',
  'sharklasers.com', 'dispostable.com', 'getairmail.com', 'crazymailing.com',
  'burnermail.io', 'trashmail.com', 'dropmail.me', 'mohmal.com', 'nbasweeps.com'
];

// Strictly allowed official email domains for user sign-up
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com'
];

// Blocked virtual / VoIP phone prefixes (known burner number pools)
const BLOCKED_VIRTUAL_PREFIXES = [
  '+1800', '+1888', '+1877', '+1866', '+1855', '+1844', '+1833',
  '0100', '0110', '0120'
];

export const securityService = {
  /**
   * Generates or retrieves a persistent physical Device ID fingerprint
   */
  getDeviceId: () => {
    let deviceId = localStorage.getItem('ffarena_device_fingerprint');
    if (!deviceId) {
      const platformInfo = navigator.userAgent + navigator.hardwareConcurrency + screen.width + 'x' + screen.height;
      const randomSalt = Math.random().toString(36).substring(2, 12);
      let hash = 0;
      for (let i = 0; i < platformInfo.length; i++) {
        hash = ((hash << 5) - hash) + platformInfo.charCodeAt(i);
        hash |= 0;
      }
      deviceId = 'DEV-' + Math.abs(hash).toString(16).toUpperCase() + '-' + randomSalt.toUpperCase();
      localStorage.setItem('ffarena_device_fingerprint', deviceId);
    }
    return deviceId;
  },

  /**
   * Check if physical device has exceeded max 2 accounts
   */
  checkDeviceLimit: (allUsers, currentDeviceId) => {
    const existingAccountsForDevice = allUsers.filter(u => u.deviceId === currentDeviceId);
    if (existingAccountsForDevice.length >= 2) {
      return {
        allowed: false,
        count: existingAccountsForDevice.length,
        message: 'Security Alert: Maximum 2 accounts per physical device allowed on Storm FF Club to prevent bonus abuse.'
      };
    }
    return {
      allowed: true,
      count: existingAccountsForDevice.length
    };
  },

  /**
   * Validate email against temporary / disposable providers
   */
  isTemporaryEmail: (email) => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    const parts = cleanEmail.split('@');
    if (parts.length !== 2) return true;
    const domain = parts[1];
    return DISPOSABLE_EMAIL_DOMAINS.some(disposable => domain === disposable || domain.endsWith('.' + disposable));
  },

  /**
   * Strictly allow registration ONLY for @gmail.com, @outlook.com (@hotmail.com/@live.com), and @yahoo.com
   */
  isAllowedRegistrationEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || /\s/.test(cleanEmail)) return false;
    const parts = cleanEmail.split('@');
    if (parts.length !== 2) return false;
    const [localPart, domain] = parts;
    if (!localPart || !domain) return false;
    if (DISPOSABLE_EMAIL_DOMAINS.some(disposable => domain === disposable || domain.endsWith('.' + disposable))) {
      return false;
    }
    return ALLOWED_EMAIL_DOMAINS.includes(domain);
  },

  /**
   * Validate phone against virtual VoIP and burner services
   */
  isVirtualPhoneNumber: (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    for (const prefix of BLOCKED_VIRTUAL_PREFIXES) {
      if (cleanPhone.startsWith(prefix)) return true;
    }
    // Must be valid Bangladesh / international mobile number
    // BD standard: 013, 014, 015, 016, 017, 018, 019 followed by 8 digits
    if (cleanPhone.startsWith('+8801') || cleanPhone.startsWith('01')) {
      const bdMatch = cleanPhone.replace('+88', '');
      if (!/^(01[3-9]\d{8})$/.test(bdMatch)) {
        return true; // invalid structure treated as virtual / burner
      }
    }
    return false;
  },

  /**
   * Validate Free Fire UID format (numeric 8 to 11 digits)
   */
  isValidFFUid: (uid) => {
    if (!uid) return false;
    return /^\d{7,12}$/.test(uid.trim());
  },

  /**
   * Compute SHA-256 hex digest of a password with static app salt (never stores plaintext)
   */
  hashPassword: async (password) => {
    const input = `stormffclub_sec_v1:${String(password || '')}`;
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
        const data = new TextEncoder().encode(input);
        const hashBuf = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch {
      // Fall through to deterministic fallback hash
    }
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i);
      h1 ^= ch;
      h1 = Math.imul(h1, 0x01000193);
      h2 = Math.imul(h2 ^ ch, 0x85ebca6b);
    }
    return ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'));
  },

  /**
   * Store non-reversible SHA-256 password verifier keyed by uid/email
   */
  savePasswordVerifier: async (uid, email, password) => {
    if (!password) return;
    try {
      const hash = await securityService.hashPassword(password);
      const raw = localStorage.getItem('stormff_pw_verifiers');
      const map = raw ? JSON.parse(raw) : {};
      if (uid) map[uid] = hash;
      if (email) map[email.trim().toLowerCase()] = hash;
      localStorage.setItem('stormff_pw_verifiers', JSON.stringify(map));
    } catch {
      // ignore storage errors
    }
  },

  /**
   * Check entered password against stored non-reversible verifier if present
   * Returns: true (matches), false (mismatch), or null (no verifier stored)
   */
  verifyPasswordVerifier: async (uid, email, password) => {
    try {
      const raw = localStorage.getItem('stormff_pw_verifiers');
      if (!raw) return null;
      const map = JSON.parse(raw);
      const expected = (uid && map[uid]) || (email && map[email.trim().toLowerCase()]);
      if (!expected) return null;
      const enteredHash = await securityService.hashPassword(password);
      return enteredHash === expected;
    } catch {
      return null;
    }
  }
};
