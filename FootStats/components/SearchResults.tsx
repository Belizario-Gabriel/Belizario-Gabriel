'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { truncate } from '@/lib/utils';
import { SearchResponse } from '@/types/sportsdb';
import { LoadingCard } from './LoadingCard';

const EMPTY: SearchResponse = { players: [], teams: [], leagues: [] };

export function SearchResults({ query }: { query: string }) {
  const [data, setData] = useState<SearchResponse>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!query) {
        setData(EMPTY);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Erro ao carregar resultados.');
        const payload = (await response.json()) as SearchResponse;
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado.');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [query]);

  if (!query) {
    return <p className="text-slate-400">Digite algo para iniciar a busca.</p>;
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  const hasData = data.players.length || data.teams.length || data.leagues.length;
  if (!hasData) {
    return <p className="text-slate-400">Nenhum resultado encontrado para "{query}".</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Jogadores</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data.players.map((player) => (
            <Link key={player.idPlayer} href={`/player/${player.idPlayer}`} className="rounded-xl border border-slate-800 p-4 hover:border-brand">
              <h3 className="font-semibold">{player.strPlayer}</h3>
              <p className="text-sm text-slate-300">{player.strTeam ?? 'Sem time'}</p>
              <p className="mt-2 text-sm text-slate-400">{truncate(player.strDescriptionEN, 140)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Times</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data.teams.map((team) => (
            <Link key={team.idTeam} href={`/team/${team.idTeam}`} className="rounded-xl border border-slate-800 p-4 hover:border-brand">
              <h3 className="font-semibold">{team.strTeam}</h3>
              <p className="text-sm text-slate-300">{team.strLeague ?? 'Liga não informada'}</p>
              <p className="mt-2 text-sm text-slate-400">{truncate(team.strDescriptionEN, 140)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Ligas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data.leagues.map((league) => (
            <article key={league.idLeague} className="rounded-xl border border-slate-800 p-4">
              <h3 className="font-semibold">{league.strLeague}</h3>
              <p className="text-sm text-slate-300">{league.strCountry ?? 'País não informado'}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
