const dictionaries = {
  en: () => import('../app/locales/en.json').then((module) => module.default),
  zh: () => import('../app/locales/zh.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;
export const supportedLocales: Locale[] = ['en', 'zh'];

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};

export const getPreferredLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const storedLocale = localStorage.getItem('locale') as Locale;
  if (storedLocale && supportedLocales.includes(storedLocale)) {
    return storedLocale;
  }
  const browserLocale = navigator.language.split('-')[0] as Locale;
  if (supportedLocales.includes(browserLocale)) {
    return browserLocale;
  }
  return 'en';
};

export const setLocale = (locale: Locale) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    // 清除存储的 Steam ID，强制用户重新输入以获取对应语言的数据
    localStorage.removeItem('steamId');
    window.location.reload();
  }
};
