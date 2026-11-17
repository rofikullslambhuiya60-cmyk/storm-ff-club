import { auth } from './firebaseClient';
import {
  signInWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut
} from 'firebase/auth';
import { securityService } from './securityService';

const ADMIN_SESSION_KEY = 'stormff_admin_session_v1';
const ADMIN_PW_HASH_KEY = 'stormff_admin_pw_hash_v1';

// Configured Admin Email & Initial Password (can be overridden via .env VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD
// and changed anytime from Admin Panel -> Admin Security)
const CONFIGURED_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'rofikullslambhuiya60@gmail.com'
)
  .trim()
  .toLowerCase();

const CONFIGURED_DEFAULT_ADMIN_PASSWORD = (
  import.meta.env.VITE_ADMIN_PASSWORD || 'StormAdmin@2026'
).trim();

export function getConfiguredAdminEmail(): string {
  return CONFIGURED_ADMIN_EMAIL;
}

export function isConfiguredAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === CONFIGURED_ADMIN_EMAIL;
}

async function getExpectedAdminPasswordHash(): Promise<string> {
  try {
    const customHash = localStorage.getItem(ADMIN_PW_HASH_KEY);
    if (customHash && customHash.trim().length > 0) {
      return customHash.trim();
    }
  } catch {
    // ignore storage read error
  }
  return securityService.hashPassword(CONFIGURED_DEFAULT_ADMIN_PASSWORD);
}

export function isAdminSessionValid(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.email !== 'string') return false;
    return parsed.email.trim().toLowerCase() === CONFIGURED_ADMIN_EMAIL;
  } catch {
    return false;
  }
}

function setAdminSessionActive(email: string): void {
  try {
    sessionStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        email: email.trim().toLowerCase(),
        verifiedAt: new Date().toISOString()
      })
    );
  } catch {
    // ignore storage errors
  }
}

export async function verifyAdminLogin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; message?: string }> {
  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const cleanPassword = passwordInput || '';

  if (!cleanEmail || !cleanPassword) {
    return { success: false, message: 'Please enter both Admin Email and Password.' };
  }

  // Strictly restrict access to the configured Admin Email ONLY
  if (cleanEmail !== CONFIGURED_ADMIN_EMAIL) {
    return { success: false, message: 'Unauthorized: Invalid administrator credentials.' };
  }

  // 1. Check against local stored/configured password hash
  const expectedHash = await getExpectedAdminPasswordHash();
  const enteredHash = await securityService.hashPassword(cleanPassword);
  const matchesLocalConfig = enteredHash === expectedHash;

  // 2. Also attempt Firebase Auth sign-in for Firestore admin rules sync
  let firebaseAuthenticated = false;
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    if (cred.user && cred.user.email?.toLowerCase() === CONFIGURED_ADMIN_EMAIL) {
      firebaseAuthenticated = true;
    }
  } catch {
    // Firebase Auth may not have this account yet or may not be enabled in console
  }

  if (!matchesLocalConfig && !firebaseAuthenticated) {
    return { success: false, message: 'Unauthorized: Invalid administrator credentials.' };
  }

  // Keep local hash synchronized if authenticated cleanly via Firebase Auth
  if (firebaseAuthenticated && !matchesLocalConfig) {
    try {
      localStorage.setItem(ADMIN_PW_HASH_KEY, enteredHash);
    } catch {
      // ignore
    }
  }

  setAdminSessionActive(cleanEmail);
  return { success: true };
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!isAdminSessionValid()) {
    return { success: false, message: 'Admin session expired. Please log in again.' };
  }

  if (!currentPassword) {
    return { success: false, message: 'Please enter your current admin password.' };
  }

  const expectedHash = await getExpectedAdminPasswordHash();
  const currentHash = await securityService.hashPassword(currentPassword);
  if (currentHash !== expectedHash) {
    return { success: false, message: 'Current admin password is incorrect.' };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters long.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: 'New password and confirmation do not match.' };
  }

  if (newPassword === currentPassword) {
    return { success: false, message: 'New password must be different from your current password.' };
  }

  const newHash = await securityService.hashPassword(newPassword);
  try {
    localStorage.setItem(ADMIN_PW_HASH_KEY, newHash);
  } catch {
    return { success: false, message: 'Failed to save new admin password.' };
  }

  // Also update Firebase Auth password if currently signed in as Admin
  const fbUser = auth.currentUser;
  const fbEmail = fbUser?.email;
  if (fbUser && fbEmail && fbEmail.toLowerCase() === CONFIGURED_ADMIN_EMAIL) {
    try {
      const credential = EmailAuthProvider.credential(fbEmail, currentPassword);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, newPassword);
    } catch {
      // Local verifier already updated safely
    }
  }

  return {
    success: true,
    message: 'Admin password updated successfully! Use the new password on your next sign-in.'
  };
}

export async function logoutAdmin(): Promise<void> {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
  try {
    if (auth.currentUser && isConfiguredAdminEmail(auth.currentUser.email)) {
      await signOut(auth);
    }
  } catch {
    // ignore
  }
}
