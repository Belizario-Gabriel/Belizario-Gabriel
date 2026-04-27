export interface SportsDbPlayer {
  idPlayer: string;
  strPlayer: string;
  strTeam?: string;
  strPosition?: string;
  strNationality?: string;
  strDescriptionEN?: string;
  strThumb?: string;
}

export interface SportsDbTeam {
  idTeam: string;
  strTeam: string;
  strLeague?: string;
  strStadium?: string;
  strDescriptionEN?: string;
  strTeamBadge?: string;
}

export interface SportsDbLeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strCountry?: string;
}

export interface SportsDbEvent {
  idEvent: string;
  dateEvent?: string;
  strEvent?: string;
  strLeague?: string;
}

export interface SearchResponse {
  players: SportsDbPlayer[];
  teams: SportsDbTeam[];
  leagues: SportsDbLeague[];
}
