export type GameCategory = 'BR' | 'CS' | 'CSHeadshot' | 'LoneWolf' | 'LossToWin' | 'HeadshotLoneWolf';
export type SubCategory = 'Solo' | 'Duo' | 'Squad';

export interface PlayerRegistration {
  uid: string;
  ign: string;
  freeFireUid: string;
  slotNumber: number;
  kills?: number;
  winnings?: number;
  joinedAt: string;
  prizeDistributed?: boolean;
}

export interface Match {
  id: string;
  title: string;
  category: GameCategory;
  subCategory: SubCategory;
  map: string;
  entryFee: number;
  entryType: 'Paid' | 'Free';
  eventId?: string; // For special free match limits
  totalSlots: number;
  joinedPlayers: PlayerRegistration[];
  winPrize: number;
  perKillPrize: number;
  secondPrize?: number;
  thirdPrize?: number;
  matchTime: string; // ISO string or readable
  status: 'upcoming' | 'open' | 'live' | 'completed' | 'cancelled';
  roomId?: string;
  roomPassword?: string;
  customRules?: string;
}

export interface AppUser {
  uid: string;
  ign: string;
  freeFireUid: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  depositBalance: number;
  winningBalance: number;
  points: number;
  signupBonusLocked: number; // Unlocked upon first deposit
  hasDeposited: boolean;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  referralEarnings: number;
  deviceId: string;
  isMatchBanned: boolean;
  isPermanentlyBanned: boolean;
  savedPayoutMethod?: 'bKash' | 'Nagad';
  savedPayoutNumber?: string;
  lastSpinTimestamp?: string;
  spinCycleDays?: number;
  spinCyclePointsWon?: number;
  spinCycleStartDate?: string;
  freeEventsJoined: string[]; // event IDs joined to prevent duplicate free match joins
  createdAt: string;
}

export interface Transaction {
  id: string;
  uid: string;
  userIgn: string;
  type: 'deposit' | 'withdraw' | 'match_join' | 'match_refund' | 'match_win' | 'referral_bonus' | 'spin_reward' | 'point_redeem';
  amount: number;
  method?: 'bKash' | 'Nagad' | 'Points' | 'Wallet';
  trxId?: string;
  senderNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  matchId?: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl: string;
  actionType: 'video' | 'link' | 'in_app';
  active: boolean;
  order: number;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  category: 'system' | 'match' | 'wallet' | 'reward';
  createdAt: string;
  read?: boolean;
  targetUid?: string; // Target specific user account or undefined for broadcast
}

export interface MysteryBoxOrder {
  id: string;
  uid: string;
  userIgn: string;
  freeFireUid: string;
  phone?: string;
  pointsSpent: number;
  itemTitle: string;
  status: 'pending' | 'fulfilled';
  createdAt: string;
  fulfilledAt?: string;
  giftNote?: string;
}

export interface DeveloperProfile {
  name: string;
  roleTitle?: string;
  bio: string;
  phone: string;
  whatsappUrl: string;
  facebookUrl?: string;
  portfolioUrl?: string;
}

export interface SystemSettings {
  bKashNumber: string;
  bKashType: 'Personal' | 'Merchant';
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  whatsAppNumber: string;
  minDeposit: number;
  minWithdraw: number;
  signupBonus: number;
  referralMinDeposit: number; // Minimum deposit required to trigger referral bonus
  referralBonusPercent: number;
  referralFixedBonus: number; // e.g. 20 TK on friend's first deposit
  referralLifetimePassivePercent: number; // e.g. 1% lifetime passive commission
  referralFirstThreeDepositsPercent: number; // e.g. 5% on friend's first 3 deposits
  androidDownloadUrl: string;
  iosDownloadUrl: string;
  forcedUpdate: {
    enabled: boolean;
    minVersion: string;
    title: string;
    message: string;
    downloadUrl: string;
  };
  developerProfile?: DeveloperProfile;
  rules: {
    deposit: string;
    withdraw: string;
    matchJoin: string;
    pointRedeem: string;
    gameplay: string;
    general: string;
  };
}

export interface LeaderboardEntry {
  uid: string;
  ign: string;
  freeFireUid: string;
  amount: number;
  rank: number;
  isCurrentUser?: boolean;
}
