import React, { useState, useEffect, useRef } from 'react';
import { Code2, Save, CheckCircle2, Phone, MessageCircle, Globe, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';
import { DeveloperProfile } from '../types';

const DEFAULT_DEV_PROFILE: DeveloperProfile = {
  name: 'Storm FF Dev Studio',
  roleTitle: 'Full-Stack Web & Esports App Developer',
  bio: 'Want to build a tournament app like Storm FF Club with automated bKash/Nagad payouts, Firebase real-time sync, and an Admin Panel? Contact me directly!',
  phone: '+8801892348190',
  whatsappUrl: 'https://wa.me/8801892348190',
  facebookUrl: 'https://facebook.com',
  portfolioUrl: ''
};

function resolveProfileState(raw?: Partial<DeveloperProfile>): DeveloperProfile {
  if (!raw) return { ...DEFAULT_DEV_PROFILE };
  return {
    name: raw.name ?? DEFAULT_DEV_PROFILE.name,
    roleTitle: raw.roleTitle ?? '',
    bio: raw.bio ?? DEFAULT_DEV_PROFILE.bio,
    phone: raw.phone ?? '',
    whatsappUrl: raw.whatsappUrl ?? '',
    facebookUrl: raw.facebookUrl ?? '',
    portfolioUrl: raw.portfolioUrl ?? ''
  };
}

export const DeveloperSettings: React.FC = () => {
  const { settings } = useApp();
  const initial = resolveProfileState(settings.developerProfile);

  const [name, setName] = useState(initial.name);
  const [roleTitle, setRoleTitle] = useState(initial.roleTitle || '');
  const [bio, setBio] = useState(initial.bio);
  const [phone, setPhone] = useState(initial.phone);
  const [whatsappUrl, setWhatsappUrl] = useState(initial.whatsappUrl);
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initial.portfolioUrl || '');
  const [feedback, setFeedback] = useState<string | null>(null);

  const isDirtyRef = useRef(false);
  const lastSyncedJsonRef = useRef(JSON.stringify(initial));

  useEffect(() => {
    const resolved = resolveProfileState(settings.developerProfile);
    const nextJson = JSON.stringify(resolved);
    if (!isDirtyRef.current && nextJson !== lastSyncedJsonRef.current) {
      lastSyncedJsonRef.current = nextJson;
      setName(resolved.name);
      setRoleTitle(resolved.roleTitle || '');
      setBio(resolved.bio);
      setPhone(resolved.phone);
      setWhatsappUrl(resolved.whatsappUrl);
      setFacebookUrl(resolved.facebookUrl || '');
      setPortfolioUrl(resolved.portfolioUrl || '');
    }
  }, [settings.developerProfile]);

  const normalizeExternalLink = (raw: string, type: 'whatsapp' | 'url') => {
    const val = raw.trim();
    if (!val) return '';
    if (type === 'whatsapp' && !/^https?:\/\//i.test(val)) {
      const digits = val.replace(/[^0-9]/g, '');
      return digits ? `https://wa.me/${digits}` : '';
    }
    if (!/^https?:\/\//i.test(val)) {
      return `https://${val}`;
    }
    return val;
  };

  const markDirty = (setter: React.Dispatch<React.SetStateAction<string>>) => (val: string) => {
    isDirtyRef.current = true;
    setter(val);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: DeveloperProfile = {
      name: name.trim() || DEFAULT_DEV_PROFILE.name,
      roleTitle: roleTitle.trim(),
      bio: bio.trim() || DEFAULT_DEV_PROFILE.bio,
      phone: phone.trim(),
      whatsappUrl: normalizeExternalLink(whatsappUrl, 'whatsapp'),
      facebookUrl: normalizeExternalLink(facebookUrl, 'url'),
      portfolioUrl: normalizeExternalLink(portfolioUrl, 'url')
    };

    lastSyncedJsonRef.current = JSON.stringify(updatedProfile);
    isDirtyRef.current = false;

    setName(updatedProfile.name);
    setRoleTitle(updatedProfile.roleTitle || '');
    setBio(updatedProfile.bio);
    setPhone(updatedProfile.phone);
    setWhatsappUrl(updatedProfile.whatsappUrl);
    setFacebookUrl(updatedProfile.facebookUrl || '');
    setPortfolioUrl(updatedProfile.portfolioUrl || '');

    dbStore.updateSettings({
      developerProfile: updatedProfile
    });

    setFeedback('Developer contact details saved to Firestore & synced instantly with the User Profile screen!');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          Hire Developer Contact Settings
        </h2>
        <p className="text-xs text-slate-400">
          Update the developer name, bio, phone number, and social links shown when players tap "Hire this web developer" in their Profile.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Developer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rofikul Islam / Storm Dev"
              value={name}
              onChange={(e) => markDirty(setName)(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Role / Specialty Title
            </label>
            <input
              type="text"
              placeholder="e.g. Full-Stack Esports App Developer"
              value={roleTitle}
              onChange={(e) => markDirty(setRoleTitle)(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Custom Bio / Pitch Description
          </label>
          <textarea
            rows={3}
            placeholder="Want to build a tournament app like this? Contact me..."
            value={bio}
            onChange={(e) => markDirty(setBio)(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="text"
              placeholder="+8801XXXXXXXXX"
              value={phone}
              onChange={(e) => markDirty(setPhone)(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Link or Number</span>
            </label>
            <input
              type="text"
              placeholder="https://wa.me/8801XXXXXXXXX or number"
              value={whatsappUrl}
              onChange={(e) => markDirty(setWhatsappUrl)(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Facebook Profile / Page URL</span>
            </label>
            <input
              type="text"
              placeholder="https://facebook.com/yourprofile"
              value={facebookUrl}
              onChange={(e) => markDirty(setFacebookUrl)(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span>Portfolio / Website URL (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="https://yourportfolio.com"
              value={portfolioUrl}
              onChange={(e) => markDirty(setPortfolioUrl)(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Developer Info & Sync Live</span>
        </button>
      </form>
    </div>
  );
};
