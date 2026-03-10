'use client';

import { useState } from 'react';
import SteamInput from '@/components/SteamInput';
import ProfileHeader from '@/components/ProfileHeader';
import FlatShowcase from '@/components/FlatShowcase';
import Gallery3D from '@/components/Gallery3D';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { motion, AnimatePresence } from 'motion/react';
import { getPreferredLocale } from '../lib/i18n';

export default function Home() {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'flat' | '3d'>('flat');

  const handleSearch = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const locale = getPreferredLocale();
      const [profileRes, gamesRes] = await Promise.all([
        fetch(`/api/steam/profile?steamId=${id}&language=${locale}`),
        fetch(`/api/steam/games?steamId=${id}&language=${locale}`)
      ]);

      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.error || 'Failed to fetch profile');
      }

      if (!gamesRes.ok) {
        const data = await gamesRes.json();
        throw new Error(data.error || 'Failed to fetch games');
      }

      const profileData = await profileRes.json();
      const gamesData = await gamesRes.json();

      setProfile(profileData);
      setGames(gamesData);
      setSteamId(id);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setSteamId(null);
    setProfile(null);
    setGames([]);
    setViewMode('flat');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <AnimatePresence mode="wait">
        {!steamId ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <SteamInput onSearch={handleSearch} isLoading={isLoading} />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            <ProfileHeader
              profile={profile}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onLogout={handleLogout}
            />
            
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {viewMode === 'flat' ? (
                  <motion.div
                    key="flat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FlatShowcase games={games} steamId={steamId!} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="3d"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Gallery3D games={games} profile={profile} steamId={steamId!} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
