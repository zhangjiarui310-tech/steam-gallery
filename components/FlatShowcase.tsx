'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Trophy, X, Loader2 } from 'lucide-react';
import { getPreferredLocale } from '../lib/i18n';

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

interface Achievement {
  apiname: string;
  achieved: number;
  name: string;
  description: string;
  icon?: string;
  icon_gray?: string;
}

interface FlatShowcaseProps {
  games: Game[];
  steamId: string;
}

function GameCard({ game, index, onGameClick }: { game: Game; index: number; onGameClick: (game: Game) => void }) {
  const [imgSrc, setImgSrc] = useState(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`);
  const [dictionary, setDictionary] = useState<any>({
    common: {
      viewAchievements: 'View Achievements'
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
      onClick={() => onGameClick(game)}
    >
      <div className="aspect-[460/215] relative w-full overflow-hidden bg-zinc-800">
        <Image
          src={imgSrc}
          alt={game.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          unoptimized={false}
          onError={() => {
            setImgSrc(`https://picsum.photos/seed/${game.appid}/460/215`);
          }}
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
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>{dictionary.common.viewAchievements}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AchievementModal({ game, steamId, onClose }: { game: Game; steamId: string; onClose: () => void }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictionary, setDictionary] = useState<any>({
    achievements: {
      title: 'Achievements',
      unlocked: 'Unlocked',
      locked: 'Locked',
      progress: 'Progress'
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      noGames: 'No achievements found for this game.'
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

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const locale = getPreferredLocale();
        const response = await fetch(`/api/steam/achievements?steamId=${steamId}&appId=${game.appid}&language=${locale}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievements');
        }
        const data = await response.json();
        console.log('Achievements data:', data);
        setAchievements(data.achievements || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching achievements:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [game.appid, steamId]);

  const unlockedAchievements = achievements.filter(a => a.achieved === 1);
  const lockedAchievements = achievements.filter(a => a.achieved === 0);
  
  // Debug: Check if achievements have icons
  if (achievements.length > 0) {
    console.log('First achievement:', achievements[0]);
    console.log('Has icon:', 'icon' in achievements[0]);
    console.log('Has icon_gray:', 'icon_gray' in achievements[0]);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{game.name} - {dictionary.achievements.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-6 h-6 text-zinc-400 hover:text-white" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              {error}
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              {dictionary.common.noGames}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {dictionary.achievements.unlocked} ({unlockedAchievements.length}/{achievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.apiname}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-zinc-800 rounded-lg p-4 border border-green-500/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-green-500/20 rounded">
                          {achievement.icon ? (
                            <Image
                              src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${achievement.icon}.jpg`}
                              alt={achievement.name}
                              width={48}
                              height={48}
                              className="rounded"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Trophy className="w-6 h-6 text-green-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">{achievement.name}</h4>
                          <p className="text-zinc-400 text-sm">{achievement.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {dictionary.achievements.locked} ({lockedAchievements.length}/{achievements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.apiname}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-zinc-700/20 rounded">
                          {achievement.icon_gray ? (
                            <Image
                              src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${achievement.icon_gray}.jpg`}
                              alt={achievement.name}
                              width={48}
                              height={48}
                              className="rounded opacity-50"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Trophy className="w-6 h-6 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-500 mb-2">{achievement.name}</h4>
                          <p className="text-zinc-600 text-sm">{achievement.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FlatShowcase({ games, steamId }: FlatShowcaseProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [dictionary, setDictionary] = useState<any>({
    common: {
      noGamesFound: 'No games found. Make sure your game details are set to public.'
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

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        {dictionary.common.noGamesFound}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.slice(0, 50).map((game, i) => (
          <GameCard key={game.appid} game={game} index={i} onGameClick={setSelectedGame} />
        ))}
      </div>

      <AnimatePresence>
        {selectedGame && steamId && (
          <AchievementModal
            game={selectedGame}
            steamId={steamId}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
