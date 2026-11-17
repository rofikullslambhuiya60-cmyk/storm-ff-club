import React, { useState } from 'react';
import { 
  Gift, CheckCircle2, Clock, Copy, Check, Search, 
  ExternalLink, Sparkles, Filter, AlertCircle, Send, MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MysteryBoxOrder } from '../types';

export const MysteryBoxManager: React.FC = () => {
  const { mysteryBoxOrders, fulfillMysteryBoxOrder } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'fulfilled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal for fulfilling with custom or preset gift note
  const [selectedOrderForDone, setSelectedOrderForDone] = useState<MysteryBoxOrder | null>(null);
  const [giftNote, setGiftNote] = useState('50 Diamonds delivered to UID');

  const pendingCount = mysteryBoxOrders.filter(o => o.status === 'pending').length;
  const fulfilledCount = mysteryBoxOrders.filter(o => o.status === 'fulfilled').length;

  const filteredOrders = mysteryBoxOrders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchIgn = order.userIgn.toLowerCase().includes(q);
      const matchUid = order.freeFireUid.toLowerCase().includes(q);
      const matchPhone = (order.phone || '').toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      if (!matchIgn && !matchUid && !matchPhone && !matchId) return false;
    }
    return true;
  });

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleConfirmDone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDone) return;

    const res = fulfillMysteryBoxOrder(selectedOrderForDone.id, giftNote.trim());
    if (res.success) {
      setFeedback(`✅ Done! User "${selectedOrderForDone.userIgn}" has been notified: "আপনার অ্যাকাউন্টে মিস্ট্রি বক্সের গিফট সেন্ড করা হয়েছে"`);
      setSelectedOrderForDone(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleQuickDone = (order: MysteryBoxOrder) => {
    const res = fulfillMysteryBoxOrder(order.id, 'Diamonds/Membership sent to UID');
    if (res.success) {
      setFeedback(`✅ Done! User "${order.userIgn}" has been notified: "আপনার অ্যাকাউন্টে মিস্ট্রি বক্সের গিফট সেন্ড করা হয়েছে"`);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Gift className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-white font-display uppercase tracking-wider">
              Mystery Box Orders & Gift Fulfillment
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            When users redeem Storm Points for Mystery Boxes, fulfill their gift (Diamonds, Weekly, or Monthly) manually outside the app using their Free Fire UID. Click <span className="text-amber-400 font-bold">"Done"</span> to mark as fulfilled and trigger an automated push notification to the user.
          </p>
        </div>

        {/* Pending Badge */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{pendingCount} Pending Gift{pendingCount > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Orders Fulfilled</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation feedback alert */}
      {feedback && (
        <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-[#0d1c1a] to-emerald-950/60 border-2 border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{feedback}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Total Orders
          </div>
          <div className="text-xl font-black text-white font-display mt-0.5">
            {mysteryBoxOrders.length}
          </div>
        </div>

        <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl p-3.5 bg-gradient-to-br from-[#0f1422] to-amber-950/20">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Fulfillment
          </div>
          <div className="text-xl font-black text-amber-300 font-display mt-0.5">
            {pendingCount}
          </div>
        </div>

        <div className="bg-[#0f1422] border border-emerald-500/30 rounded-2xl p-3.5 bg-gradient-to-br from-[#0f1422] to-emerald-950/20">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
            Fulfilled / Sent
          </div>
          <div className="text-xl font-black text-emerald-300 font-display mt-0.5">
            {fulfilledCount}
          </div>
        </div>

        <div className="bg-[#0f1422] border border-purple-500/30 rounded-2xl p-3.5 bg-gradient-to-br from-[#0f1422] to-purple-950/20">
          <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider font-mono">
            Points Redeemed
          </div>
          <div className="text-xl font-black text-purple-300 font-display mt-0.5">
            {mysteryBoxOrders.reduce((sum, o) => sum + (o.pointsSpent || 50), 0)} Pts
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 bg-[#0f1422] p-1 rounded-xl border border-slate-800">
          {(['all', 'pending', 'fulfilled'] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setFilter(tabKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === tabKey
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tabKey} {tabKey === 'pending' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by IGN, Free Fire UID, or Phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1422] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a0e18] border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
              <tr>
                <th className="p-3.5">Order ID & Date</th>
                <th className="p-3.5">Player & Free Fire UID</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">Redeemed Item</th>
                <th className="p-3.5">Status & Notes</th>
                <th className="p-3.5 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Gift className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-400">No Mystery Box orders found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {filter === 'pending' ? 'All mystery box gifts have been fulfilled!' : 'Orders redeemed in Point Store will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Order ID & Time */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-white text-[11px]">
                        {order.id}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(order.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Player IGN & Free Fire UID */}
                    <td className="p-3.5">
                      <div className="font-bold text-white text-xs">
                        {order.userIgn}
                      </div>
                      {/* One-click copy UID button */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                          UID: {order.freeFireUid}
                        </span>
                        <button
                          onClick={() => handleCopyUid(order.freeFireUid)}
                          className={`p-1 rounded cursor-pointer transition-all ${
                            copiedUid === order.freeFireUid
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title="Copy Free Fire UID to clipboard"
                        >
                          {copiedUid === order.freeFireUid ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Contact Phone */}
                    <td className="p-3.5 font-mono text-slate-300">
                      {order.phone ? (
                        <div className="flex items-center gap-1.5">
                          <span>{order.phone}</span>
                          <a
                            href={`https://wa.me/88${order.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 text-[10px] p-0.5"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Not set</span>
                      )}
                    </td>

                    {/* Redeemed Item */}
                    <td className="p-3.5">
                      <div className="font-bold text-purple-300 text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{order.itemTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Cost: {order.pointsSpent} Points
                      </span>
                    </td>

                    {/* Status & Gift Note */}
                    <td className="p-3.5">
                      {order.status === 'pending' ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Pending Delivery
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Awaiting manual gift topup
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Fulfilled
                          </span>
                          {order.giftNote && (
                            <p className="text-[10px] text-slate-300 mt-1 italic">
                              "{order.giftNote}"
                            </p>
                          )}
                          {order.fulfilledAt && (
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {new Date(order.fulfilledAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="p-3.5 text-right">
                      {order.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForDone(order)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-emerald-600/30 flex items-center gap-1.5 uppercase tracking-wider transition-transform active:scale-95"
                            title="Mark as done and send automated push notification to player"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500 flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Notified</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Done Confirmation Modal */}
      {selectedOrderForDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0f1524] border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
                  Fulfill Mystery Box Gift
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Player: <span className="text-white font-bold">{selectedOrderForDone.userIgn}</span>
                </p>
              </div>
            </div>

            {/* Target details */}
            <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Free Fire UID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {selectedOrderForDone.freeFireUid}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyUid(selectedOrderForDone.freeFireUid)}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    title="Copy UID"
                  >
                    {copiedUid === selectedOrderForDone.freeFireUid ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {selectedOrderForDone.phone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Contact:</span>
                  <span className="font-mono text-slate-200">{selectedOrderForDone.phone}</span>
                </div>
              )}
            </div>

            {/* Notification alert preview */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                <Send className="w-3 h-3" /> Push Notification to User (Exact Requirement)
              </span>
              <p className="text-xs font-bold text-white bg-[#090d16] p-2 rounded-lg border border-slate-800">
                "আপনার অ্যাকাউন্টে মিস্ট্রি বক্সের গিফট সেন্ড করা হয়েছে"
              </p>
            </div>

            <form onSubmit={handleConfirmDone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Gift Description / Admin Note (Optional):
                </label>
                <input
                  type="text"
                  value={giftNote}
                  onChange={e => setGiftNote(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 50 Diamonds sent via UID"
                />
              </div>

              {/* Quick preset gift buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  '25 Diamonds sent to UID',
                  '50 Diamonds sent to UID',
                  '100 Diamonds sent to UID',
                  'Weekly Membership sent to UID',
                  'Monthly Membership sent to UID'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGiftNote(preset)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Done & Send Push Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDone(null)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
