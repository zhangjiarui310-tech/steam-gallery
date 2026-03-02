'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Clock, Trophy } from 'lucide-react';

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

interface FlatShowcaseProps {
  games: Game[];
}

export default function FlatShowcase({ games }: FlatShowcaseProps) {
  if (!games || games.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        No games found. Make sure your game details are set to public.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.slice(0, 50).map((game, i) => (
          <motion.div
            key={game.appid}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            <div className="aspect-[460/215] relative w-full overflow-hidden bg-zinc-800">
              <Image
                src={`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`}
                alt={game.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                unoptimized={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            </div>
            
            <div className="p-5 relative">
              <h3 className="text-lg font-semibold text-white truncate mb-3" title={game.name}>
                {game.name}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{(game.playtime_forever / 60).toFixed(1)} hrs</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Trophy className="w-4 h-4" />
                  <span>--%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
