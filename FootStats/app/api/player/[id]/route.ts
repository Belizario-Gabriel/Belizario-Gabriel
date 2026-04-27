import { NextResponse } from 'next/server';
import { getPlayerById } from '@/services/sportsdb';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const player = await getPlayerById(params.id);

    if (!player) {
      return NextResponse.json({ message: 'Jogador não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro interno.' },
      { status: 500 }
    );
  }
}
