import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { dbStore } from '../services/firebaseConfig';
import { securityService } from '../services/securityService';
import { referralService } from '../services/referralService';
import { autoPaymentService } from '../services/autoPaymentService';
import { auth, googleProvider } from '../services/firebaseClient';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signInWithPopup, signOut, EmailAuthProvider, reauthenticateWithCredential,
  onAuthStateChanged
} from 'firebase/auth';
import {
  AppUser, Match, Transaction, Banner, BroadcastNotification,
  SystemSettings, MysteryBoxOrder, GameCategory, SubCategory
} from '../types';
import { Language, getTranslation } from '../services/i18n';
import confetti from 'canvas-confetti';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentUser: AppUser | null;
  allUsers: AppUser[];
  matches: Match[];
  results: any[];
  banners: Banner[];
  notifications: BroadcastNotification[];
  transactions: Transaction[];
  mysteryBoxOrders: MysteryBoxOrder[];
  settings: SystemSettings;
  unreadCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMode: { category: GameCategory; subCategory: SubCategory } | null;
  openCategoryMode: (category: GameCategory, subCategory: SubCategory) => void;
  matchReturnTab: string;
  setMatchReturnTab: (tab: string) => void;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
  viewMode: 'mobile' | 'admin' | 'split';
  setViewMode: (mode: 'mobile' | 'admin' | 'split') => void;
  deviceFrame: 'iphone' | 'galaxy' | 'ipad' | 'responsive';
  setDeviceFrame: (frame: 'iphone' | 'galaxy' | 'ipad' | 'responsive') => void;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  signup: (params: { ign: string; freeFireUid: string; identifier: string; pass: string; referralCode?: string }) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string; isNewUser?: boolean }>;
  logout: () => Promise<void>;
  switchUser: (uid: string) => void;
  joinMatch: (matchId: string, slotNumber: number) => { success: boolean; message?: string };
  submitDeposit: (params: { amount: number; method: 'bKash' | 'Nagad'; trxId: string; senderNumber: string; paymentType: string }) => Promise<{ success: boolean; message?: string }>;
  submitWithdraw: (params: { amount: number; method: 'bKash' | 'Nagad'; payoutNumber: string; passwordConfirm: string }) => Promise<{ success: boolean; message?: string }>;
  spinWheel: () => { success: boolean; prize: { label: string; points: number; cash: number }; message?: string };
  redeemPoints: (type: 'voucher' | 'mystery_box') => { success: boolean; message?: string };
  fulfillMysteryBoxOrder: (orderId: string, giftNote?: string) => { success: boolean; message: string };
  updateProfile: (updates: Partial<AppUser>) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  dismissForcedUpdate: () => void;
  showForcedUpdate: boolean;
  setShowForcedUpdate: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataVersion, setDataVersion] = useState(0);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedMode, setSelectedMode] = useState<{ category: GameCategory; subCategory: SubCategory } | null>(null);
  const [matchReturnTab, setMatchReturnTab] = useState<string>('home');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'admin' | 'split'>('mobile');
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'galaxy' | 'ipad' | 'responsive'>('iphone');
  const [showForcedUpdate, setShowForcedUpdate] = useState(false);

  const didInitUserRef = useRef(false);
  const hasLoggedOutRef = useRef<boolean>((() => {
    try {
      return sessionStorage.getItem('stormff_logged_out') === '1';
    } catch {
      return false;
    }
  })());

  // Language state (persisted, defaults to 'bn' for native Bangladeshi Free Fire audience)
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ff_arena_lang');
      return (saved === 'en' || saved === 'bn') ? (saved as Language) : 'bn';
    } catch {
      return 'bn';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ff_arena_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string) => getTranslation(key, language);

  // Sync with reactive dbStore
  useEffect(() => {
    const unsubscribe = dbStore.subscribe(() => {
      setDataVersion(v => v + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Sync with Firebase Auth state on boot/auth transitions (never overrides explicit logout)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (hasLoggedOutRef.current) return;
      if (firebaseUser) {
        const matched = dbStore.users.find(
          (u: AppUser) =>
            u.uid === firebaseUser.uid ||
            (firebaseUser.email && u.email?.toLowerCase() === firebaseUser.email.toLowerCase())
        );
        if (matched && !matched.isPermanentlyBanned) {
          didInitUserRef.current = true;
          setCurrentUser(matched);
          try {
            localStorage.setItem('stormff_session_uid', matched.uid);
          } catch {
            // ignore
          }
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Update current user reference when data changes without re-authenticating logged-out users
  useEffect(() => {
    if (hasLoggedOutRef.current) {
      return;
    }

    if (!currentUser) {
      if (!didInitUserRef.current) {
        didInitUserRef.current = true;
        let savedUid: string | null = null;
        try {
          savedUid = localStorage.getItem('stormff_session_uid');
        } catch {
          savedUid = null;
        }
        const restored = savedUid ? dbStore.findUserById(savedUid) : null;
        if (restored && !restored.isPermanentlyBanned) {
          setCurrentUser(restored);
        }
      }
    } else {
      const refreshed = dbStore.findUserById(currentUser.uid);
      if (refreshed) {
        setCurrentUser(refreshed);
      }
    }
  }, [dataVersion, currentUser]);

  // Check forced update setting
  useEffect(() => {
    if (dbStore.settings?.forcedUpdate?.enabled) {
      setShowForcedUpdate(true);
    }
  }, [dataVersion]);

  // Check deep link referral on mount
  useEffect(() => {
    referralService.detectDeepLinkReferral();
  }, []);

  const markUserSessionActive = (uid: string) => {
    hasLoggedOutRef.current = false;
    didInitUserRef.current = true;
    try {
      sessionStorage.removeItem('stormff_logged_out');
      localStorage.setItem('stormff_session_uid', uid);
    } catch {
      // ignore
    }
  };

  const DEMO_PASSWORDS: Record<string, string> = {
    'player@stormff.com': 'pass123',
    'shadow@stormff.com': 'pass123',
    'admin@stormff.com': 'admin123'
  };

  const login = async (identifier: string, pass: string) => {
    const clean = identifier.trim().toLowerCase();
    if (!pass || !pass.trim()) {
      return { success: false, message: 'Please enter your account password.' };
    }

    let firebaseVerified = false;
    let firebaseAuthError: any = null;

    // 1. Attempt Firebase Auth sign-in if email format
    if (clean.includes('@')) {
      try {
        const cred = await signInWithEmailAndPassword(auth, clean, pass);
        if (cred.user) {
          firebaseVerified = true;
          const matchedUser = dbStore.users.find(
            (u: AppUser) => u.email?.toLowerCase() === clean || u.uid === cred.user.uid
          );
          if (matchedUser) {
            if (matchedUser.isPermanentlyBanned) {
              return { success: false, message: 'Your account has been permanently suspended for anti-cheat violation.' };
            }
            await securityService.savePasswordVerifier(matchedUser.uid, matchedUser.email, pass);
            markUserSessionActive(matchedUser.uid);
            setCurrentUser(matchedUser);
            return { success: true };
          }
        }
      } catch (authErr: any) {
        firebaseAuthError = authErr;
        console.warn('Firebase email auth notice:', authErr?.code || authErr?.message);
      }
    }

    // 2. Database lookup
    const user = dbStore.users.find((u: AppUser) =>
      (u.email && u.email.toLowerCase() === clean) ||
      u.freeFireUid === clean
    );

    if (!user) {
      return { success: false, message: 'User not found. Please register with your Gmail address or check your Free Fire UID.' };
    }
    if (user.isPermanentlyBanned) {
      return { success: false, message: 'Your account has been permanently suspended for anti-cheat violation.' };
    }

    // Enforce password validation for demo & local accounts when Firebase Auth did not confirm
    if (!firebaseVerified) {
      const userEmail = (user.email || '').toLowerCase();
      const expectedDemoPass = DEMO_PASSWORDS[userEmail];
      if (expectedDemoPass) {
        if (pass !== expectedDemoPass) {
          return { success: false, message: 'Incorrect email or password!' };
        }
      } else {
        const localCheck = await securityService.verifyPasswordVerifier(user.uid, user.email, pass);
        if (localCheck === false) {
          return { success: false, message: 'Incorrect email or password!' };
        }
        if (
          localCheck === null &&
          (firebaseAuthError?.code === 'auth/wrong-password' ||
            firebaseAuthError?.code === 'auth/invalid-credential' ||
            firebaseAuthError?.code === 'auth/invalid-login-credentials')
        ) {
          return { success: false, message: 'Incorrect email or password!' };
        }
      }
    }

    await securityService.savePasswordVerifier(user.uid, user.email, pass);
    markUserSessionActive(user.uid);
    setCurrentUser(user);
    return { success: true };
  };

  const signup = async ({ ign, freeFireUid, identifier, pass, referralCode }: {
    ign: string;
    freeFireUid: string;
    identifier: string;
    pass: string;
    referralCode?: string;
  }) => {
    if (!ign || ign.trim().length < 2) {
      return { success: false, message: 'Please enter a valid In-Game Name (IGN).' };
    }

    if (!securityService.isValidFFUid(freeFireUid)) {
      return { success: false, message: 'Invalid Free Fire UID! Must be 8 to 11 digits.' };
    }

    // Strictly validate Email format & domain whitelist before proceeding to Firebase Auth
    const cleanEmail = identifier.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Please enter a valid Gmail, Outlook, or Yahoo email address.' };
    }

    // Strict Email Domain Whitelist + Temp Mail Blocking Engine
    if (!securityService.isAllowedRegistrationEmail(cleanEmail) || securityService.isTemporaryEmail(cleanEmail)) {
      return {
        success: false,
        message: 'Only Gmail, Outlook, and Yahoo accounts are allowed for registration. Temporary or disposable emails are strictly blocked.'
      };
    }

    // Check device limit (Max 2 accounts per physical device)
    const currentDeviceId = securityService.getDeviceId();
    const deviceCheck = securityService.checkDeviceLimit(dbStore.users, currentDeviceId);
    if (!deviceCheck.allowed) {
      return { success: false, message: deviceCheck.message };
    }

    // Check if duplicate FF UID or Email
    const existing = dbStore.users.find((u: AppUser) => 
      u.freeFireUid === freeFireUid.trim() || u.email === cleanEmail
    );
    if (existing) {
      return { success: false, message: 'An account with this Free Fire UID or Email already exists!' };
    }

    if (!pass || pass.trim().length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // Register with Firebase Authentication
    let firebaseUid = '';
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      firebaseUid = cred.user.uid;
    } catch (e: any) {
      console.warn('Firebase createUser notice:', e?.message);
      if (e?.code === 'auth/email-already-in-use') {
        return { success: false, message: 'An account with this Email already exists! Please log in.' };
      }
    }

    // Check referrer
    let referrer: AppUser | undefined;
    const finalRefCode = referralCode?.trim().toUpperCase() || referralService.detectDeepLinkReferral();
    if (finalRefCode) {
      referrer = dbStore.users.find((u: AppUser) => u.referralCode === finalRefCode);
    }

    const newCode = referralService.generateReferralCode(ign);
    const signupBonus = dbStore.settings.signupBonus ?? 10;

    const newUser: AppUser = {
      uid: firebaseUid || ('user_' + Math.random().toString(36).substring(2, 9)),
      ign: ign.trim(),
      freeFireUid: freeFireUid.trim(),
      email: cleanEmail,
      role: 'user',
      depositBalance: 0,
      winningBalance: 0,
      points: 5, // 5 welcome bonus points
      signupBonusLocked: signupBonus,
      hasDeposited: false,
      referralCode: newCode,
      referredBy: referrer ? referrer.referralCode : undefined,
      referralCount: 0,
      referralEarnings: 0,
      deviceId: currentDeviceId,
      isMatchBanned: false,
      isPermanentlyBanned: false,
      spinCycleDays: 0,
      spinCyclePointsWon: 0,
      spinCycleStartDate: new Date().toISOString(),
      freeEventsJoined: [],
      createdAt: new Date().toISOString()
    };

    if (referrer) {
      dbStore.updateUser(referrer.uid, {
        referralCount: (referrer.referralCount || 0) + 1
      });
    }

    dbStore.addUser(newUser);
    await securityService.savePasswordVerifier(newUser.uid, newUser.email, pass);
    markUserSessionActive(newUser.uid);
    setCurrentUser(newUser);

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // ignore
    }

    return { 
      success: true, 
      message: `Account created successfully in Storm FF Club! ${signupBonus} TK signup bonus added (unlocks upon first deposit).` 
    };
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user) return { success: false, message: 'Google Sign-in failed.' };

      const existingUser = dbStore.users.find((u: AppUser) => 
        u.email?.toLowerCase() === user.email?.toLowerCase() || u.uid === user.uid
      );

      if (existingUser) {
        if (existingUser.isPermanentlyBanned) {
          return { success: false, message: 'Your account has been permanently suspended for anti-cheat violation.' };
        }
        markUserSessionActive(existingUser.uid);
        setCurrentUser(existingUser);
        return { success: true };
      }

      // New Google User - create profile
      const currentDeviceId = securityService.getDeviceId();
      const deviceCheck = securityService.checkDeviceLimit(dbStore.users, currentDeviceId);
      if (!deviceCheck.allowed) {
        return { success: false, message: deviceCheck.message };
      }

      const detectedRefCode = referralService.detectDeepLinkReferral();
      const referrer = detectedRefCode ? dbStore.users.find((u: AppUser) => u.referralCode === detectedRefCode) : undefined;
      const ignName = user.displayName?.split(' ')[0] || 'Storm_Player';
      const newCode = referralService.generateReferralCode(ignName);
      const signupBonus = dbStore.settings.signupBonus ?? 10;

      const newUser: AppUser = {
        uid: user.uid,
        ign: ignName,
        freeFireUid: '9' + Math.floor(10000000 + Math.random() * 90000000), // Auto-generated temporary FF UID
        email: user.email?.toLowerCase(),
        role: 'user',
        depositBalance: 0,
        winningBalance: 0,
        points: 5,
        signupBonusLocked: signupBonus,
        hasDeposited: false,
        referralCode: newCode,
        referredBy: referrer ? referrer.referralCode : undefined,
        referralCount: 0,
        referralEarnings: 0,
        deviceId: currentDeviceId,
        isMatchBanned: false,
        isPermanentlyBanned: false,
        spinCycleDays: 0,
        spinCyclePointsWon: 0,
        spinCycleStartDate: new Date().toISOString(),
        freeEventsJoined: [],
        createdAt: new Date().toISOString()
      };

      if (referrer) {
        dbStore.updateUser(referrer.uid, {
          referralCount: (referrer.referralCount || 0) + 1
        });
      }

      dbStore.addUser(newUser);
      markUserSessionActive(newUser.uid);
      setCurrentUser(newUser);

      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {
        // ignore
      }

      return { success: true, isNewUser: true, message: `Welcome to Storm FF Club! Please update your Free Fire UID in Profile.` };
    } catch (error: any) {
      console.warn('Google sign-in error:', error);
      return { success: false, message: error?.message || 'Google sign-in was cancelled or failed.' };
    }
  };

  const logout = async () => {
    hasLoggedOutRef.current = true;
    didInitUserRef.current = true;
    try {
      sessionStorage.setItem('stormff_logged_out', '1');
      localStorage.removeItem('stormff_session_uid');
    } catch {
      // ignore storage errors
    }
    setCurrentUser(null);
    setSelectedMatchId(null);
    setActiveTab('home');
    try {
      await signOut(auth);
    } catch {
      // ignore offline signOut errors
    }
  };

  const switchUser = (uid: string) => {
    const user = dbStore.findUserById(uid);
    if (user) {
      markUserSessionActive(user.uid);
      setCurrentUser(user);
    }
  };

  const joinMatch = (matchId: string, slotNumber: number) => {
    if (!currentUser) return { success: false, message: 'Please log in first' };
    if (currentUser.isMatchBanned || currentUser.isPermanentlyBanned) {
      return { success: false, message: 'You are currently banned from joining matches due to rule violations.' };
    }

    const match = dbStore.matches.find((m: Match) => m.id === matchId);
    if (!match) return { success: false, message: 'Match not found' };

    const normStatus = (match.status || 'open').trim().toLowerCase();
    if (normStatus !== 'open' && normStatus !== 'upcoming') {
      return {
        success: false,
        message:
          normStatus === 'live'
            ? 'This tournament is currently Live and no longer accepting new registrations.'
            : 'Match is no longer accepting registrations.'
      };
    }

    const joinedPlayers = Array.isArray(match.joinedPlayers) ? match.joinedPlayers : [];

    // Check if player already joined
    if (joinedPlayers.some((p: any) => p.uid === currentUser.uid)) {
      return { success: false, message: 'You have already joined this match!' };
    }

    if (joinedPlayers.length >= match.totalSlots) {
      return { success: false, message: 'This match is already full!' };
    }

    // Check slot availability
    if (joinedPlayers.some((p: any) => p.slotNumber === slotNumber)) {
      return { success: false, message: `Slot #${slotNumber} has just been taken. Please choose another slot.` };
    }

    // Daily Free Match Limit: User can join ONLY ONE free match per day across ALL active free matches
    const getLocalDayKey = (dateInput?: string | Date) => {
      const d = dateInput ? new Date(dateInput) : new Date();
      if (Number.isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const isFreeMatch = match.entryType === 'Free' || Number(match.entryFee || 0) <= 0;
    const todayKey = getLocalDayKey();
    const dailyFreeToken = `day:${todayKey}`;

    if (isFreeMatch) {
      const hasDailyToken = (currentUser.freeEventsJoined || []).includes(dailyFreeToken);
      const hasJoinedAnyFreeMatchToday = (dbStore.matches || []).some((m: Match) => {
        if (m.status === 'cancelled') return false;
        const mIsFree = m.entryType === 'Free' || Number(m.entryFee || 0) <= 0;
        if (!mIsFree) return false;
        return (m.joinedPlayers || []).some(
          (p: any) => p.uid === currentUser.uid && getLocalDayKey(p.joinedAt) === todayKey
        );
      });

      if (hasDailyToken || hasJoinedAnyFreeMatchToday) {
        return {
          success: false,
          message: 'You can only join 1 free match per day!'
        };
      }
    } else {
      // Paid matches: completely unlimited as long as user has sufficient wallet balance
      const totalAvailable = currentUser.depositBalance + currentUser.winningBalance;
      if (totalAvailable < match.entryFee) {
        return {
          success: false,
          message: `Insufficient balance! Entry fee is ${match.entryFee} TK. Please deposit at least 50 TK.`
        };
      }

      // Deduct entry fee: prefer depositBalance first, then winningBalance
      let newDeposit = currentUser.depositBalance;
      let newWinning = currentUser.winningBalance;

      if (newDeposit >= match.entryFee) {
        newDeposit -= match.entryFee;
      } else {
        const remaining = match.entryFee - newDeposit;
        newDeposit = 0;
        newWinning -= remaining;
      }

      // Referral commission for referrer if user was referred (credited to Deposit / Main Wallet Balance)
      if (currentUser.referredBy) {
        const referrer = dbStore.users.find((u: AppUser) => u.referralCode === currentUser.referredBy);
        if (referrer) {
          const commission = referralService.calculateMatchCommission(match.entryFee, dbStore.settings.referralBonusPercent);
          if (commission > 0) {
            const newRefDeposit = (referrer.depositBalance || 0) + commission;
            const newRefEarnings = (referrer.referralEarnings || 0) + commission;
            dbStore.updateUser(referrer.uid, {
              depositBalance: newRefDeposit,
              referralEarnings: newRefEarnings
            });
            dbStore.addTransaction({
              id: 'ref_comm_' + Math.random().toString(36).substring(2, 9),
              uid: referrer.uid,
              userIgn: referrer.ign,
              type: 'referral_bonus',
              amount: commission,
              method: 'Wallet',
              status: 'approved',
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      currentUser.depositBalance = newDeposit;
      currentUser.winningBalance = newWinning;
    }

    // Auto Point Generation: Users earn 1 Point automatically for every match joined!
    currentUser.points = (currentUser.points || 0) + 1;

    // Track daily free match usage across all free matches
    if (isFreeMatch) {
      const eventId = match.eventId || match.id;
      const updatedFreeList = new Set<string>(currentUser.freeEventsJoined || []);
      updatedFreeList.add(dailyFreeToken);
      updatedFreeList.add(eventId);
      currentUser.freeEventsJoined = Array.from(updatedFreeList);
    }

    // Add player to match
    const updatedJoinedPlayers = [
      ...joinedPlayers,
      {
        uid: currentUser.uid,
        ign: currentUser.ign,
        freeFireUid: currentUser.freeFireUid,
        slotNumber,
        joinedAt: new Date().toISOString()
      }
    ];

    // Record join transaction
    dbStore.addTransaction({
      id: 'join_' + Math.random().toString(36).substring(2, 9),
      uid: currentUser.uid,
      userIgn: currentUser.ign,
      type: 'match_join',
      amount: match.entryFee,
      method: match.entryType === 'Free' ? 'Wallet' : 'Wallet',
      trxId: `JOIN-${match.id.slice(-4).toUpperCase()}-S${slotNumber}`,
      status: 'approved',
      matchId: match.id,
      createdAt: new Date().toISOString()
    });

    dbStore.updateUser(currentUser.uid, {
      depositBalance: currentUser.depositBalance,
      winningBalance: currentUser.winningBalance,
      points: currentUser.points,
      freeEventsJoined: currentUser.freeEventsJoined
    });

    dbStore.updateMatch(match.id, { joinedPlayers: updatedJoinedPlayers });

    try {
      confetti({ particleCount: 30, spread: 45 });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Successfully booked Slot #${slotNumber}! You earned +1 Storm Point. Check "My Matches" for Room ID & Password.`
    };
  };

  const submitDeposit = async ({ amount, method, trxId, senderNumber, paymentType }: {
    amount: number;
    method: 'bKash' | 'Nagad';
    trxId: string;
    senderNumber: string;
    paymentType: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Please log in' };

    const existingTrxIds = dbStore.transactions.filter((t: Transaction) => t.trxId).map((t: Transaction) => t.trxId!.toUpperCase());

    const validation = autoPaymentService.validateDepositSubmission({
      amount,
      trxId,
      senderNumber,
      method,
      paymentType,
      existingTrxIds,
      minDeposit: dbStore.settings.minDeposit ?? 50
    });

    if (!validation.valid) {
      return { success: false, message: validation.error };
    }

    // Save as Pending transaction for manual Admin review and approval in PayoutManager
    dbStore.addTransaction({
      id: 'dep_' + Math.random().toString(36).substring(2, 9),
      uid: currentUser.uid,
      userIgn: currentUser.ign,
      type: 'deposit',
      amount: validation.amount!,
      method,
      trxId: validation.cleanTrxId,
      senderNumber: senderNumber.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `Deposit request of ৳${validation.amount} submitted! Sent to Admin Panel for manual approval. Trx ID: ${validation.cleanTrxId}`
    };
  };

  const submitWithdraw = async ({ amount, method, payoutNumber, passwordConfirm }: {
    amount: number;
    method: 'bKash' | 'Nagad';
    payoutNumber: string;
    passwordConfirm: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Please log in' };

    // Dynamic minimum withdrawal from winning balance only
    const minWd = dbStore.settings.minWithdraw ?? 50;
    if (amount < minWd) {
      return { success: false, message: `Minimum withdrawal is ${minWd} TK strictly enforced.` };
    }

    if (amount > currentUser.winningBalance) {
      return {
        success: false,
        message: `Insufficient winning balance! You can only withdraw from Winning Balance (${currentUser.winningBalance} TK). Deposit balance must be played in matches.`
      };
    }

    if (!payoutNumber || payoutNumber.trim().length < 11) {
      return { success: false, message: 'Please enter a valid 11-digit phone number.' };
    }

    // Strict Password Verification Security before creating any withdrawal request
    if (!passwordConfirm || !passwordConfirm.trim()) {
      return { success: false, message: 'Incorrect password! Withdrawal request cancelled.' };
    }

    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const expectedDemoPass = DEMO_PASSWORDS[userEmail];
    let isPasswordValid = false;

    const activeFirebaseUser = auth.currentUser;
    const isPasswordProviderActive = Boolean(
      activeFirebaseUser &&
      activeFirebaseUser.email &&
      activeFirebaseUser.email.toLowerCase() === userEmail &&
      activeFirebaseUser.providerData?.some(p => p.providerId === 'password')
    );

    if (isPasswordProviderActive && activeFirebaseUser?.email) {
      // Strictly re-authenticate against live Firebase Auth credential
      try {
        const credential = EmailAuthProvider.credential(activeFirebaseUser.email, passwordConfirm);
        await reauthenticateWithCredential(activeFirebaseUser, credential);
        isPasswordValid = true;
        await securityService.savePasswordVerifier(currentUser.uid, currentUser.email, passwordConfirm);
      } catch {
        return { success: false, message: 'Incorrect password! Withdrawal request cancelled.' };
      }
    } else if (expectedDemoPass) {
      // Strictly verify built-in demo account password
      if (passwordConfirm !== expectedDemoPass) {
        return { success: false, message: 'Incorrect password! Withdrawal request cancelled.' };
      }
      isPasswordValid = true;
    } else {
      // Verify against stored non-reversible SHA-256 verifier first
      const localCheck = await securityService.verifyPasswordVerifier(currentUser.uid, currentUser.email, passwordConfirm);
      if (localCheck === true) {
        isPasswordValid = true;
      } else if (localCheck === false) {
        return { success: false, message: 'Incorrect password! Withdrawal request cancelled.' };
      } else if (userEmail) {
        // Fallback: verify directly via Firebase Email/Password signIn if no local verifier exists yet
        try {
          const cred = await signInWithEmailAndPassword(auth, userEmail, passwordConfirm);
          if (cred.user) {
            isPasswordValid = true;
            await securityService.savePasswordVerifier(currentUser.uid, currentUser.email, passwordConfirm);
          }
        } catch {
          return { success: false, message: 'Incorrect password! Withdrawal request cancelled.' };
        }
      }
    }

    if (!isPasswordValid) {
      return { success: false, message: 'Incorrect password! Withdrawal request cancelled.' };
    }

    // Deduct immediately from winning balance ONLY after password validation succeeds
    const updatedWinning = currentUser.winningBalance - amount;

    const trx = dbStore.addTransaction({
      id: 'wd_' + Math.random().toString(36).substring(2, 9),
      uid: currentUser.uid,
      userIgn: currentUser.ign,
      type: 'withdraw',
      amount,
      method,
      senderNumber: payoutNumber.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    dbStore.updateUser(currentUser.uid, {
      winningBalance: updatedWinning,
      savedPayoutMethod: method,
      savedPayoutNumber: payoutNumber.trim()
    });

    return {
      success: true,
      message: `Withdrawal request for ${amount} TK submitted! Our Payout Admin will process it via ${method}. Trx ID: ${trx.id}`
    };
  };

  const spinWheel = () => {
    if (!currentUser) return { success: false, prize: { label: '', points: 0, cash: 0 }, message: 'Please log in' };

    // 24-Hour Cooldown & 12:00 AM reset logic
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (currentUser.lastSpinTimestamp) {
      const lastSpin = new Date(currentUser.lastSpinTimestamp).getTime();
      if (lastSpin >= todayMidnight) {
        const msRemaining = (todayMidnight + 86400000) - now.getTime();
        const hours = Math.floor(msRemaining / 3600000);
        const mins = Math.floor((msRemaining % 3600000) / 60000);
        return {
          success: false,
          prize: { label: '', points: 0, cash: 0 },
          message: `Daily spin already used today! Resets in ${hours}h ${mins}m at 12:00 AM.`
        };
      }
    }

    // 1–5 Day Cycle Management:
    // A cycle spans 5 calendar days.
    // Within each 5-day cycle, user can win at most 2 Storm Points (max 1 point per eligible day).
    let cycleStartDate = currentUser.spinCycleStartDate ? new Date(currentUser.spinCycleStartDate).getTime() : 0;
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    let cyclePointsWon = currentUser.spinCyclePointsWon || 0;
    let cycleDays = currentUser.spinCycleDays || 0;

    // If no cycle or cycle has exceeded 5 days, start a new 5-day cycle
    if (!cycleStartDate || (now.getTime() - cycleStartDate) >= FIVE_DAYS_MS) {
      cycleStartDate = todayMidnight;
      cyclePointsWon = 0;
      cycleDays = 0;
    }

    cycleDays += 1;

    // Strict Profit Protection & 1-5 Day Cycle Point Capping:
    // Wheel segments display 6 options:
    // 1. "Better Luck Next Time 😊"
    // 2. "100 Diamond 💎" (Visual engagement only - NEVER lands)
    // 3. "Weekly 💎" (Visual engagement only - NEVER lands)
    // 4. "1 Storm Point ✨"
    // 5. "500 Taka 💸" (Visual engagement only - NEVER lands)
    // 6. "Monthly 💎" (Visual engagement only - NEVER lands)
    //
    // The backend probability guarantees that the wheel strictly lands on either
    // "1 Storm Point ✨" (if eligible in current 5-day cycle) or "Better Luck Next Time 😊",
    // 100% protecting admin finances.
    let prize = { label: 'Better Luck Next Time 😊', points: 0, cash: 0 };

    if (cyclePointsWon < 2) {
      const rand = Math.random();
      if (rand < 0.50) {
        prize = { label: '1 Storm Point ✨', points: 1, cash: 0 };
        cyclePointsWon += 1;
      }
    }

    const updatedPoints = (currentUser.points || 0) + prize.points;

    dbStore.updateUser(currentUser.uid, {
      points: updatedPoints,
      lastSpinTimestamp: now.toISOString(),
      spinCycleStartDate: new Date(cycleStartDate).toISOString(),
      spinCyclePointsWon: cyclePointsWon,
      spinCycleDays: cycleDays
    });

    if (prize.points > 0) {
      try {
        confetti({ particleCount: 35, spread: 50 });
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      prize,
      message: prize.points > 0 ? `Congratulations! You won: ${prize.label}` : `Better Luck Next Time 😊 Try again tomorrow after 12:00 AM!`
    };
  };

  const redeemPoints = (type: 'voucher' | 'mystery_box') => {
    if (!currentUser) return { success: false, message: 'Please log in' };

    if (type === 'voucher') {
      // 20 points for 10 TK BR match voucher
      if ((currentUser.points || 0) < 20) {
        return { success: false, message: 'You need at least 20 Points to redeem a 10 TK BR Match Voucher!' };
      }
      dbStore.updateUser(currentUser.uid, {
        points: currentUser.points - 20,
        depositBalance: currentUser.depositBalance + 10
      });
      dbStore.addTransaction({
        id: 'red_' + Math.random().toString(36).substring(2, 9),
        uid: currentUser.uid,
        userIgn: currentUser.ign,
        type: 'point_redeem',
        amount: 10,
        method: 'Points',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      return { success: true, message: 'Successfully redeemed 20 Points for 10 TK Match Balance!' };
    } else {
      // 50 points for 1 Mystery Box (Min 25 Diamonds)
      if ((currentUser.points || 0) < 50) {
        return { success: false, message: 'You need at least 50 Points to redeem a Mystery Box!' };
      }
      dbStore.updateUser(currentUser.uid, {
        points: currentUser.points - 50
      });
      dbStore.addTransaction({
        id: 'box_' + Math.random().toString(36).substring(2, 9),
        uid: currentUser.uid,
        userIgn: currentUser.ign,
        type: 'point_redeem',
        amount: 50,
        method: 'Points',
        status: 'approved',
        createdAt: new Date().toISOString()
      });

      // Instant creation of Mystery Box Order in Admin Panel pending list
      const newOrder: MysteryBoxOrder = {
        id: 'mbox_' + Math.random().toString(36).substring(2, 9),
        uid: currentUser.uid,
        userIgn: currentUser.ign,
        freeFireUid: currentUser.freeFireUid,
        phone: currentUser.phone || '',
        pointsSpent: 50,
        itemTitle: '🎁 Diamond Mystery Box (Min 25 Diamonds)',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      dbStore.addMysteryBoxOrder(newOrder);

      try {
        confetti({ particleCount: 80, spread: 80 });
      } catch {
        // ignore
      }
      return {
        success: true,
        message: '🎁 Mystery Box Unlocked! Order sent to Admin for Diamond UID delivery.'
      };
    }
  };

  const fulfillMysteryBoxOrder = (orderId: string, giftNote?: string) => {
    const res = dbStore.fulfillMysteryBoxOrder(orderId, giftNote);
    if (!res) return { success: false, message: 'Order not found' };
    return {
      success: true,
      message: `Order marked as Done! Notification dispatched to ${res.order.userIgn}: 'আপনার অ্যাকাউন্টে মিস্ট্রি বক্সের গিফট সেন্ড করা হয়েছে'`
    };
  };

  const updateProfile = (updates: Partial<AppUser>) => {
    if (!currentUser) return;
    dbStore.updateUser(currentUser.uid, updates);
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    dbStore.updateMatch(matchId, updates);
  };

  const dismissForcedUpdate = () => {
    setShowForcedUpdate(false);
  };

  const openCategoryMode = (category: GameCategory, subCategory: SubCategory) => {
    setSelectedMode({ category, subCategory });
    setMatchReturnTab('category_matches');
    setActiveTab('category_matches');
  };

  const unreadCount = dbStore.notifications.filter(
    (n: BroadcastNotification) => !n.targetUid || n.targetUid === currentUser?.uid
  ).length;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        allUsers: dbStore.users,
        matches: dbStore.matches,
        results: dbStore.results,
        banners: dbStore.banners,
        notifications: dbStore.notifications,
        transactions: dbStore.transactions,
        mysteryBoxOrders: dbStore.mysteryBoxOrders || [],
        settings: dbStore.settings,
        unreadCount,
        activeTab,
        setActiveTab,
        selectedMode,
        openCategoryMode,
        matchReturnTab,
        setMatchReturnTab,
        selectedMatchId,
        setSelectedMatchId,
        viewMode,
        setViewMode,
        deviceFrame,
        setDeviceFrame,
        login,
        signup,
        signInWithGoogle,
        logout,
        switchUser,
        joinMatch,
        submitDeposit,
        submitWithdraw,
        spinWheel,
        redeemPoints,
        fulfillMysteryBoxOrder,
        updateProfile,
        updateMatch,
        showForcedUpdate,
        setShowForcedUpdate,
        dismissForcedUpdate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
