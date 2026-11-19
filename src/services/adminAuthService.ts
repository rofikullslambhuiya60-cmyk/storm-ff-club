import { auth } from './firebaseClient';
import {
  signInWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';

// Single authorized administrator identity across the entire application
export const AUTHORIZED_ADMIN_EMAIL = 'rofikullslambhuiya60@gmail.com';

export function getConfiguredAdminEmail(): string {
  return AUTHORIZED_ADMIN_EMAIL;
}

export function isConfiguredAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
}

export function isAuthorizedAdminFirebaseUser(user: FirebaseUser | null): boolean {
  return Boolean(
    user &&
    user.email &&
    user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL &&
    user.emailVerified === true
  );
}

export function subscribeAdminAuthState(
  callback: (state: { ready: boolean; isAdmin: boolean; user: FirebaseUser | null }) => void
): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback({
      ready: true,
      isAdmin: isAuthorizedAdminFirebaseUser(firebaseUser),
      user: firebaseUser
    });
  });
}

export async function signInAdminWithEmailPassword(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; needsEmailVerification?: boolean; message?: string }> {
  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const cleanPassword = passwordInput || '';

  if (!cleanEmail || !cleanPassword) {
    return { success: false, message: 'Please enter both Administrator Email and Password.' };
  }

  // Strictly restrict Admin login to the single authorized email
  if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return { success: false, message: 'Unauthorized: Invalid administrator credentials.' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    const fbUser = cred.user;

    if (!fbUser || !isConfiguredAdminEmail(fbUser.email)) {
      await signOut(auth).catch(() => {});
      return { success: false, message: 'Unauthorized: Invalid administrator credentials.' };
    }

    if (!fbUser.emailVerified) {
      try {
        await sendEmailVerification(fbUser);
      } catch {
        // Rate-limited or already sent recently
      }
      await signOut(auth).catch(() => {});
      return {
        success: false,
        needsEmailVerification: true,
        message:
          `Your administrator email (${AUTHORIZED_ADMIN_EMAIL}) is not verified yet. A verification link has been sent to your inbox. Please verify your email and sign in again.`
      };
    }

    return { success: true };
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'Too many failed login attempts. Please wait a moment and try again.'
      };
    }
    if (code === 'auth/network-request-failed') {
      return {
        success: false,
        message: 'Network error while connecting to Firebase Authentication.'
      };
    }
    return { success: false, message: 'Unauthorized: Invalid administrator credentials.' };
  }
}

export async function sendAdminPasswordReset(
  emailInput: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = (emailInput || '').trim().toLowerCase();
  if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return {
      success: false,
      message: 'Password reset is restricted to the authorized administrator email.'
    };
  }

  try {
    await sendPasswordResetEmail(auth, AUTHORIZED_ADMIN_EMAIL);
    return {
      success: true,
      message: `Password reset email sent to ${AUTHORIZED_ADMIN_EMAIL}. Check your inbox or spam folder.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Unable to send password reset email right now.'
    };
  }
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> {
  const fbUser = auth.currentUser;
  const fbEmail = fbUser?.email;

  if (!isAuthorizedAdminFirebaseUser(fbUser) || !fbEmail) {
    return {
      success: false,
      message: 'Verified Firebase Administrator session required. Please sign in again.'
    };
  }

  if (!currentPassword) {
    return { success: false, message: 'Please enter your current password.' };
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

  try {
    const credential = EmailAuthProvider.credential(fbEmail, currentPassword);
    await reauthenticateWithCredential(fbUser, credential);
    await updatePassword(fbUser, newPassword);
    return {
      success: true,
      message: 'Firebase Administrator password updated successfully.'
    };
  } catch (err: any) {
    const code = err?.code || '';
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials'
    ) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    if (code === 'auth/requires-recent-login') {
      return {
        success: false,
        message: 'For security, please log out and sign in again before changing your password.'
      };
    }
    return {
      success: false,
      message: err?.message || 'Failed to update administrator password.'
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch {
    // ignore signOut errors
  }
}
