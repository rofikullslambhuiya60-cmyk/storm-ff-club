/**
 * Firebase Config & Live Reactive Data Store for Storm FF Club
 * Provides persistent Cloud Firestore data synchronization for Storm FF Club Mobile App & Admin Panel
 * Uses Firebase Project: storm-ff-club
 */

import { 
  app, firebaseConfig, db, auth, googleProvider, handleFirestoreError, OperationType 
} from './firebaseClient';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const STORAGE_KEY = 'storm_ff_club_db_v2';

function cleanFirestorePayload(value) {
  if (Array.isArray(value)) {
    return value.map(item => cleanFirestorePayload(item));
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const cleaned = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) {
        cleaned[k] = cleanFirestorePayload(v);
      }
    }
    return cleaned;
  }
  return value;
}

const ADMIN_EMAILS = ['rofikullslambhuiya60@gmail.com', 'admin@stormff.com', 'admin@ffarena.com'];

// Initial realistic seed data branded for Storm FF Club
const INITIAL_SETTINGS = {
  bKashNumber: '01892348190',
  bKashType: 'Personal',
  nagadNumber: '01711223344',
  nagadType: 'Personal',
  whatsAppNumber: '8801892348190',
  minDeposit: 50,
  minWithdraw: 50,
  signupBonus: 10,
  referralMinDeposit: 50, // Minimum deposit required to trigger referral bonus (configurable from Admin)
  referralBonusPercent: 10,
  referralFixedBonus: 20, // 20 TK upon friend's first deposit
  referralLifetimePassivePercent: 1, // 1% lifetime passive commission
  referralFirstThreeDepositsPercent: 5, // 5% on friend's first 3 deposits
  androidDownloadUrl: 'https://stormffclub.app/download/storm-ff-club.apk',
  iosDownloadUrl: 'https://apps.apple.com/app/storm-ff-club',
  forcedUpdate: {
    enabled: false,
    minVersion: '2.5.0',
    title: '🔥 Storm FF Club Mandatory Upgrade v2.5',
    message: 'We have updated our Anti-Cheat engine and Instant bKash/Nagad Payout gateway. Please update to continue playing!',
    downloadUrl: 'https://stormffclub.app/download/latest.apk'
  },
  developerProfile: {
    name: 'Storm FF Dev Studio',
    roleTitle: 'Full-Stack Web & Esports App Developer',
    bio: 'Want to build a tournament app like Storm FF Club with automated bKash/Nagad payouts, Firebase real-time sync, and an Admin Panel? Contact me directly!',
    phone: '+8801892348190',
    whatsappUrl: 'https://wa.me/8801892348190',
    facebookUrl: 'https://facebook.com',
    portfolioUrl: ''
  },
  rules: {
    deposit: '⚠️ Minimum deposit 50 TK. Only use "Send Money" (NOT Cash Out). Submit exact TrxID & your 11-digit sender number. Deposit is credited after manual admin review.',
    withdraw: '🏆 Minimum withdraw 50 TK from WINNING balance only. Deposit balance cannot be withdrawn directly (must be played in matches). Enter your account password to confirm security.',
    matchJoin: '⚡ Ensure your Free Fire IGN & UID match your profile. Do NOT use emulators, hacks, or team up in Solo matches. Room credentials will appear in "My Matches" 10 minutes before start.',
    pointRedeem: '💎 20 Storm Points = 10 TK BR Match Voucher. 50 Storm Points = 1 Mystery Box (Min 25 Diamonds, Weekly / Monthly Membership). Diamond top-ups are delivered within 10-30 minutes to your FF UID.',
    gameplay: '🚫 STRICT RULES: Emulators banned. Hackers banned permanently with device blacklist. Room ID & Pass must NOT be shared with outside players.',
    general: '🔥 Fair play esports rules apply to all tournaments. Admin decisions are final. For support, tap the WhatsApp button anytime.'
  }
};

const INITIAL_USERS = [
  {
    uid: 'user_admin_01',
    ign: '⚡ AdminBoss ⚡',
    freeFireUid: '1092837482',
    email: 'admin@stormff.com',
    role: 'admin',
    depositBalance: 500,
    winningBalance: 1250,
    points: 85,
    signupBonusLocked: 0,
    hasDeposited: true,
    referralCode: 'BOSS99',
    referralCount: 42,
    referralEarnings: 680,
    deviceId: 'DEV-ADMIN-MASTER',
    isMatchBanned: false,
    isPermanentlyBanned: false,
    savedPayoutMethod: 'bKash',
    savedPayoutNumber: '01892348190',
    lastSpinTimestamp: '',
    spinCycleDays: 0,
    spinCyclePointsWon: 0,
    spinCycleStartDate: '',
    freeEventsJoined: [],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    uid: 'user_player_demo',
    ign: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂',
    freeFireUid: '2847192834',
    email: 'player@stormff.com',
    role: 'user',
    depositBalance: 120,
    winningBalance: 340,
    points: 38,
    signupBonusLocked: 10,
    hasDeposited: true,
    referralCode: 'DEAD77',
    referredBy: 'BOSS99',
    referralCount: 8,
    referralEarnings: 160,
    deviceId: 'DEV-IPHONE-7A8B',
    isMatchBanned: false,
    isPermanentlyBanned: false,
    savedPayoutMethod: 'bKash',
    savedPayoutNumber: '01799887766',
    lastSpinTimestamp: '',
    spinCycleDays: 1,
    spinCyclePointsWon: 1,
    spinCycleStartDate: new Date().toISOString(),
    freeEventsJoined: ['event_eid_special'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    uid: 'user_player_pro',
    ign: '𝔖𝔥𝔞𝔡𝔬𝔴_𝔎𝔦𝔫𝔤',
    freeFireUid: '9823741823',
    email: 'shadow@stormff.com',
    role: 'user',
    depositBalance: 200,
    winningBalance: 890,
    points: 62,
    signupBonusLocked: 0,
    hasDeposited: true,
    referralCode: 'SHADOW88',
    referralCount: 15,
    referralEarnings: 450,
    deviceId: 'DEV-GALAXY-9C3D',
    isMatchBanned: false,
    isPermanentlyBanned: false,
    savedPayoutMethod: 'Nagad',
    savedPayoutNumber: '01655443322',
    lastSpinTimestamp: '',
    spinCycleDays: 0,
    spinCyclePointsWon: 0,
    spinCycleStartDate: '',
    freeEventsJoined: [],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  }
];

const INITIAL_MATCHES = [
  {
    id: 'match_br_01',
    title: 'Bermuda Solo Bhooya Challenge #105',
    category: 'BR',
    subCategory: 'Solo',
    map: 'Bermuda',
    entryFee: 30,
    entryType: 'Paid',
    totalSlots: 48,
    joinedPlayers: [
      { uid: 'user_player_demo', ign: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂', freeFireUid: '2847192834', slotNumber: 1, joinedAt: new Date(Date.now() - 3600000).toISOString() },
      { uid: 'user_player_pro', ign: '𝔖𝔥𝔞𝔡𝔬𝔴_𝔎𝔦𝔫𝔤', freeFireUid: '9823741823', slotNumber: 2, joinedAt: new Date(Date.now() - 3200000).toISOString() }
    ],
    winPrize: 450,
    perKillPrize: 15,
    secondPrize: 150,
    thirdPrize: 80,
    matchTime: new Date(Date.now() + 30 * 60000).toISOString(),
    status: 'open',
    roomId: '948210',
    roomPassword: 'ff88',
    customRules: 'Strict Mobile Only! No emulators, no PC, no teaming.'
  },
  {
    id: 'match_cs_02',
    title: 'Clash Squad 4v4 Kalahari Warfare #402',
    category: 'CS',
    subCategory: 'Squad',
    map: 'Kalahari',
    entryFee: 40,
    entryType: 'Paid',
    totalSlots: 8,
    joinedPlayers: [
      { uid: 'user_player_demo', ign: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂', freeFireUid: '2847192834', slotNumber: 1, joinedAt: new Date(Date.now() - 1800000).toISOString() },
      { uid: 'user_player_pro', ign: '𝔖𝔥𝔞𝔡𝔬𝔴_𝔎𝔦𝔫𝔤', freeFireUid: '9823741823', slotNumber: 2, joinedAt: new Date(Date.now() - 1500000).toISOString() }
    ],
    winPrize: 250,
    perKillPrize: 0,
    secondPrize: 50,
    matchTime: new Date(Date.now() + 45 * 60000).toISOString(),
    status: 'open',
    roomId: '881920',
    roomPassword: 'cs99',
    customRules: 'Limited Ammo: NO. Character Skills: YES. Gun attributes: NO.'
  },
  {
    id: 'match_lw_03',
    title: 'Lone Wolf 1v1 Headshot Showdown',
    category: 'HeadshotLoneWolf',
    subCategory: 'Solo',
    map: 'Iron Cage',
    entryFee: 25,
    entryType: 'Paid',
    totalSlots: 2,
    joinedPlayers: [
      { uid: 'user_player_pro', ign: '𝔖𝔥𝔞𝔡𝔬𝔴_𝔎𝔦𝔫𝔤', freeFireUid: '9823741823', slotNumber: 1, joinedAt: new Date(Date.now() - 900000).toISOString() }
    ],
    winPrize: 45,
    perKillPrize: 0,
    matchTime: new Date(Date.now() + 15 * 60000).toISOString(),
    status: 'open',
    roomId: '',
    roomPassword: '',
    customRules: 'Only Headshot counts! Desert Eagle & Woodpecker only.'
  },
  {
    id: 'match_free_04',
    title: '🎉 Eid Mega Free Fire Battle Royale (Free Entry)',
    category: 'BR',
    subCategory: 'Squad',
    map: 'Purgatory',
    entryFee: 0,
    entryType: 'Free',
    eventId: 'event_eid_special',
    totalSlots: 48,
    joinedPlayers: [
      { uid: 'user_player_demo', ign: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂', freeFireUid: '2847192834', slotNumber: 1, joinedAt: new Date(Date.now() - 300000).toISOString() }
    ],
    winPrize: 150,
    perKillPrize: 5,
    secondPrize: 80,
    thirdPrize: 40,
    matchTime: new Date(Date.now() + 120 * 60000).toISOString(),
    status: 'open',
    roomId: '',
    roomPassword: '',
    customRules: '1 Free Match per user policy strictly enforced.'
  }
];

const INITIAL_RESULTS = [
  {
    id: 'res_01',
    matchTitle: 'BR Bermuda Night Solo #104',
    category: 'BR',
    map: 'Bermuda',
    completedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    topPlayers: [
      { rank: 1, ign: '𝔖𝔥𝔞𝔡𝔬𝔴_𝔎𝔦𝔫𝔤', kills: 9, winnings: 485 },
      { rank: 2, ign: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂', kills: 6, winnings: 290 },
      { rank: 3, ign: '⚡ Thunder_FF', kills: 4, winnings: 160 },
      { rank: 4, ign: 'Silent_Sniper', kills: 3, winnings: 45 },
      { rank: 5, ign: 'Delta_Force', kills: 2, winnings: 30 }
    ]
  }
];

const INITIAL_BANNERS = [
  {
    id: 'banner_01',
    title: '🔥 Daily 5,000 TK Free Fire Mega Cup!',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    redirectUrl: 'https://youtube.com',
    actionType: 'video',
    active: true,
    order: 1
  },
  {
    id: 'banner_02',
    title: '⚡ bKash & Nagad Wallet Deposit (Min 50 TK)',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    redirectUrl: 'wallet',
    actionType: 'in_app',
    active: true,
    order: 2
  },
  {
    id: 'banner_03',
    title: '🎁 Daily Free Spin Wheel: Win Storm Points & Diamonds!',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80',
    redirectUrl: 'spin',
    actionType: 'in_app',
    active: true,
    order: 3
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_01',
    title: '🎉 Welcome to Storm FF Club!',
    message: 'Get 10 TK Signup Bonus on your first deposit. Invite friends to earn lifetime match commission!',
    category: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif_02',
    title: '🛡️ Anti-Cheat & Fair Play Notice',
    message: 'Emulator usage, teaming up in Solo matches, and hacking tools are strictly prohibited. Violators are banned instantly.',
    category: 'system',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'trx_init_01',
    uid: 'user_player_demo',
    userIgn: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂',
    type: 'deposit',
    amount: 100,
    method: 'bKash',
    trxId: 'BLC94K2918',
    senderNumber: '01799887766',
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: 'trx_init_02',
    uid: 'user_player_demo',
    userIgn: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂',
    type: 'match_win',
    amount: 290,
    method: 'Wallet',
    trxId: 'WIN-BR-104',
    status: 'approved',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  }
];

const INITIAL_MYSTERY_BOX_ORDERS = [
  {
    id: 'mbox_ord_01',
    uid: 'user_player_demo',
    userIgn: '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂',
    freeFireUid: '2847192834',
    phone: '01799887766',
    pointsSpent: 50,
    itemTitle: '🎁 Diamond Mystery Box (Min 25 Diamonds)',
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  }
];

class DatabaseStore {
  constructor() {
    this.listeners = new Set();
    this.firestoreInitialized = false;
    this.pendingDeletedBannerIds = new Set();
    this.load();
    this.initFirestoreSync();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedDev = parsed.settings && parsed.settings.developerProfile;
        const loadedSettings = {
          ...INITIAL_SETTINGS,
          ...(parsed.settings || {}),
          developerProfile: savedDev
            ? {
                name: savedDev.name ?? INITIAL_SETTINGS.developerProfile.name,
                roleTitle: savedDev.roleTitle ?? '',
                bio: savedDev.bio ?? INITIAL_SETTINGS.developerProfile.bio,
                phone: savedDev.phone ?? '',
                whatsappUrl: savedDev.whatsappUrl ?? '',
                facebookUrl: savedDev.facebookUrl ?? '',
                portfolioUrl: savedDev.portfolioUrl ?? ''
              }
            : { ...INITIAL_SETTINGS.developerProfile }
        };
        if (localStorage.getItem('stormff_custom_bonus_v10') !== '1' && Number(loadedSettings.signupBonus) === 25) {
          loadedSettings.signupBonus = 10;
        }
        this.settings = loadedSettings;
        this.users = parsed.users || INITIAL_USERS;
        this.matches = parsed.matches || INITIAL_MATCHES;
        this.results = parsed.results || INITIAL_RESULTS;
        this.banners = parsed.banners || INITIAL_BANNERS;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.transactions = parsed.transactions || INITIAL_TRANSACTIONS;
        this.mysteryBoxOrders = parsed.mysteryBoxOrders || INITIAL_MYSTERY_BOX_ORDERS;
        return;
      }
    } catch {
      // fallback to initial
    }
    this.settings = INITIAL_SETTINGS;
    this.users = INITIAL_USERS;
    this.matches = INITIAL_MATCHES;
    this.results = INITIAL_RESULTS;
    this.banners = INITIAL_BANNERS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.transactions = INITIAL_TRANSACTIONS;
    this.mysteryBoxOrders = INITIAL_MYSTERY_BOX_ORDERS;
    this.save();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        settings: this.settings,
        users: this.users,
        matches: this.matches,
        results: this.results,
        banners: this.banners,
        notifications: this.notifications,
        transactions: this.transactions,
        mysteryBoxOrders: this.mysteryBoxOrders
      }));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    this.notify();
  }

  // Real-time Firestore synchronization
  initFirestoreSync() {
    if (this.firestoreInitialized) return;
    this.firestoreInitialized = true;

    try {
      // 1. Sync Settings
      const settingsDocRef = doc(db, 'settings', 'global');
      onSnapshot(settingsDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const remoteDev = data.developerProfile;
          const mergedSettings = {
            ...this.settings,
            ...data,
            developerProfile: remoteDev
              ? {
                  name: remoteDev.name ?? INITIAL_SETTINGS.developerProfile.name,
                  roleTitle: remoteDev.roleTitle ?? '',
                  bio: remoteDev.bio ?? INITIAL_SETTINGS.developerProfile.bio,
                  phone: remoteDev.phone ?? '',
                  whatsappUrl: remoteDev.whatsappUrl ?? '',
                  facebookUrl: remoteDev.facebookUrl ?? '',
                  portfolioUrl: remoteDev.portfolioUrl ?? ''
                }
              : this.settings?.developerProfile || { ...INITIAL_SETTINGS.developerProfile }
          };
          if (localStorage.getItem('stormff_custom_bonus_v10') !== '1' && Number(mergedSettings.signupBonus) === 25) {
            mergedSettings.signupBonus = 10;
          }
          this.settings = mergedSettings;
          this.save();
        } else {
          // Seed settings to Firestore
          setDoc(settingsDocRef, this.settings).catch(() => {});
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));

      // 2. Sync Matches
      const matchesColRef = collection(db, 'matches');
      onSnapshot(matchesColRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteMatches = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            remoteMatches.push({
              ...data,
              id: docSnap.id,
              joinedPlayers: Array.isArray(data.joinedPlayers) ? data.joinedPlayers : []
            });
          });
          if (remoteMatches.length > 0) {
            const matchMap = new Map();
            (this.matches || []).forEach(m => {
              if (m && m.id) {
                matchMap.set(m.id, {
                  ...m,
                  joinedPlayers: Array.isArray(m.joinedPlayers) ? m.joinedPlayers : []
                });
              }
            });
            remoteMatches.forEach(m => {
              const existing = matchMap.get(m.id);
              matchMap.set(m.id, existing ? { ...existing, ...m } : m);
            });
            this.matches = Array.from(matchMap.values()).sort(
              (a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime()
            );
            this.save();
          }
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'matches'));

      // 3-6. Auth-scoped listeners (users, transactions, mystery_box_orders, notifications)
      let authUnsubs = [];
      const clearAuthListeners = () => {
        authUnsubs.forEach(unsub => {
          try { unsub(); } catch { /* ignore */ }
        });
        authUnsubs = [];
      };

      const ADMIN_EMAILS = ['rofikullslambhuiya60@gmail.com', 'admin@stormff.com', 'admin@ffarena.com'];

      const attachPublicNotificationListener = () => {
        const publicNotifQuery = query(collection(db, 'notifications'), where('targetUid', '==', null));
        return onSnapshot(publicNotifQuery, (snapshot) => {
          if (!snapshot.empty) {
            const remoteNotifs = [];
            snapshot.forEach(docSnap => {
              remoteNotifs.push({ id: docSnap.id, ...docSnap.data() });
            });
            if (remoteNotifs.length > 0) {
              const notifMap = new Map();
              this.notifications.forEach(n => notifMap.set(n.id, n));
              remoteNotifs.forEach(n => notifMap.set(n.id, { ...notifMap.get(n.id), ...n }));
              this.notifications = Array.from(notifMap.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              this.save();
            }
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));
      };

      onAuthStateChanged(auth, (firebaseUser) => {
        clearAuthListeners();

        if (!firebaseUser) {
          authUnsubs.push(attachPublicNotificationListener());
          return;
        }

        const isAdminEmail = Boolean(
          firebaseUser.email &&
          firebaseUser.emailVerified &&
          ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())
        );

        // Transactions listener (scoped by uid for players, full for admins)
        const trxRef = isAdminEmail
          ? collection(db, 'transactions')
          : query(collection(db, 'transactions'), where('uid', '==', firebaseUser.uid));
        authUnsubs.push(
          onSnapshot(trxRef, (snapshot) => {
            if (!snapshot.empty) {
              const remoteTrx = [];
              snapshot.forEach(docSnap => {
                remoteTrx.push({ id: docSnap.id, ...docSnap.data() });
              });
              if (remoteTrx.length > 0) {
                const trxMap = new Map();
                (this.transactions || []).forEach(t => trxMap.set(t.id, t));
                remoteTrx.forEach(t => trxMap.set(t.id, t));
                this.transactions = Array.from(trxMap.values()).sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                this.save();
              }
            }
          }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'))
        );

        // Mystery Box Orders listener (scoped by uid for players, full for admins)
        const ordersRef = isAdminEmail
          ? collection(db, 'mystery_box_orders')
          : query(collection(db, 'mystery_box_orders'), where('uid', '==', firebaseUser.uid));
        authUnsubs.push(
          onSnapshot(ordersRef, (snapshot) => {
            if (!snapshot.empty) {
              const remoteOrders = [];
              snapshot.forEach(docSnap => {
                remoteOrders.push({ id: docSnap.id, ...docSnap.data() });
              });
              if (remoteOrders.length > 0) {
                const orderMap = new Map();
                (this.mysteryBoxOrders || []).forEach(o => orderMap.set(o.id, o));
                remoteOrders.forEach(o => orderMap.set(o.id, o));
                this.mysteryBoxOrders = Array.from(orderMap.values()).sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                this.save();
              }
            }
          }, (err) => handleFirestoreError(err, OperationType.LIST, 'mystery_box_orders'))
        );

        // Users listener (own doc for players, full collection for admins)
        if (isAdminEmail) {
          authUnsubs.push(
            onSnapshot(collection(db, 'users'), (snapshot) => {
              if (!snapshot.empty) {
                const remoteUsers = [];
                snapshot.forEach(docSnap => {
                  remoteUsers.push({ uid: docSnap.id, ...docSnap.data() });
                });
                if (remoteUsers.length > 0) {
                  const userMap = new Map();
                  this.users.forEach(u => userMap.set(u.uid, u));
                  remoteUsers.forEach(u => userMap.set(u.uid, { ...userMap.get(u.uid), ...u }));
                  this.users = Array.from(userMap.values());
                  this.save();
                }
              }
            }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'))
          );
        } else {
          authUnsubs.push(
            onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
              if (docSnap.exists()) {
                const remoteUser = { uid: docSnap.id, ...docSnap.data() };
                const userMap = new Map();
                this.users.forEach(u => userMap.set(u.uid, u));
                userMap.set(remoteUser.uid, { ...userMap.get(remoteUser.uid), ...remoteUser });
                this.users = Array.from(userMap.values());
                this.save();
              }
            }, (err) => handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`))
          );
        }

        // Notifications listener (public broadcasts + user-targeted or full for admins)
        if (isAdminEmail) {
          authUnsubs.push(
            onSnapshot(collection(db, 'notifications'), (snapshot) => {
              if (!snapshot.empty) {
                const remoteNotifs = [];
                snapshot.forEach(docSnap => {
                  remoteNotifs.push({ id: docSnap.id, ...docSnap.data() });
                });
                if (remoteNotifs.length > 0) {
                  const notifMap = new Map();
                  this.notifications.forEach(n => notifMap.set(n.id, n));
                  remoteNotifs.forEach(n => notifMap.set(n.id, { ...notifMap.get(n.id), ...n }));
                  this.notifications = Array.from(notifMap.values()).sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );
                  this.save();
                }
              }
            }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'))
          );
        } else {
          authUnsubs.push(attachPublicNotificationListener());
          const targetedNotifQuery = query(collection(db, 'notifications'), where('targetUid', '==', firebaseUser.uid));
          authUnsubs.push(
            onSnapshot(targetedNotifQuery, (snapshot) => {
              if (!snapshot.empty) {
                const remoteNotifs = [];
                snapshot.forEach(docSnap => {
                  remoteNotifs.push({ id: docSnap.id, ...docSnap.data() });
                });
                if (remoteNotifs.length > 0) {
                  const notifMap = new Map();
                  this.notifications.forEach(n => notifMap.set(n.id, n));
                  remoteNotifs.forEach(n => notifMap.set(n.id, { ...notifMap.get(n.id), ...n }));
                  this.notifications = Array.from(notifMap.values()).sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );
                  this.save();
                }
              }
            }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'))
          );
        }
      });

      // 7. Sync Results collection
      const resultsColRef = collection(db, 'results');
      onSnapshot(resultsColRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteResults = [];
          snapshot.forEach(docSnap => {
            remoteResults.push({ id: docSnap.id, ...docSnap.data() });
          });
          if (remoteResults.length > 0) {
            this.results = remoteResults.sort(
              (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            ).slice(0, 5);
            this.save();
          }
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'results'));

      // 8. Sync Banners collection (unlimited banners with safe merge & deletion sync)
      const bannersColRef = collection(db, 'banners');
      onSnapshot(bannersColRef, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.pendingDeletedBannerIds.delete(change.doc.id);
          }
        });
        if (!snapshot.empty) {
          const remoteBanners = [];
          snapshot.forEach(docSnap => {
            if (!this.pendingDeletedBannerIds.has(docSnap.id)) {
              remoteBanners.push({ id: docSnap.id, ...docSnap.data() });
            }
          });
          if (remoteBanners.length > 0) {
            const bannerMap = new Map();
            (this.banners || []).forEach(b => {
              if (b && b.id && !this.pendingDeletedBannerIds.has(b.id)) {
                bannerMap.set(b.id, b);
              }
            });
            remoteBanners.forEach(b => {
              const existing = bannerMap.get(b.id);
              bannerMap.set(b.id, existing ? { ...existing, ...b } : b);
            });
            this.banners = Array.from(bannerMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
            this.save();
          }
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'banners'));

    } catch (e) {
      console.warn('Realtime sync attach notice:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.error(e);
      }
    }
  }

  // User Actions
  findUserById(uid) {
    return this.users.find(u => u.uid === uid) || null;
  }

  updateUser(uid, updates) {
    const index = this.users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.save();

      // Push to Firestore
      try {
        setDoc(doc(db, 'users', uid), cleanFirestorePayload(this.users[index]), { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
        });
      } catch (e) {
        console.warn('Firestore write notice:', e);
      }

      return this.users[index];
    }
    return null;
  }

  addUser(user) {
    const normalizedUser = cleanFirestorePayload(user);
    this.users.push(normalizedUser);
    this.save();

    // Push to Firestore
    try {
      setDoc(doc(db, 'users', normalizedUser.uid), normalizedUser).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `users/${normalizedUser.uid}`);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return normalizedUser;
  }

  // Match Actions
  addMatch(match) {
    const normalizedMatch = cleanFirestorePayload({
      ...match,
      joinedPlayers: Array.isArray(match.joinedPlayers) ? match.joinedPlayers : []
    });
    this.matches.unshift(normalizedMatch);
    this.save();

    // Push to Firestore
    try {
      setDoc(doc(db, 'matches', normalizedMatch.id), normalizedMatch).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `matches/${normalizedMatch.id}`);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return normalizedMatch;
  }

  updateMatch(matchId, updates) {
    const index = this.matches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      this.matches[index] = { ...this.matches[index], ...updates };
      this.save();

      // Push to Firestore
      try {
        setDoc(doc(db, 'matches', matchId), cleanFirestorePayload(this.matches[index]), { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
        });
      } catch (e) {
        console.warn('Firestore write notice:', e);
      }

      return this.matches[index];
    }
    return null;
  }

  cancelMatchWithAutoRefund(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match || match.status === 'cancelled') return false;

    const entryFee = Number(match.entryFee) || 0;
    const joinedPlayers = Array.isArray(match.joinedPlayers) ? match.joinedPlayers : [];

    // Automatically refund exact entry fee to every joined player's wallet balance
    if (entryFee > 0 && joinedPlayers.length > 0) {
      joinedPlayers.forEach(p => {
        const user = this.findUserById(p.uid);
        if (user) {
          const newDepositBalance = (Number(user.depositBalance) || 0) + entryFee;
          this.updateUser(user.uid, { depositBalance: newDepositBalance });

          // Add refund transaction record
          const refTrx = {
            id: `ref_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
            uid: user.uid,
            userIgn: user.ign,
            type: 'match_refund',
            amount: entryFee,
            method: 'Wallet',
            trxId: `REF-${match.id.slice(-6).toUpperCase()}`,
            status: 'approved',
            matchId: match.id,
            createdAt: new Date().toISOString()
          };
          this.addTransaction(refTrx);
        } else if (p.uid) {
          // Fallback: fetch user directly from Firestore if not loaded locally
          getDoc(doc(db, 'users', p.uid))
            .then(snap => {
              if (snap.exists()) {
                const remoteUser = snap.data();
                const updatedBalance = (Number(remoteUser.depositBalance) || 0) + entryFee;
                updateDoc(doc(db, 'users', p.uid), { depositBalance: updatedBalance }).catch(() => {});
              }
            })
            .catch(() => {});
        }
      });
    }

    match.status = 'cancelled';
    this.save();

    // Push to Firestore
    try {
      setDoc(doc(db, 'matches', match.id), cleanFirestorePayload(match), { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `matches/${match.id}`);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return true;
  }

  distributePrizeMoney({ matchId, payouts }) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return false;

    const topPlayers = [];

    payouts.forEach(p => {
      const user = this.findUserById(p.uid);
      if (user && p.winnings > 0) {
        user.winningBalance += p.winnings;
        this.updateUser(user.uid, { winningBalance: user.winningBalance });

        const payoutTrx = {
          id: 'payout_' + Math.random().toString(36).substring(2, 9),
          uid: user.uid,
          userIgn: user.ign,
          type: 'match_win',
          amount: p.winnings,
          method: 'Wallet',
          trxId: `WIN-${match.id.slice(-6).toUpperCase()}`,
          status: 'approved',
          matchId: match.id,
          createdAt: new Date().toISOString()
        };
        this.addTransaction(payoutTrx);
      }
      topPlayers.push({
        rank: p.rank || 1,
        ign: p.ign || (user ? user.ign : 'Player'),
        kills: p.kills || 0,
        winnings: p.winnings || 0
      });
    });

    match.status = 'completed';

    // Auto-update Results page: keep strictly the last 5 results
    const newResult = {
      id: 'res_' + Math.random().toString(36).substring(2, 9),
      matchTitle: match.title,
      category: match.category,
      map: match.map,
      completedAt: new Date().toISOString(),
      topPlayers: topPlayers.sort((a, b) => b.winnings - a.winnings)
    };

    this.results.unshift(newResult);
    if (this.results.length > 5) {
      this.results = this.results.slice(0, 5);
    }

    this.save();

    try {
      setDoc(doc(db, 'matches', match.id), cleanFirestorePayload(match), { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `matches/${match.id}`);
      });
      setDoc(doc(db, 'results', newResult.id), cleanFirestorePayload(newResult)).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `results/${newResult.id}`);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return true;
  }

  // Transactions
  addTransaction(trx) {
    const normalizedTrx = cleanFirestorePayload(trx);
    this.transactions.unshift(normalizedTrx);
    this.save();

    // Push to Firestore
    try {
      setDoc(doc(db, 'transactions', normalizedTrx.id), normalizedTrx).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `transactions/${normalizedTrx.id}`);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return normalizedTrx;
  }

  updateTransaction(trxId, updates) {
    const index = this.transactions.findIndex(t => t.id === trxId);
    if (index !== -1) {
      this.transactions[index] = cleanFirestorePayload({ ...this.transactions[index], ...updates });
      this.save();

      // Push to Firestore
      try {
        setDoc(doc(db, 'transactions', trxId), this.transactions[index], { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `transactions/${trxId}`);
        });
      } catch (e) {
        console.warn('Firestore write notice:', e);
      }

      return this.transactions[index];
    }
    return null;
  }

  // Settings
  updateSettings(updates) {
    this.settings = cleanFirestorePayload({ ...this.settings, ...updates });
    this.save();

    // Push to Firestore
    try {
      setDoc(doc(db, 'settings', 'global'), this.settings, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, 'settings/global');
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return this.settings;
  }

  // Notifications
  addNotification(notif) {
    const normalizedNotif = cleanFirestorePayload({
      ...notif,
      targetUid: notif.targetUid ?? null
    });
    this.notifications.unshift(normalizedNotif);
    this.save();

    // Push to Firestore
    try {
      setDoc(doc(db, 'notifications', normalizedNotif.id), normalizedNotif).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `notifications/${normalizedNotif.id}`);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return normalizedNotif;
  }

  // Mystery Box Orders
  addMysteryBoxOrder(order) {
    const normalizedOrder = cleanFirestorePayload(order);
    this.mysteryBoxOrders.unshift(normalizedOrder);
    this.save();

    // Push to Firestore
    try {
      setDoc(doc(db, 'mystery_box_orders', normalizedOrder.id), normalizedOrder).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `mystery_box_orders/${normalizedOrder.id}`);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return normalizedOrder;
  }

  fulfillMysteryBoxOrder(orderId, giftNote = 'Gift sent') {
    const order = this.mysteryBoxOrders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = 'fulfilled';
    order.fulfilledAt = new Date().toISOString();
    order.giftNote = giftNote;

    // Automatic push notification to the user's app account with the EXACT required text:
    const notif = {
      id: 'notif_mbox_' + Math.random().toString(36).substring(2, 9),
      title: '🎁 মিস্ট্রি বক্স গিফট সেন্ড করা হয়েছে!',
      message: 'আপনার অ্যাকাউন্টে মিস্ট্রি বক্সের গিফট সেন্ড করা হয়েছে',
      category: 'reward',
      targetUid: order.uid ?? null,
      createdAt: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(notif);

    this.save();

    // Push order update and notification to Firestore
    try {
      setDoc(doc(db, 'mystery_box_orders', orderId), cleanFirestorePayload(order), { merge: true }).catch(() => {});
      setDoc(doc(db, 'notifications', notif.id), cleanFirestorePayload(notif)).catch(() => {});
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return { order, notif };
  }

  // Banners (unlimited banners with Firestore create & delete sync)
  updateBanners(banners) {
    const nextIds = new Set(banners.map(b => b.id));
    const removedIds = (this.banners || [])
      .filter(b => b && b.id && !nextIds.has(b.id))
      .map(b => b.id);

    removedIds.forEach(id => this.pendingDeletedBannerIds.add(id));

    const normalized = banners.map((b, idx) => {
      this.pendingDeletedBannerIds.delete(b.id);
      return cleanFirestorePayload({ ...b, order: b.order || idx + 1 });
    });

    this.banners = normalized;
    this.save();

    try {
      normalized.forEach((b) => {
        setDoc(doc(db, 'banners', b.id), b, { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `banners/${b.id}`);
        });
      });
      removedIds.forEach((id) => {
        deleteDoc(doc(db, 'banners', id)).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, `banners/${id}`);
        });
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return this.banners;
  }
}

export const dbStore = new DatabaseStore();
export { app, firebaseConfig, db, auth, googleProvider };
