import { NextResponse } from 'next/server';
import { getTeamById } from '@/services/sportsdb';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getTeamById(params.id);

    if (!data.team) {
      return NextResponse.json({ message: 'Time não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro interno.' },
      { status: 500 }
    );
  }
}
