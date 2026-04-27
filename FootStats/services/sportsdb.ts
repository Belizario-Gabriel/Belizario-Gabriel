import { SPORTS_DB_BASE_URL } from '@/lib/constants';
import {
  SearchResponse,
  SportsDbEvent,
  SportsDbLeague,
  SportsDbPlayer,
  SportsDbTeam
} from '@/types/sportsdb';

const request = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${SPORTS_DB_BASE_URL}${endpoint}`, {
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar dados da TheSportsDB: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const searchAll = async (query: string): Promise<SearchResponse> => {
  const encoded = encodeURIComponent(query);

  const [playersRes, teamsRes, leaguesRes] = await Promise.all([
    request<{ player: SportsDbPlayer[] | null }>(`/searchplayers.php?p=${encoded}`),
    request<{ teams: SportsDbTeam[] | null }>(`/searchteams.php?t=${encoded}`),
    request<{ countries: SportsDbLeague[] | null }>(`/search_all_leagues.php?c=England&s=Soccer`)
  ]);

  const leagues = (leaguesRes.countries ?? []).filter((league) =>
    league.strLeague.toLowerCase().includes(query.toLowerCase())
  );

  return {
    players: playersRes.player ?? [],
    teams: teamsRes.teams ?? [],
    leagues
  };
};

export const getPlayerById = async (id: string): Promise<SportsDbPlayer | null> => {
  const data = await request<{ players: SportsDbPlayer[] | null }>(`/lookupplayer.php?id=${id}`);
  return data.players?.[0] ?? null;
};

export const getTeamById = async (
  id: string
): Promise<{ team: SportsDbTeam | null; events: SportsDbEvent[] }> => {
  const [teamData, eventsData] = await Promise.all([
    request<{ teams: SportsDbTeam[] | null }>(`/lookupteam.php?id=${id}`),
    request<{ events: SportsDbEvent[] | null }>(`/eventslast.php?id=${id}`)
  ]);

  return {
    team: teamData.teams?.[0] ?? null,
    events: eventsData.events ?? []
  };
};
