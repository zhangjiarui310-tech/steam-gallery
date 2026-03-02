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
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
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

    if (!data.response || !data.response.players || data.response.players.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(data.response.players[0]);
  } catch (error) {
    console.error('Error fetching Steam profile:', error);
    return NextResponse.json({ error: 'Failed to fetch Steam profile' }, { status: 500 });
  }
}
