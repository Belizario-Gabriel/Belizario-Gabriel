import { NextRequest, NextResponse } from 'next/server';
import { searchAll } from '@/services/sportsdb';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ players: [], teams: [], leagues: [] });
  }

  try {
    const data = await searchAll(query);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro interno.' },
      { status: 500 }
    );
  }
}
