'use client';

import { useState, useEffect } from 'react';
import { supportedLocales, setLocale, getPreferredLocale } from '../lib/i18n';

const LanguageSwitcher = () => {
  const [currentLocale, setCurrentLocale] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    setCurrentLocale(getPreferredLocale());
  }, []);

  const handleLanguageChange = (locale: 'en' | 'zh') => {
    setLocale(locale);
    // 跳转到首页，清除所有状态
    window.location.href = '/';
  };

  return (
    <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLanguageChange(locale)}
          className={`px-4 py-2 text-sm font-medium transition-all ${currentLocale === locale
            ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30 rounded-lg'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg'
            }`}
        >
          {locale === 'en' ? 'English' : '中文'}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
