import { notFound } from 'next/navigation';
import { FavoriteButton } from '@/components/FavoriteButton';
import { truncate } from '@/lib/utils';
import { getTeamById } from '@/services/sportsdb';

export default async function TeamDetails({ params }: { params: { id: string } }) {
  const data = await getTeamById(params.id);

  if (!data.team) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <article className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">{data.team.strTeam}</h1>
          <FavoriteButton id={`team:${data.team.idTeam}`} label="Favoritar time" />
        </div>
        <div className="grid gap-3 text-slate-300 md:grid-cols-2">
          <p><strong>Liga:</strong> {data.team.strLeague ?? 'Não informada'}</p>
          <p><strong>Estádio:</strong> {data.team.strStadium ?? 'Não informado'}</p>
        </div>
        <p className="leading-relaxed text-slate-200">{truncate(data.team.strDescriptionEN, 1500)}</p>
      </article>

      <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Últimos jogos</h2>
        <ul className="space-y-2">
          {data.events.length ? (
            data.events.map((event) => (
              <li key={event.idEvent} className="rounded-lg border border-slate-800 p-3 text-slate-200">
                <p className="font-medium">{event.strEvent ?? 'Confronto não disponível'}</p>
                <p className="text-sm text-slate-400">
                  {event.dateEvent ?? 'Data não informada'} • {event.strLeague ?? 'Liga não informada'}
                </p>
              </li>
            ))
          ) : (
            <li className="text-slate-400">Sem jogos recentes.</li>
          )}
        </ul>
      </article>
    </section>
  );
}
