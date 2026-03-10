'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { LogOut, Grid, Box } from 'lucide-react';
import { getPreferredLocale } from '../lib/i18n';

interface ProfileHeaderProps {
  profile: any;
  viewMode: 'flat' | '3d';
  setViewMode: (mode: 'flat' | '3d') => void;
  onLogout: () => void;
}

export default function ProfileHeader({ profile, viewMode, setViewMode, onLogout }: ProfileHeaderProps) {
  if (!profile) return null;

  const [dictionary, setDictionary] = useState<any>({
    common: {
      online: 'Online',
      offline: 'Offline',
      changeId: 'Change ID'
    },
    games: {
      title: 'Games',
      recentGames: 'Recent Games'
    }
  });

  useEffect(() => {
    const loadDictionary = async () => {
      const locale = getPreferredLocale();
      const dict = await import(`../app/locales/${locale}.json`);
      setDictionary(dict.default);
    };
    loadDictionary();
  }, []);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-zinc-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
          <Image
            src={profile.avatarfull || 'https://picsum.photos/seed/steam/128/128'}
            alt={profile.personaname}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{profile.personaname}</h2>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
            <span className={`w-2 h-2 rounded-full ${profile.personastate === 1 ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
            {profile.personastate === 1 ? dictionary.common.online : dictionary.common.offline}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setViewMode('flat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'flat' 
              ? 'bg-white/10 text-white shadow-sm' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Grid className="w-4 h-4" />
          {dictionary.common.flatShowcase}
        </button>
        <button
          onClick={() => setViewMode('3d')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === '3d' 
              ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Box className="w-4 h-4" />
          {dictionary.common.gallery3d}
        </button>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {dictionary.common.changeId}
      </button>
    </motion.header>
  );
}
