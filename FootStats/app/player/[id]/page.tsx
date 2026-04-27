import { notFound } from 'next/navigation';
import { FavoriteButton } from '@/components/FavoriteButton';
import { truncate } from '@/lib/utils';
import { getPlayerById } from '@/services/sportsdb';

export default async function PlayerDetails({ params }: { params: { id: string } }) {
  const player = await getPlayerById(params.id);

  if (!player) {
    notFound();
  }

  return (
    <article className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{player.strPlayer}</h1>
        <FavoriteButton id={`player:${player.idPlayer}`} label="Favoritar jogador" />
      </div>
      <div className="grid gap-3 text-slate-300 md:grid-cols-2">
        <p><strong>Time:</strong> {player.strTeam ?? 'Não informado'}</p>
        <p><strong>Posição:</strong> {player.strPosition ?? 'Não informada'}</p>
        <p><strong>Nacionalidade:</strong> {player.strNationality ?? 'Não informada'}</p>
      </div>
      <p className="leading-relaxed text-slate-200">{truncate(player.strDescriptionEN, 1500)}</p>
    </article>
  );
}
