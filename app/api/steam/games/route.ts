import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get('steamId');
  const apiKey = process.env.STEAM_API_KEY;

  if (!steamId) {
    return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Steam API Key is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true`
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

    if (!data.response || !data.response.games || data.response.games.length === 0) {
      return NextResponse.json({ error: 'No games found or profile is private' }, { status: 404 });
    }

    // Sort games by playtime
    const games = data.response.games.sort((a: any, b: any) => b.playtime_forever - a.playtime_forever);

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching Steam games:', error);
    return NextResponse.json({ error: 'Failed to fetch Steam games' }, { status: 500 });
  }
}
