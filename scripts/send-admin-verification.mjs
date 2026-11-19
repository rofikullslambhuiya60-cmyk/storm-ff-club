import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'firebase/auth';

const AUTHORIZED_ADMIN_EMAIL = 'rofikullslambhuiya60@gmail.com';

function loadFirebaseClientConfig() {
  const configUrl = new URL('../firebase-applet-config.json', import.meta.url);
  const raw = readFileSync(configUrl, 'utf8');
  return JSON.parse(raw);
}

function promptHiddenPassword(promptText) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (!stdin.isTTY) {
      let data = '';
      stdin.setEncoding('utf8');
      stdin.on('data', chunk => {
        data += chunk;
      });
      stdin.on('end', () => resolve(data.trim()));
      stdin.on('error', reject);
      return;
    }

    stdout.write(promptText);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';
    const onData = (chunk) => {
      // Ignore ANSI escape sequences (e.g., arrow keys on mobile terminal toolbar)
      if (chunk.startsWith('\u001b')) return;

      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          return;
        } else if (ch === '\u0003') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          reject(new Error('Cancelled by user'));
          return;
        } else if (ch === '\u007f' || ch === '\b') {
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
        } else {
          password += ch;
          stdout.write('*');
        }
      }
    };

    stdin.on('data', onData);
  });
}

async function main() {
  console.log('=== Storm FF Club Temporary Admin Email Verification Utility ===');
  console.log(`Target Admin Account: ${AUTHORIZED_ADMIN_EMAIL}`);

  const firebaseConfig = loadFirebaseClientConfig();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  let password;
  try {
    password = await promptHiddenPassword(`Enter Firebase password for ${AUTHORIZED_ADMIN_EMAIL}: `);
  } catch {
    console.log('Aborted.');
    process.exit(1);
  }

  if (!password) {
    console.error('Error: Password cannot be empty.');
    process.exit(1);
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, AUTHORIZED_ADMIN_EMAIL, password);
    password = '';
    const user = credential.user;

    if (user.emailVerified) {
      console.log(`Email ${AUTHORIZED_ADMIN_EMAIL} is ALREADY verified in Firebase Authentication.`);
      await signOut(auth);
      process.exit(0);
    }

    await sendEmailVerification(user);
    console.log(`Verification email sent to ${AUTHORIZED_ADMIN_EMAIL}.`);
    console.log('Please open your inbox (and Spam/Promotions folder) and click the Firebase verification link.');

    await signOut(auth);
    process.exit(0);
  } catch (err) {
    const code = err?.code || 'unknown-error';
    console.error(`Firebase Auth error (${code}): Could not complete verification request.`);
    await signOut(auth).catch(() => {});
    process.exit(1);
  }
}

main();
