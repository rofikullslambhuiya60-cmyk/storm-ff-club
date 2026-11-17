/**
 * Referral & Commission Service for FF Arena
 * Features:
 * - Dynamic Deep Link Generator (redirects to app download with ref code embedded)
 * - Automatic Referrer Binding upon registration
 * - Multi-tier bonus calculation (Instant signup bonus + match fee commission %)
 */

export const referralService = {
  /**
   * Generates a unique 6-character referral code based on IGN
   */
  generateReferralCode: (ign) => {
    const clean = (ign || 'FFA').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${clean || 'FF'}${rand}`;
  },

  /**
   * Generates a dynamic deep link for sharing
   */
  getDeepLinkUrl: (referralCode) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${encodeURIComponent(referralCode)}&action=download_and_bind`;
  },

  /**
   * Parses referral code directly from the current URL (?ref=CODE or /invite/CODE)
   */
  extractUrlReferralCode: () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref && ref.trim().length > 0) {
        return ref.trim().toUpperCase();
      }
      const pathname = window.location.pathname || '';
      const inviteMatch = pathname.match(/^\/invite\/([^/?#]+)/i);
      if (inviteMatch && inviteMatch[1]) {
        return decodeURIComponent(inviteMatch[1]).trim().toUpperCase();
      }
      return '';
    } catch {
      return '';
    }
  },

  /**
   * Parses referral code from URL (?ref=CODE or /invite/CODE) and persists to sessionStorage
   */
  detectDeepLinkReferral: () => {
    try {
      const urlCode = referralService.extractUrlReferralCode();
      if (urlCode && urlCode.length > 0) {
        sessionStorage.setItem('ffarena_pending_ref_code', urlCode);
        return urlCode;
      }
      return sessionStorage.getItem('ffarena_pending_ref_code') || '';
    } catch {
      return '';
    }
  },

  /**
   * Calculates commission when a referred player joins a paid match
   */
  calculateMatchCommission: (entryFee, commissionPercent = 10) => {
    if (entryFee <= 0) return 0;
    const bonus = (entryFee * commissionPercent) / 100;
    return Math.max(1, Math.round(bonus * 10) / 10);
  }
};
