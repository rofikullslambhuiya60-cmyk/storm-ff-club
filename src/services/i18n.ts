export type Language = 'en' | 'bn';

export interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const translations: Translations = {
  // Brand & Header
  app_title: {
    en: 'Storm FF Club',
    bn: 'স্টর্ম এফএফ ক্লাব'
  },
  app_subtitle: {
    en: 'Free Fire Elite Tournaments • Automated Payouts',
    bn: 'ফ্রি ফায়ার এলিট টুর্নামেন্ট • অটোমেটেড পেমেন্ট'
  },
  lang_label: {
    en: 'Language',
    bn: 'ভাষা'
  },
  lang_toggle_btn: {
    en: 'বাংলা',
    bn: 'English'
  },

  // Navigation Tabs
  nav_play: {
    en: 'Play',
    bn: 'প্লে'
  },
  nav_results: {
    en: 'Results',
    bn: 'রেজাল্ট'
  },
  nav_my_matches: {
    en: 'My Matches',
    bn: 'আমার ম্যাচ'
  },
  nav_wallet: {
    en: 'Wallet',
    bn: 'ওয়ালেট'
  },
  nav_leaderboard: {
    en: 'Leaderboard',
    bn: 'লিডারবোর্ড'
  },
  nav_store: {
    en: 'Point Store',
    bn: 'পয়েন্ট স্টোর'
  },
  nav_profile: {
    en: 'Profile',
    bn: 'প্রোফাইল'
  },
  nav_spin: {
    en: 'Daily Spin',
    bn: 'দৈনিক স্পিন'
  },

  // Home Screen
  home_welcome: {
    en: 'Welcome back, Warrior!',
    bn: 'স্বাগতম, গেমিং যোদ্ধা!'
  },
  home_filter_all: {
    en: 'All Modes',
    bn: 'সকল মোড'
  },
  home_filter_br: {
    en: 'Battle Royale (BR)',
    bn: 'ব্যাটেল রয়্যাল (BR)'
  },
  home_filter_cs: {
    en: 'Clash Squad (CS)',
    bn: 'ক্লাশ স্কোয়াড (CS)'
  },
  home_filter_cs_headshot: {
    en: 'CS Headshot Only',
    bn: 'সিএস হেডশট মোড'
  },
  home_filter_lonewolf: {
    en: 'Lone Wolf',
    bn: 'লোন উলফ'
  },
  home_filter_headshot: {
    en: 'Headshot Only',
    bn: 'হেডশট মোড'
  },
  home_filter_losstowin: {
    en: 'Loss to Win',
    bn: 'লস টু উইন'
  },
  home_active_tournaments: {
    en: 'Active Tournaments',
    bn: 'চলতি টুর্নামেন্টসমূহ'
  },
  home_no_matches: {
    en: 'No tournaments found in this category. Check back shortly!',
    bn: 'এই ক্যাটাগরিতে বর্তমানে কোনো ম্যাচ নেই। কিছুক্ষণ পর আবার চেক করুন!'
  },
  home_quick_deposit: {
    en: 'Deposit',
    bn: 'ডিপোজিট'
  },
  home_quick_spin: {
    en: 'Spin & Win',
    bn: 'স্পিন করুন'
  },

  // Match Card & Details
  match_bhooya_prize: {
    en: 'Bhooya Prize',
    bn: 'বুইয়া প্রাইজ'
  },
  match_bhooya_winner: {
    en: 'Bhooya Winner',
    bn: 'বুইয়া উইনার'
  },
  match_per_kill: {
    en: 'Per Kill',
    bn: 'প্রতি কিল'
  },
  match_2nd_prize: {
    en: '2nd Place',
    bn: '২য় স্থান'
  },
  match_3rd_prize: {
    en: '3rd Place',
    bn: '৩য় স্থান'
  },
  match_entry_fee: {
    en: 'Entry Fee',
    bn: 'এন্ট্রি ফি'
  },
  match_free_badge: {
    en: 'FREE EVENT',
    bn: 'ফ্রি ইভেন্ট'
  },
  match_join_btn: {
    en: 'Join Tournament',
    bn: 'জয়েন করুন'
  },
  match_joined_badge: {
    en: 'Joined',
    bn: 'জয়েন করেছেন'
  },
  match_full_badge: {
    en: 'Full',
    bn: 'ফুল'
  },
  match_slots_status: {
    en: 'Slots Filled',
    bn: 'স্লট বুকড'
  },
  match_select_slot: {
    en: 'Select Your Slot',
    bn: 'আপনার স্লট নির্বাচন করুন'
  },
  match_slot_occupied: {
    en: 'Occupied',
    bn: 'বুকড'
  },
  match_slot_available: {
    en: 'Available',
    bn: 'খালি'
  },
  match_slot_selected: {
    en: 'Selected Slot',
    bn: 'নির্বাচিত স্লট'
  },
  match_countdown_label: {
    en: 'Match Starts In',
    bn: 'ম্যাচ শুরু হতে বাকি'
  },
  match_kickoff_time: {
    en: 'Kickoff Time',
    bn: 'ম্যাচ শুরু'
  },
  match_room_credentials: {
    en: 'Room ID & Password',
    bn: 'রুম আইডি ও পাসওয়ার্ড'
  },
  match_room_waiting: {
    en: 'Room details will be revealed 5 minutes prior to kickoff.',
    bn: 'ম্যাচ শুরু হওয়ার ৫ মিনিট আগে রুমের বিস্তারিত দেওয়া হবে।'
  },
  match_confirm_join: {
    en: 'Confirm Slot & Pay Entry Fee',
    bn: 'স্লট নিশ্চিত করুন ও ফি পরিশোধ করুন'
  },

  // Wallet Screen
  wallet_tab_deposit: {
    en: 'Instant Deposit',
    bn: 'ইনস্ট্যান্ট ডিপোজিট'
  },
  wallet_tab_withdraw: {
    en: 'Withdraw Winnings',
    bn: 'উইনিং টাকা তুলুন'
  },
  wallet_tab_history: {
    en: 'Transaction Logs',
    bn: 'লেনদেনের হিস্ট্রি'
  },
  wallet_deposit_bal: {
    en: 'Deposit Balance',
    bn: 'জমা ব্যালেন্স'
  },
  wallet_win_bal: {
    en: 'Winning Balance',
    bn: 'উইনিং ব্যালেন্স'
  },
  wallet_points_bal: {
    en: 'Storm Points',
    bn: 'স্টর্ম পয়েন্ট'
  },
  wallet_select_method: {
    en: 'Select Payment Method',
    bn: 'পেমেন্ট মেথড নির্বাচন করুন'
  },
  wallet_amount_input: {
    en: 'Amount (Minimum ৳50)',
    bn: 'টাকার পরিমাণ (সর্বনিম্ন ৫০ ৳)'
  },
  wallet_trxid_input: {
    en: 'Transaction ID (TrxID)',
    bn: 'ট্রানজেকশন আইডি (TrxID)'
  },
  wallet_sender_input: {
    en: 'Your Sender bKash / Nagad Number',
    bn: 'আপনার প্রেরক বিকাশ / নগদ নাম্বার'
  },
  wallet_deposit_btn: {
    en: 'Submit Deposit Request',
    bn: 'ডিপোজিট রিকোয়েস্ট পাঠান'
  },
  wallet_withdraw_amount: {
    en: 'Withdrawal Amount (Min ৳50 from Winnings)',
    bn: 'উত্তোলনের পরিমাণ (উইনিং ব্যালেন্স থেকে)'
  },
  wallet_payout_number: {
    en: 'Your Personal bKash / Nagad Number',
    bn: 'আপনার ব্যক্তিগত বিকাশ / নগদ নাম্বার'
  },
  wallet_account_pass: {
    en: 'Account Password Confirmation',
    bn: 'আপনার একাউন্ট পাসওয়ার্ড দিয়ে নিশ্চিত করুন'
  },
  wallet_withdraw_btn: {
    en: 'Confirm & Withdraw Now',
    bn: 'উইথড্র রিকোয়েস্ট সাবমিট করুন'
  },
  wallet_no_trx: {
    en: 'No transactions found yet.',
    bn: 'এখনো কোনো লেনদেনের হিস্ট্রি নেই।'
  },

  // Results Screen
  results_title: {
    en: 'Recent Match Results',
    bn: 'সাম্প্রতিক টুর্নামেন্ট রেজাল্ট'
  },
  results_top5_notice: {
    en: 'Auto-updating official records. Only the last 5 completed matches are maintained.',
    bn: 'স্বয়ংক্রিয়ভাবে সংরক্ষিত সাম্প্রতিক সেরা ৫টি সম্পন্ন ম্যাচের অফিশিয়াল ফলাফল।'
  },
  results_total_distributed: {
    en: 'Prize Money Distributed',
    bn: 'মোট প্রাইজ বিতরণ সম্পন্ন'
  },
  results_kills_label: {
    en: 'Kills',
    bn: 'কিল'
  },
  results_won_label: {
    en: 'Prize Won',
    bn: 'জিতলেন'
  },

  // My Matches Screen
  mymatches_title: {
    en: 'My Joined Matches',
    bn: 'আমার জয়েন করা ম্যাচ'
  },
  mymatches_subtitle: {
    en: 'View your booked slots and secret room credentials.',
    bn: 'আপনার বুক করা স্লট ও গোপন রুমের তথ্য দেখুন।'
  },
  mymatches_empty: {
    en: 'You have not joined any upcoming matches yet. Head to Play to register!',
    bn: 'আপনি এখনো কোনো টুর্নামেন্টে জয়েন করেননি। প্লে অপশনে গিয়ে জয়েন করুন!'
  },
  mymatches_room_ready: {
    en: 'ROOM CREDENTIALS READY',
    bn: 'রুমের তথ্য উন্মুক্ত করা হয়েছে'
  },
  mymatches_copy_room: {
    en: 'Copy ID',
    bn: 'আইডি কপি'
  },
  mymatches_copy_pass: {
    en: 'Copy Pass',
    bn: 'পাস কপি'
  },

  // Leaderboard Screen
  lb_title: {
    en: 'Storm FF Club Hall of Fame',
    bn: 'স্টর্ম এফএফ ক্লাব লিডারবোর্ড'
  },
  lb_tab_24h: {
    en: '24-Hour Top Earners',
    bn: '২৪ ঘণ্টার সেরা উইনার'
  },
  lb_tab_referrers: {
    en: 'Top Referrers',
    bn: 'সেরা রেফারার'
  },
  lb_rank_1: {
    en: 'Champion',
    bn: 'চ্যাম্পিয়ন'
  },

  // Spin Wheel Screen
  spin_title: {
    en: 'Daily Fortune Spin Wheel',
    bn: 'দৈনিক ফ্রি স্পিন হুইল'
  },
  spin_subtitle: {
    en: 'Spin once every 24 hours. Resets at 12:00 AM midnight daily.',
    bn: 'প্রতি ২৪ ঘণ্টায় একবার ফ্রি স্পিন করার সুযোগ। প্রতিদিন রাত ১২:০০ টায় রিসেট হয়।'
  },
  spin_btn_spin: {
    en: 'SPIN FOR FREE NOW',
    bn: 'এখনই ফ্রি স্পিন করুন'
  },
  spin_btn_spinning: {
    en: 'Wheel is Spinning...',
    bn: 'হুইল ঘুরছে...'
  },
  spin_cooldown_active: {
    en: 'Daily Spin Claimed for Today',
    bn: 'আজকের দৈনিক স্পিন সম্পন্ন হয়েছে'
  },
  spin_cooldown_sub: {
    en: 'Your free spin resets automatically at 12:00 AM midnight!',
    bn: 'আপনার ফ্রি স্পিন রাত ১২:০০ টায় পুনরায় সচল হবে!'
  },
  spin_btn_next: {
    en: 'Next Spin at 12:00 AM',
    bn: 'পরবর্তী স্পিন রাত ১২:০০ টায়'
  },

  // Point Store Screen
  store_title: {
    en: 'Point Redemption Store',
    bn: 'পয়েন্ট রিডিম স্টোর'
  },
  store_subtitle: {
    en: 'Convert your Storm Points into free tournament tickets and rewards.',
    bn: 'আপনার অর্জিত স্টর্ম পয়েন্ট দিয়ে ফ্রি টুর্নামেন্ট টিকেট ও রিওয়ার্ড নিন।'
  },
  store_current_points: {
    en: 'Your Available Points',
    bn: 'আপনার জমা পয়েন্ট'
  },
  store_redeem_btn: {
    en: 'Redeem Now',
    bn: 'রিডিম করুন'
  },

  // Profile Screen
  profile_title: {
    en: 'Player Profile',
    bn: 'প্লেয়ার প্রোফাইল'
  },
  profile_edit_btn: {
    en: 'Edit Profile',
    bn: 'প্রোফাইল এডিট'
  },
  profile_refer_title: {
    en: 'Refer & Earn Real Cash',
    bn: 'রেফার করুন ও আয় করুন'
  },
  profile_refer_sub: {
    en: 'Invite your Free Fire squadmates and get auto-commissions instantly!',
    bn: 'আপনার ফ্রি ফায়ার বন্ধুদের ইনভাইট করুন এবং প্রতিটি ডিপোজিট ও ম্যাচে কমিশন পান!'
  },
  profile_copy_code: {
    en: 'Copy Code',
    bn: 'কোড কপি'
  },
  profile_copy_link: {
    en: 'Get Deep Link',
    bn: 'রেফারেল লিংক নিন'
  },
  profile_share_link: {
    en: 'Share Link',
    bn: 'শেয়ার করুন'
  },
  profile_logout_btn: {
    en: 'Log Out / Switch Account',
    bn: 'লগআউট / একাউন্ট পরিবর্তন'
  },

  // Auth Screen
  auth_signup_tab: {
    en: 'Create Account',
    bn: 'নতুন একাউন্ট খুলুন'
  },
  auth_login_tab: {
    en: 'Log In',
    bn: 'লগইন করুন'
  },
  auth_ign_placeholder: {
    en: 'Enter Exact In-Game Name (IGN)',
    bn: 'ফ্রি ফায়ার গেম নেম (IGN) লিখুন'
  },
  auth_uid_placeholder: {
    en: 'Enter 8-10 digit Free Fire UID',
    bn: 'ফ্রি ফায়ার ইউআইডি (UID) লিখুন'
  },
  auth_identifier_placeholder: {
    en: 'Enter Gmail / Email Address',
    bn: 'জিমেইল / ইমেইল ঠিকানা লিখুন'
  },
  auth_password_placeholder: {
    en: 'Enter Secure Password (Min 6 chars)',
    bn: 'পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)'
  },
  auth_referral_placeholder: {
    en: 'Referral Code (Optional)',
    bn: 'রেফারেল কোড (যদি থাকে)'
  },
  auth_submit_signup: {
    en: 'Create Free Account & Claim +৳10 Bonus',
    bn: 'একাউন্ট খুলুন ও +১০ ৳ বোনাস গ্রহণ করুন'
  },
  auth_submit_login: {
    en: 'Log In to Storm FF Club',
    bn: 'স্টর্ম এফএফ ক্লাবে প্রবেশ করুন'
  },
  auth_forgot_pass_link: {
    en: 'Forgot Password? Reset via Email',
    bn: 'পাসওয়ার্ড ভুলে গেছেন? ইমেইল দিয়ে রিসেট করুন'
  }
};

export const getTranslation = (key: string, lang: Language): string => {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key;
};
