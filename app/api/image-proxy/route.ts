import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    let response = await fetch(imageUrl);
    
    // If the original image fails (e.g., 404 for some Steam games), fetch a placeholder
    if (!response.ok) {
      console.warn(`Failed to fetch original image (${response.status}), using placeholder for: ${imageUrl}`);
      // Extract app ID from URL if possible to use as a seed
      const match = imageUrl.match(/\/apps\/(\d+)\//);
      const seed = match ? match[1] : 'steam';
      response = await fetch(`https://picsum.photos/seed/${seed}/460/215`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch placeholder image: ${response.statusText}`);
      }
    }
    
    const buffer = await response.arrayBuffer();
    
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    // Allow CORS so WebGL can use the image as a texture
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
