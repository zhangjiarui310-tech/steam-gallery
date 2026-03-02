'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SteamInputProps {
  onSearch: (steamId: string) => void;
  isLoading: boolean;
}

export default function SteamInput({ onSearch, isLoading }: SteamInputProps) {
  const [steamId, setSteamId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (steamId.trim()) {
      onSearch(steamId.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Steam 3D Showcase
        </h1>
        <p className="text-zinc-400">
          Enter your SteamID64 to generate your personal 3D game gallery.
          Make sure your game details are set to public.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="e.g. 76561197960434622"
            className="w-full pl-12 pr-32 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !steamId.trim()}
            className="absolute right-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl text-sm text-zinc-500">
        <p>Don&apos;t know your SteamID64? You can find it using sites like steamid.io</p>
        <p className="mt-2 text-xs text-zinc-600">Note: You need to set STEAM_API_KEY in the AI Studio Secrets panel for this to work.</p>
      </div>
    </motion.div>
  );
}
