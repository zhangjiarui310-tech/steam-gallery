import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get('steamId');
  const appId = searchParams.get('appId');
  let language = searchParams.get('language') || 'en';
  // 转换为 Steam API 支持的语言代码
  if (language === 'zh') {
    language = 'schinese';
  }
  const apiKey = process.env.STEAM_API_KEY;

  if (!steamId || !appId) {
    return NextResponse.json({ error: 'Steam ID and App ID are required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Steam API Key is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${apiKey}&steamid=${steamId}&appid=${appId}&l=${language}`
    );
    
    if (!response.ok) {
      return NextResponse.json({ error: `Steam API responded with status: ${response.status}` }, { status: response.status });
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Invalid JSON from Steam API:', text.substring(0, 100));
      return NextResponse.json({ error: 'Invalid response from Steam API' }, { status: 500 });
    }

    if (!data.playerstats) {
      return NextResponse.json({ error: 'No achievements data found' }, { status: 404 });
    }

    return NextResponse.json(data.playerstats);
  } catch (error) {
    console.error('Error fetching Steam achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch Steam achievements' }, { status: 500 });
  }
}