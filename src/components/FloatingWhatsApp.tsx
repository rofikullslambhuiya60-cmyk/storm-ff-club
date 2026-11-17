import React from 'react';
import { MessageSquare, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, currentUser } = useApp();

  const handleOpenWhatsApp = () => {
    const rawNumber = settings.whatsAppNumber.replace(/[^0-9]/g, '');
    const userText = encodeURIComponent(
      `Hello Storm FF Club Admin! I need support.\nUser IGN: ${currentUser?.ign || 'Guest'}\nFF UID: ${currentUser?.freeFireUid || 'N/A'}\nEmail: ${currentUser?.email || 'N/A'}`
    );
    window.open(`https://wa.me/${rawNumber}?text=${userText}`, '_blank');
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 group">
      <button
        onClick={handleOpenWhatsApp}
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/40"
        title="Chat with Admin on WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">WhatsApp Help</span>
      </button>
    </div>
  );
};
