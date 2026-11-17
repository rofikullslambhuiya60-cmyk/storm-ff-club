import React, { useState } from 'react';
import { 
  Swords, Plus, Edit3, XCircle, CheckCircle2, 
  Users, Key, AlertTriangle, Clock, DollarSign, Award, ShieldBan 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';
import { Match, GameCategory, SubCategory } from '../types';
import { sanitizeUnsignedIntInput, toSafeNumber } from '../utils/numberInput';
import {
  getAllowedSubCategories,
  formatCategoryDisplay,
  formatSubCategoryDisplay
} from '../config/tournamentModes';

export const MatchManager: React.FC = () => {
  const { matches, allUsers } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatchForPayout, setSelectedMatchForPayout] = useState<Match | null>(null);
  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<Match | null>(null);
  const [cancellingMatch, setCancellingMatch] = useState<Match | null>(null);

  // Form states for creating match
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GameCategory>('BR');
  const [subCategory, setSubCategory] = useState<SubCategory>('Solo');
  const [map, setMap] = useState('Bermuda');
  const [entryFee, setEntryFee] = useState<string>('30');
  const [entryType, setEntryType] = useState<'Paid' | 'Free'>('Paid');
  const [totalSlots, setTotalSlots] = useState<string>('48');
  const [winPrize, setWinPrize] = useState<string>('450');
  const [perKillPrize, setPerKillPrize] = useState<string>('15');
  const [includeSecondPrize, setIncludeSecondPrize] = useState(true);
  const [secondPrize, setSecondPrize] = useState<string>('200');
  const [includeThirdPrize, setIncludeThirdPrize] = useState(true);
  const [thirdPrize, setThirdPrize] = useState<string>('100');
  const [matchMinutesFromNow, setMatchMinutesFromNow] = useState<string>('180');
  const [status, setStatus] = useState<'open' | 'upcoming' | 'live'>('open');
  const [customRules, setCustomRules] = useState('Strict Mobile Only. Emulators banned.');

  // Form states for editing published/live match
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<GameCategory>('BR');
  const [editSubCategory, setEditSubCategory] = useState<SubCategory>('Solo');
  const [editMap, setEditMap] = useState('Bermuda');
  const [editEntryFee, setEditEntryFee] = useState<string>('30');
  const [editEntryType, setEditEntryType] = useState<'Paid' | 'Free'>('Paid');
  const [editTotalSlots, setEditTotalSlots] = useState<string>('48');
  const [editWinPrize, setEditWinPrize] = useState<string>('450');
  const [editPerKillPrize, setEditPerKillPrize] = useState<string>('15');
  const [editIncludeSecondPrize, setEditIncludeSecondPrize] = useState(true);
  const [editSecondPrize, setEditSecondPrize] = useState<string>('200');
  const [editIncludeThirdPrize, setEditIncludeThirdPrize] = useState(true);
  const [editThirdPrize, setEditThirdPrize] = useState<string>('100');
  const [editMatchMinutesFromNow, setEditMatchMinutesFromNow] = useState<string>('60');
  const [editStatus, setEditStatus] = useState<'upcoming' | 'open' | 'live' | 'completed' | 'cancelled'>('open');
  const [editRoomId, setEditRoomId] = useState('');
  const [editRoomPassword, setEditRoomPassword] = useState('');
  const [editCustomRules, setEditCustomRules] = useState('');

  // Room Credentials State
  const [editingRoomMatchId, setEditingRoomMatchId] = useState<string | null>(null);
  const [newRoomId, setNewRoomId] = useState('');
  const [newRoomPass, setNewRoomPass] = useState('');

  // 1-Click Payout scores state (mapped by user UID)
  const [playerScores, setPlayerScores] = useState<{ [uid: string]: { kills: string; winnings: string; rank: string } }>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const openEditModal = (match: Match) => {
    setSelectedMatchForEdit(match);
    setEditTitle(match.title);
    setEditCategory(match.category);
    setEditSubCategory(match.subCategory);
    setEditMap(match.map);
    setEditEntryFee(String(match.entryFee ?? 0));
    setEditEntryType(match.entryType);
    setEditTotalSlots(String(match.totalSlots ?? 48));
    setEditWinPrize(String(match.winPrize ?? 0));
    setEditPerKillPrize(String(match.perKillPrize ?? 0));
    setEditIncludeSecondPrize(Boolean(match.secondPrize && match.secondPrize > 0));
    setEditSecondPrize(String(match.secondPrize || 0));
    setEditIncludeThirdPrize(Boolean(match.thirdPrize && match.thirdPrize > 0));
    setEditThirdPrize(String(match.thirdPrize || 0));
    setEditStatus(match.status);
    setEditRoomId(match.roomId || '');
    setEditRoomPassword(match.roomPassword || '');
    setEditCustomRules(match.customRules || '');

    const diffMins = Math.max(1, Math.round((new Date(match.matchTime).getTime() - Date.now()) / 60000));
    setEditMatchMinutesFromNow(String(diffMins));
  };

  const handleSaveEditedMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForEdit) return;

    const mins = Math.max(1, toSafeNumber(editMatchMinutesFromNow, 60));
    const newMatchTime = new Date(Date.now() + mins * 60000).toISOString();

    dbStore.updateMatch(selectedMatchForEdit.id, {
      title: editTitle.trim(),
      category: editCategory,
      subCategory: editSubCategory,
      map: editMap,
      entryFee: editEntryType === 'Free' ? 0 : Math.max(1, toSafeNumber(editEntryFee, 1)),
      entryType: editEntryType,
      totalSlots: Math.min(100, Math.max(2, toSafeNumber(editTotalSlots, 48))),
      winPrize: toSafeNumber(editWinPrize, 0),
      perKillPrize: toSafeNumber(editPerKillPrize, 0),
      secondPrize: editIncludeSecondPrize ? toSafeNumber(editSecondPrize, 0) : 0,
      thirdPrize: editIncludeThirdPrize ? toSafeNumber(editThirdPrize, 0) : 0,
      matchTime: newMatchTime,
      status: editStatus,
      roomId: editRoomId.trim(),
      roomPassword: editRoomPassword.trim(),
      customRules: editCustomRules.trim()
    });

    setSelectedMatchForEdit(null);
    setFeedback(`Match "${editTitle}" updated successfully! Mobile users will see changes live.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();

    const mins = Math.max(1, toSafeNumber(matchMinutesFromNow, 180));
    const matchTime = new Date(Date.now() + mins * 60000).toISOString();
    const uniqueId = `match_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    const newMatch: Match = {
      id: uniqueId,
      title: title.trim() || `${category} ${map} Tournament`,
      category,
      subCategory,
      map,
      entryFee: entryType === 'Free' ? 0 : Math.max(1, toSafeNumber(entryFee, 1)),
      entryType,
      totalSlots: Math.min(100, Math.max(2, toSafeNumber(totalSlots, 48))),
      joinedPlayers: [],
      winPrize: toSafeNumber(winPrize, 0),
      perKillPrize: toSafeNumber(perKillPrize, 0),
      secondPrize: includeSecondPrize ? toSafeNumber(secondPrize, 0) : 0,
      thirdPrize: includeThirdPrize ? toSafeNumber(thirdPrize, 0) : 0,
      matchTime,
      status,
      customRules
    };

    dbStore.addMatch(newMatch);
    setShowCreateModal(false);
    setFeedback(`Match "${newMatch.title}" created & published as ${newMatch.status.toUpperCase()}!`);
    setTimeout(() => setFeedback(null), 3500);

    // Reset fields
    setTitle('');
    setStatus('open');
  };

  const handleCancelAndRefund = (match: Match) => {
    setCancellingMatch(match);
  };

  const handleConfirmCancelAndRefund = () => {
    if (!cancellingMatch) return;
    const targetMatch = cancellingMatch;
    const refunded = dbStore.cancelMatchWithAutoRefund(targetMatch.id);
    setCancellingMatch(null);
    if (refunded) {
      setFeedback(
        `Match "${targetMatch.title}" cancelled! Auto-refund (৳${targetMatch.entryFee} each) distributed to ${targetMatch.joinedPlayers.length} player(s).`
      );
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSaveRoomCredentials = (matchId: string) => {
    dbStore.updateMatch(matchId, {
      roomId: newRoomId.trim(),
      roomPassword: newRoomPass.trim()
    });
    setEditingRoomMatchId(null);
    setFeedback('Room ID and Password published! Joined players can now see credentials.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const openPayoutModal = (match: Match) => {
    setSelectedMatchForPayout(match);
    // Initialize default scores for joined players
    const initial: { [uid: string]: { kills: string; winnings: string; rank: string } } = {};
    match.joinedPlayers.forEach((p, idx) => {
      initial[p.uid] = {
        kills: '0',
        winnings: String(idx === 0 ? match.winPrize : idx === 1 ? (match.secondPrize || 0) : idx === 2 ? (match.thirdPrize || 0) : 0),
        rank: String(idx + 1)
      };
    });
    setPlayerScores(initial);
  };

  const handleExecutePayout = () => {
    if (!selectedMatchForPayout) return;

    const payouts = selectedMatchForPayout.joinedPlayers.map(p => {
      const score = playerScores[p.uid] || { kills: '0', winnings: '0', rank: '99' };
      return {
        uid: p.uid,
        ign: p.ign,
        kills: toSafeNumber(score.kills, 0),
        winnings: toSafeNumber(score.winnings, 0),
        rank: Math.max(1, toSafeNumber(score.rank, 1))
      };
    });

    dbStore.distributePrizeMoney({
      matchId: selectedMatchForPayout.id,
      payouts
    });

    setSelectedMatchForPayout(null);
    setFeedback('Prize money disbursed with 1-click! Leaderboard and Results updated (top 5 maintained).');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleBanUserFromMatch = (uid: string) => {
    const user = allUsers.find(u => u.uid === uid);
    if (!user) return;
    if (confirm(`Ban "${user.ign}" from playing in matches?`)) {
      dbStore.updateUser(uid, { isMatchBanned: true });
      setFeedback(`Player ${user.ign} has been match-banned.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-5 h-5 text-orange-500" />
            Tournament & Match Manager
          </h2>
          <p className="text-xs text-slate-400">
            Publish custom rooms, set room passwords, cancel with auto-refund, and execute 1-click prize payouts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tournament</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Match List Table / Cards */}
      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="p-8 text-center bg-[#0f1524] border border-slate-800 rounded-2xl">
            <Swords className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-300">
              No tournaments created yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Create New Tournament" above to publish a match.
            </p>
          </div>
        ) : (
        matches.map(match => {
          const joinedPlayers = Array.isArray(match.joinedPlayers) ? match.joinedPlayers : [];
          const joinedCount = joinedPlayers.length;
          const isCancelled = match.status === 'cancelled';
          const isCompleted = match.status === 'completed';

          return (
            <div
              key={match.id}
              className={`p-4 rounded-2xl border transition-all ${
                match.status === 'live'
                  ? 'bg-[#0f1524] border-red-500/40 hover:border-red-400/60'
                  : 'bg-[#0f1524] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {formatCategoryDisplay(match.category)} • {formatSubCategoryDisplay(match.category, match.subCategory)}
                    </span>
                    <span className="text-xs text-slate-400">Map: <strong className="text-white">{match.map}</strong></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      match.status === 'open'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : match.status === 'live'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : match.status === 'upcoming'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {match.status === 'live' ? '● LIVE' : match.status}
                    </span>
                    {match.entryType === 'Free' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">
                        Free Event Match
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-white font-display">
                    {match.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Entry: <strong className="text-amber-400">৳{match.entryFee}</strong></span>
                    <span>•</span>
                    <span>Bhooya Prize: <strong className="text-emerald-400">৳{match.winPrize}</strong></span>
                    {match.perKillPrize > 0 && (
                      <>
                        <span>•</span>
                        <span>Per Kill: <strong className="text-orange-400">৳{match.perKillPrize}</strong></span>
                      </>
                    )}
                    <span>•</span>
                    <span>Joined: <strong className="text-white">{joinedCount}/{match.totalSlots}</strong></span>
                    <span>•</span>
                    <span>Start: {new Date(match.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Action Buttons for Match */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                  {/* Edit Published/Live Match */}
                  <button
                    onClick={() => openEditModal(match)}
                    className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    title="Edit tournament kickoff time, map, prizes, or details"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Match</span>
                  </button>

                  {/* Set Room ID & Password */}
                  {!isCancelled && !isCompleted && (
                    <button
                      onClick={() => {
                        setEditingRoomMatchId(match.id);
                        setNewRoomId(match.roomId || '');
                        setNewRoomPass(match.roomPassword || '');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <Key className="w-3.5 h-3.5 text-orange-400" />
                      <span>{match.roomId ? 'Edit Room Pass' : 'Set Room Pass'}</span>
                    </button>
                  )}

                  {/* 1-Click Payout */}
                  {!isCancelled && !isCompleted && joinedCount > 0 && (
                    <button
                      onClick={() => openPayoutModal(match)}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>1-Click Payout</span>
                    </button>
                  )}

                  {/* Cancel with Auto-Refund */}
                  {!isCancelled && !isCompleted && (
                    <button
                      onClick={() => handleCancelAndRefund(match)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      title="Cancel match & auto-refund entry fee to joined players"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel & Auto-Refund</span>
                    </button>
                  )}

                </div>
              </div>

              {/* In-line Room Credentials Editor */}
              {editingRoomMatchId === match.id && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 bg-[#090d16] p-3 rounded-xl">
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Room ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 772918"
                      value={newRoomId}
                      onChange={e => setNewRoomId(e.target.value)}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Room Password</label>
                    <input
                      type="text"
                      placeholder="e.g. ff99"
                      value={newRoomPass}
                      onChange={e => setNewRoomPass(e.target.value)}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex items-end gap-1.5 pt-3">
                    <button
                      onClick={() => handleSaveRoomCredentials(match.id)}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Publish to Players
                    </button>
                    <button
                      onClick={() => setEditingRoomMatchId(null)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Joined Players List */}
              {joinedCount > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Joined Players ({joinedCount}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {joinedPlayers.map(p => (
                      <div
                        key={p.uid}
                        className="bg-[#090d16] border border-slate-800 rounded-lg px-2 py-1 text-[11px] flex items-center gap-1.5"
                      >
                        <span className="font-mono text-orange-400 font-bold">#{p.slotNumber}</span>
                        <span className="text-white font-medium">{p.ign}</span>
                        <button
                          onClick={() => handleBanUserFromMatch(p.uid)}
                          className="text-slate-500 hover:text-red-400 cursor-pointer ml-1"
                          title="Ban from match"
                        >
                          <ShieldBan className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
        )}
      </div>

      {/* CREATE TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white font-display">
                Create & Publish New Tournament
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tournament Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bermuda Grand Solo Championship"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-body"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Game Category
                  </label>
                  <select
                    value={category}
                    onChange={e => {
                      const cat = e.target.value as GameCategory;
                      setCategory(cat);
                      const allowed = getAllowedSubCategories(cat);
                      const nextSub = allowed.includes(subCategory) ? subCategory : allowed[0];
                      setSubCategory(nextSub);
                      if (cat === 'BR') setTotalSlots('48');
                      else if (cat === 'CS' || cat === 'CSHeadshot') {
                        setTotalSlots(nextSub === 'Squad' ? '8' : nextSub === 'Duo' ? '4' : '2');
                      } else {
                        setTotalSlots(nextSub === 'Duo' ? '4' : '2');
                      }
                    }}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="BR">Battle Royale (BR)</option>
                    <option value="CS">Clash Squad (CS)</option>
                    <option value="CSHeadshot">Clash Squad Headshot (CS Headshot Only)</option>
                    <option value="LoneWolf">Lone Wolf (1v1 / 2v2)</option>
                    <option value="HeadshotLoneWolf">Lone Wolf Headshot (1v1 / 2v2)</option>
                    <option value="LossToWin">Lone Wolf Loss to Win (1v1 / 2v2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Sub-Category
                  </label>
                  <select
                    value={subCategory}
                    onChange={e => {
                      const nextSub = e.target.value as SubCategory;
                      setSubCategory(nextSub);
                      if (category !== 'BR') {
                        setTotalSlots(nextSub === 'Squad' ? '8' : nextSub === 'Duo' ? '4' : '2');
                      }
                    }}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {getAllowedSubCategories(category).map(sub => (
                      <option key={sub} value={sub}>
                        {formatSubCategoryDisplay(category, sub)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Map
                  </label>
                  <select
                    value={map}
                    onChange={e => setMap(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                    <option value="Iron Cage">Iron Cage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Total Slots
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="48"
                    value={totalSlots}
                    onChange={e => setTotalSlots(sanitizeUnsignedIntInput(e.target.value))}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Entry Type & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Entry Type
                  </label>
                  <select
                    value={entryType}
                    onChange={e => setEntryType(e.target.value as 'Paid' | 'Free')}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Paid">Paid Tournament</option>
                    <option value="Free">Special Free Event</option>
                  </select>
                </div>

                {entryType === 'Paid' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Entry Fee (TK)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="30"
                      value={entryFee}
                      onChange={e => setEntryFee(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Prize Pool Config (Section 2, Req 5) */}
              <div className="p-3 bg-[#0a0e18] border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-400 block">
                  Dynamic Prize Pool Setup
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Bhooya Prize (TK)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="450"
                      value={winPrize}
                      onChange={e => setWinPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Per Kill Prize (TK)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="15"
                      value={perKillPrize}
                      onChange={e => setPerKillPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Toggleable 2nd & 3rd Prize */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSecondPrize}
                      onChange={e => setIncludeSecondPrize(e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    <span>Include 2nd Place Prize</span>
                  </label>
                  {includeSecondPrize && (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={secondPrize}
                      onChange={e => setSecondPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-24 bg-[#141a29] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      placeholder="৳ Amount"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeThirdPrize}
                      onChange={e => setIncludeThirdPrize(e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    <span>Include 3rd Place Prize</span>
                  </label>
                  {includeThirdPrize && (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={thirdPrize}
                      onChange={e => setThirdPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-24 bg-[#141a29] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      placeholder="৳ Amount"
                    />
                  )}
                </div>
              </div>

              {/* Match Start Time Offset - Flexible Custom Manual Input */}
              <div className="p-3 bg-[#0a0e18] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Custom Match Timing (Minutes from now)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-orange-400">
                    Kickoff: {new Date(Date.now() + Math.max(1, toSafeNumber(matchMinutesFromNow, 1)) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(Date.now() + Math.max(1, toSafeNumber(matchMinutesFromNow, 1)) * 60000).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 180, 574, 647"
                      value={matchMinutesFromNow}
                      onChange={e => setMatchMinutesFromNow(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500 pr-12"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
                      mins
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 self-center mr-1">Quick presets:</span>
                  {[30, 60, 180, 360, 574, 647, 1440].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setMatchMinutesFromNow(String(mins))}
                      className={`px-2 py-0.5 text-[10px] rounded-md border font-mono transition-colors ${
                        matchMinutesFromNow !== '' && toSafeNumber(matchMinutesFromNow, -1) === mins
                          ? 'bg-orange-500 text-white border-orange-400 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {mins >= 60 ? `${(mins / 60).toFixed(mins % 60 === 0 ? 0 : 1)}h (${mins}m)` : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Tournament Status */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tournament Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as 'open' | 'upcoming' | 'live')}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="open">Open (Registration Active)</option>
                  <option value="upcoming">Upcoming (Preview & Pre-Booking)</option>
                  <option value="live">Live (In Progress)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/30 cursor-pointer pt-2"
              >
                Publish Tournament to Mobile App
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PUBLISHED / LIVE TOURNAMENT MODAL */}
      {selectedMatchForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1524] border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-black text-white font-display">
                  Edit Published Tournament
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatchForEdit(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedMatch} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tournament Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-body"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Game Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={e => {
                      const cat = e.target.value as GameCategory;
                      setEditCategory(cat);
                      const allowed = getAllowedSubCategories(cat);
                      if (!allowed.includes(editSubCategory)) {
                        setEditSubCategory(allowed[0]);
                      }
                    }}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BR">Battle Royale (BR)</option>
                    <option value="CS">Clash Squad (CS)</option>
                    <option value="CSHeadshot">Clash Squad Headshot (CS Headshot Only)</option>
                    <option value="LoneWolf">Lone Wolf (1v1 / 2v2)</option>
                    <option value="HeadshotLoneWolf">Lone Wolf Headshot (1v1 / 2v2)</option>
                    <option value="LossToWin">Lone Wolf Loss to Win (1v1 / 2v2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Sub-Category
                  </label>
                  <select
                    value={editSubCategory}
                    onChange={e => setEditSubCategory(e.target.value as SubCategory)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {getAllowedSubCategories(editCategory).map(sub => (
                      <option key={sub} value={sub}>
                        {formatSubCategoryDisplay(editCategory, sub)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Map
                  </label>
                  <select
                    value={editMap}
                    onChange={e => setEditMap(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                    <option value="Iron Cage">Iron Cage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Total Slots
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="48"
                    value={editTotalSlots}
                    onChange={e => setEditTotalSlots(sanitizeUnsignedIntInput(e.target.value))}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Entry Type & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Entry Type
                  </label>
                  <select
                    value={editEntryType}
                    onChange={e => setEditEntryType(e.target.value as 'Paid' | 'Free')}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Paid">Paid Tournament</option>
                    <option value="Free">Special Free Event</option>
                  </select>
                </div>

                {editEntryType === 'Paid' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Entry Fee (TK)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="30"
                      value={editEntryFee}
                      onChange={e => setEditEntryFee(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Prize Pool Config with Bhooya Prize */}
              <div className="p-3 bg-[#0a0e18] border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-cyan-400 block">
                  Dynamic Prize Pool Setup
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Bhooya Prize (TK)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="450"
                      value={editWinPrize}
                      onChange={e => setEditWinPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Per Kill Prize (TK)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="15"
                      value={editPerKillPrize}
                      onChange={e => setEditPerKillPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* 2nd & 3rd Prize */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIncludeSecondPrize}
                      onChange={e => setEditIncludeSecondPrize(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Include 2nd Place Prize</span>
                  </label>
                  {editIncludeSecondPrize && (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={editSecondPrize}
                      onChange={e => setEditSecondPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-24 bg-[#141a29] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      placeholder="৳ Amount"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIncludeThirdPrize}
                      onChange={e => setEditIncludeThirdPrize(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Include 3rd Place Prize</span>
                  </label>
                  {editIncludeThirdPrize && (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={editThirdPrize}
                      onChange={e => setEditThirdPrize(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-24 bg-[#141a29] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      placeholder="৳ Amount"
                    />
                  )}
                </div>
              </div>

              {/* Match Timing - Custom Manual Input */}
              <div className="p-3 bg-[#0a0e18] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Modify Kickoff Timing (Minutes from now)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-cyan-400">
                    Kickoff: {new Date(Date.now() + Math.max(1, toSafeNumber(editMatchMinutesFromNow, 1)) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(Date.now() + Math.max(1, toSafeNumber(editMatchMinutesFromNow, 1)) * 60000).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 180, 574, 647"
                      value={editMatchMinutesFromNow}
                      onChange={e => setEditMatchMinutesFromNow(sanitizeUnsignedIntInput(e.target.value))}
                      className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 pr-12"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
                      mins
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 self-center mr-1">Quick presets:</span>
                  {[30, 60, 180, 360, 574, 647, 1440].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEditMatchMinutesFromNow(String(mins))}
                      className={`px-2 py-0.5 text-[10px] rounded-md border font-mono transition-colors ${
                        editMatchMinutesFromNow !== '' && toSafeNumber(editMatchMinutesFromNow, -1) === mins
                          ? 'bg-cyan-500 text-white border-cyan-400 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {mins >= 60 ? `${(mins / 60).toFixed(mins % 60 === 0 ? 0 : 1)}h (${mins}m)` : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Status & Room Credentials */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as 'upcoming' | 'open' | 'live' | 'completed' | 'cancelled')}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="open">Open (Registration Active)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live (In Progress)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Room ID</label>
                  <input
                    type="text"
                    value={editRoomId}
                    onChange={e => setEditRoomId(e.target.value)}
                    placeholder="e.g. 849201"
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Room Password</label>
                  <input
                    type="text"
                    value={editRoomPassword}
                    onChange={e => setEditRoomPassword(e.target.value)}
                    placeholder="e.g. ff99"
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Custom Rules */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Special Match Rules / Notes</label>
                <textarea
                  rows={2}
                  value={editCustomRules}
                  onChange={e => setEditCustomRules(e.target.value)}
                  placeholder="e.g. No grenade launcher, emulator not allowed..."
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatchForEdit(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-600/30 cursor-pointer"
                >
                  Save Changes & Update Match Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-CLICK PAYOUT MODAL */}
      {selectedMatchForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0f1524] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white font-display">
                  1-Click Prize Payout & Result Publisher
                </h3>
                <p className="text-xs text-emerald-400">
                  {selectedMatchForPayout.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedMatchForPayout(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                ⚡ Review kills & prize money for each joined player. Clicking "Execute 1-Click Payout" will instantly credit winnings to their accounts, update the 24-Hour Leaderboard, and push the results to the Results page!
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedMatchForPayout.joinedPlayers.map(p => {
                  const score = playerScores[p.uid] || { kills: '0', winnings: '0', rank: '1' };

                  return (
                    <div
                      key={p.uid}
                      className="bg-[#090d16] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-orange-400 font-mono">#{p.slotNumber}</span>
                          <span className="truncate">{p.ign}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">UID: {p.freeFireUid}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 block uppercase">Rank</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={score.rank}
                            onChange={e => {
                              const rank = sanitizeUnsignedIntInput(e.target.value);
                              setPlayerScores(prev => ({
                                ...prev,
                                [p.uid]: { ...(prev[p.uid] || { kills: '0', winnings: '0', rank: '1' }), rank }
                              }));
                            }}
                            className="w-12 bg-[#141a29] border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 block uppercase">Kills</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={score.kills}
                            onChange={e => {
                              const kills = sanitizeUnsignedIntInput(e.target.value);
                              setPlayerScores(prev => ({
                                ...prev,
                                [p.uid]: { ...(prev[p.uid] || { kills: '0', winnings: '0', rank: '1' }), kills }
                              }));
                            }}
                            className="w-12 bg-[#141a29] border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 block uppercase">Win ৳</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={score.winnings}
                            onChange={e => {
                              const winnings = sanitizeUnsignedIntInput(e.target.value);
                              setPlayerScores(prev => ({
                                ...prev,
                                [p.uid]: { ...(prev[p.uid] || { kills: '0', winnings: '0', rank: '1' }), winnings }
                              }));
                            }}
                            className="w-20 bg-[#141a29] border border-slate-700 rounded px-2 py-1 text-right font-mono text-emerald-400 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleExecutePayout}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black rounded-xl text-xs shadow-xl shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2 mt-4 uppercase tracking-wider"
              >
                <Award className="w-4 h-4" />
                <span>Execute 1-Click Prize Payout & Close Match</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL & AUTO-REFUND CONFIRMATION POPUP */}
      {cancellingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1524] border-2 border-red-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-display uppercase tracking-wide">
                    Cancel & Auto-Refund
                  </h3>
                  <p className="text-[11px] text-red-300">
                    Confirm match cancellation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingMatch(null)}
                className="text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded-lg hover:bg-slate-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Are you sure you want to cancel this match and refund all joined players?
            </p>

            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-3 space-y-1 text-xs">
              <div className="font-bold text-white">{cancellingMatch.title}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {cancellingMatch.category} • {cancellingMatch.subCategory} • Map: {cancellingMatch.map}
              </div>
              <div className="text-[11px] text-amber-300 font-mono pt-0.5">
                Refund Amount: ৳{cancellingMatch.entryFee} × {cancellingMatch.joinedPlayers.length} player(s) = ৳{cancellingMatch.entryFee * cancellingMatch.joinedPlayers.length}
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCancellingMatch(null)}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 cursor-pointer transition-all"
              >
                Not Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelAndRefund}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs shadow-lg shadow-red-600/30 cursor-pointer transition-all"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
