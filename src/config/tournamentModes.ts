import { GameCategory, SubCategory } from '../types';

export type ModeSectionId =
  | 'br'
  | 'cs'
  | 'cs_headshot'
  | 'lonewolf'
  | 'lw_headshot'
  | 'lw_losstowin';

export interface TournamentModeCard {
  id: string;
  sectionId: ModeSectionId;
  category: GameCategory;
  subCategory: SubCategory;
  title: string;
  bnTitle: string;
  shortTag: string;
  /**
   * Custom mode PNG logo/banner served from /public/assets/modes/.
   * The card automatically falls back to a styled esports emblem if loading fails.
   */
  imageUrl: string | null;
  expectedAssetHint: string;
  accentFrom: string;
  accentTo: string;
  badgeColor: string;
}

export interface TournamentModeSection {
  id: ModeSectionId;
  title: string;
  bnTitle: string;
  accentBarClass: string;
  category: GameCategory;
  allowedSubCategories: SubCategory[];
}

export const TOURNAMENT_MODE_SECTIONS: TournamentModeSection[] = [
  {
    id: 'br',
    title: 'Battle Royale (BR)',
    bnTitle: 'ব্যাটেল রয়্যাল (BR)',
    accentBarClass: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.7)]',
    category: 'BR',
    allowedSubCategories: ['Solo', 'Duo', 'Squad']
  },
  {
    id: 'cs',
    title: 'Clash Squad (CS)',
    bnTitle: 'ক্লাশ স্কোয়াড (CS)',
    accentBarClass: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]',
    category: 'CS',
    allowedSubCategories: ['Solo', 'Duo', 'Squad']
  },
  {
    id: 'cs_headshot',
    title: 'Clash Squad Headshot',
    bnTitle: 'ক্লাশ স্কোয়াড হেডশট',
    accentBarClass: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]',
    category: 'CSHeadshot',
    allowedSubCategories: ['Solo', 'Duo', 'Squad']
  },
  {
    id: 'lonewolf',
    title: 'Lone Wolf',
    bnTitle: 'লোন উলফ',
    accentBarClass: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.7)]',
    category: 'LoneWolf',
    allowedSubCategories: ['Solo', 'Duo']
  },
  {
    id: 'lw_headshot',
    title: 'Lone Wolf Headshot',
    bnTitle: 'লোন উলফ হেডশট',
    accentBarClass: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]',
    category: 'HeadshotLoneWolf',
    allowedSubCategories: ['Solo', 'Duo']
  },
  {
    id: 'lw_losstowin',
    title: 'Lone Wolf Loss to Win',
    bnTitle: 'লোন উলফ লস টু উইন',
    accentBarClass: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]',
    category: 'LossToWin',
    allowedSubCategories: ['Solo', 'Duo']
  }
];

export const TOURNAMENT_MODE_CARDS: TournamentModeCard[] = [
  // 1. Battle Royale (BR): Solo, Duo, Squad
  {
    id: 'br_solo',
    sectionId: 'br',
    category: 'BR',
    subCategory: 'Solo',
    title: 'BR Solo',
    bnTitle: 'বিআর সোলো',
    shortTag: 'BR · SOLO',
    imageUrl: '/assets/modes/br-solo.png',
    expectedAssetHint: 'br-solo.png',
    accentFrom: 'from-blue-950/90',
    accentTo: 'to-orange-950/80',
    badgeColor: 'text-orange-400'
  },
  {
    id: 'br_duo',
    sectionId: 'br',
    category: 'BR',
    subCategory: 'Duo',
    title: 'BR Duo',
    bnTitle: 'বিআর ডুও',
    shortTag: 'BR · DUO',
    imageUrl: '/assets/modes/br-duo.png',
    expectedAssetHint: 'br-duo.png',
    accentFrom: 'from-cyan-950/90',
    accentTo: 'to-amber-950/80',
    badgeColor: 'text-amber-400'
  },
  {
    id: 'br_squad',
    sectionId: 'br',
    category: 'BR',
    subCategory: 'Squad',
    title: 'BR Squad',
    bnTitle: 'বিআর স্কোয়াড',
    shortTag: 'BR · SQUAD',
    imageUrl: '/assets/modes/br-squad.png',
    expectedAssetHint: 'br-squad.png',
    accentFrom: 'from-indigo-950/90',
    accentTo: 'to-orange-950/80',
    badgeColor: 'text-orange-300'
  },

  // 2. Clash Squad (CS): Solo, Duo, Squad
  {
    id: 'cs_solo',
    sectionId: 'cs',
    category: 'CS',
    subCategory: 'Solo',
    title: 'CS Solo (1v1)',
    bnTitle: 'সিএস সোলো (১v১)',
    shortTag: 'CS · 1V1',
    imageUrl: '/assets/modes/cs-solo.png',
    expectedAssetHint: 'cs-solo.png',
    accentFrom: 'from-sky-950/90',
    accentTo: 'to-indigo-950/80',
    badgeColor: 'text-sky-400'
  },
  {
    id: 'cs_duo',
    sectionId: 'cs',
    category: 'CS',
    subCategory: 'Duo',
    title: 'CS 2v2 (Duo)',
    bnTitle: 'সিএস ২v২ (ডুও)',
    shortTag: 'CS · 2V2',
    imageUrl: '/assets/modes/cs-2v2.png',
    expectedAssetHint: 'cs-2v2.png',
    accentFrom: 'from-blue-950/90',
    accentTo: 'to-purple-950/80',
    badgeColor: 'text-blue-400'
  },
  {
    id: 'cs_squad',
    sectionId: 'cs',
    category: 'CS',
    subCategory: 'Squad',
    title: 'CS 4v4 (Squad)',
    bnTitle: 'সিএস ৪v৪ (স্কোয়াড)',
    shortTag: 'CS · 4V4',
    imageUrl: '/assets/modes/cs-4v4.png',
    expectedAssetHint: 'cs-4v4.png',
    accentFrom: 'from-indigo-950/90',
    accentTo: 'to-rose-950/80',
    badgeColor: 'text-indigo-300'
  },

  // 3. Clash Squad Headshot (CS Headshot Only): Solo, Duo, Squad
  {
    id: 'cs_hs_solo',
    sectionId: 'cs_headshot',
    category: 'CSHeadshot',
    subCategory: 'Solo',
    title: 'CS Headshot 1v1',
    bnTitle: 'সিএস হেডশট ১v১',
    shortTag: 'CS HS · 1V1',
    imageUrl: '/assets/modes/cs-headshot-1v1.png',
    expectedAssetHint: 'cs-headshot-1v1.png',
    accentFrom: 'from-rose-950/90',
    accentTo: 'to-slate-950/90',
    badgeColor: 'text-rose-400'
  },
  {
    id: 'cs_hs_duo',
    sectionId: 'cs_headshot',
    category: 'CSHeadshot',
    subCategory: 'Duo',
    title: 'CS Headshot 2v2',
    bnTitle: 'সিএস হেডশট ২v২',
    shortTag: 'CS HS · 2V2',
    imageUrl: '/assets/modes/cs-headshot-2v2.png',
    expectedAssetHint: 'cs-headshot-2v2.png',
    accentFrom: 'from-red-950/90',
    accentTo: 'to-orange-950/80',
    badgeColor: 'text-red-400'
  },
  {
    id: 'cs_hs_squad',
    sectionId: 'cs_headshot',
    category: 'CSHeadshot',
    subCategory: 'Squad',
    title: 'CS Headshot 4v4',
    bnTitle: 'সিএস হেডশট ৪v৪',
    shortTag: 'CS HS · 4V4',
    imageUrl: '/assets/modes/cs-headshot-4v4.png',
    expectedAssetHint: 'cs-headshot-4v4.png',
    accentFrom: 'from-rose-950/90',
    accentTo: 'to-amber-950/80',
    badgeColor: 'text-rose-300'
  },

  // 4. Lone Wolf: Solo, Duo
  {
    id: 'lw_1v1',
    sectionId: 'lonewolf',
    category: 'LoneWolf',
    subCategory: 'Solo',
    title: 'LW 1v1 (Solo)',
    bnTitle: 'লোন উলফ ১v১',
    shortTag: 'LW · 1V1',
    imageUrl: '/assets/modes/lw-1v1.png',
    expectedAssetHint: 'lw-1v1.png',
    accentFrom: 'from-cyan-950/90',
    accentTo: 'to-blue-950/80',
    badgeColor: 'text-cyan-400'
  },
  {
    id: 'lw_2v2',
    sectionId: 'lonewolf',
    category: 'LoneWolf',
    subCategory: 'Duo',
    title: 'LW 2v2 (Duo)',
    bnTitle: 'লোন উলফ ২v২',
    shortTag: 'LW · 2V2',
    imageUrl: '/assets/modes/lw-2v2.png',
    expectedAssetHint: 'lw-2v2.png',
    accentFrom: 'from-teal-950/90',
    accentTo: 'to-indigo-950/80',
    badgeColor: 'text-teal-300'
  },

  // 5. Lone Wolf Headshot: Solo, Duo
  {
    id: 'lw_hs_1v1',
    sectionId: 'lw_headshot',
    category: 'HeadshotLoneWolf',
    subCategory: 'Solo',
    title: 'LW Headshot 1v1',
    bnTitle: 'এলডব্লিউ হেডশট ১v১',
    shortTag: 'LW HS · 1V1',
    imageUrl: '/assets/modes/lw-headshot-1v1.png',
    expectedAssetHint: 'lw-headshot-1v1.png',
    accentFrom: 'from-red-950/90',
    accentTo: 'to-fuchsia-950/80',
    badgeColor: 'text-red-400'
  },
  {
    id: 'lw_hs_2v2',
    sectionId: 'lw_headshot',
    category: 'HeadshotLoneWolf',
    subCategory: 'Duo',
    title: 'LW Headshot 2v2',
    bnTitle: 'এলডব্লিউ হেডশট ২v২',
    shortTag: 'LW HS · 2V2',
    imageUrl: '/assets/modes/lw-headshot-2v2.png',
    expectedAssetHint: 'lw-headshot-2v2.png',
    accentFrom: 'from-rose-950/90',
    accentTo: 'to-purple-950/80',
    badgeColor: 'text-pink-400'
  },

  // 6. Lone Wolf Loss to Win: Solo, Duo
  {
    id: 'lw_ltw_1v1',
    sectionId: 'lw_losstowin',
    category: 'LossToWin',
    subCategory: 'Solo',
    title: 'Loss to Win 1v1',
    bnTitle: 'লস টু উইন ১v১',
    shortTag: 'LTW · 1V1',
    imageUrl: '/assets/modes/lw-loss-to-win-1v1.png',
    expectedAssetHint: 'lw-loss-to-win-1v1.png',
    accentFrom: 'from-amber-950/90',
    accentTo: 'to-slate-950/90',
    badgeColor: 'text-amber-400'
  },
  {
    id: 'lw_ltw_2v2',
    sectionId: 'lw_losstowin',
    category: 'LossToWin',
    subCategory: 'Duo',
    title: 'Loss to Win 2v2',
    bnTitle: 'লস টু উইন ২v২',
    shortTag: 'LTW · 2V2',
    imageUrl: '/assets/modes/lw-loss-to-win-2v2.png',
    expectedAssetHint: 'lw-loss-to-win-2v2.png',
    accentFrom: 'from-orange-950/90',
    accentTo: 'to-purple-950/80',
    badgeColor: 'text-amber-300'
  }
];

export function getAllowedSubCategories(category: GameCategory): SubCategory[] {
  if (category === 'LoneWolf' || category === 'HeadshotLoneWolf' || category === 'LossToWin') {
    return ['Solo', 'Duo'];
  }
  return ['Solo', 'Duo', 'Squad'];
}

export function formatCategoryDisplay(category: GameCategory): string {
  switch (category) {
    case 'BR':
      return 'Battle Royale';
    case 'CS':
      return 'Clash Squad';
    case 'CSHeadshot':
      return 'CS Headshot';
    case 'LoneWolf':
      return 'Lone Wolf';
    case 'HeadshotLoneWolf':
      return 'LW Headshot';
    case 'LossToWin':
      return 'Loss to Win';
    default:
      return category;
  }
}

export function formatSubCategoryDisplay(category: GameCategory, subCategory: SubCategory): string {
  if (category === 'BR') return subCategory;
  if (subCategory === 'Solo') return '1v1 (Solo)';
  if (subCategory === 'Duo') return '2v2 (Duo)';
  return '4v4 (Squad)';
}
