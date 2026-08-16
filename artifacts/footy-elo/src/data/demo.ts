export type League = { id: string; name: string; shortName: string; country: string };
export type Team = {
  id: string;
  name: string;
  shortName: string;
  league: string; // top-flight domestic league name
  leagueId: string; // short id used in the UI
  startingRating: number;
  rating?: number;
  form?: string[];
  isCore?: boolean;
};
export type Player = {
  id: string;
  name: string;
  team_id: string;
  goals: number;
  assists: number;
  appearances: number;
  trophies_count: number;
};
export type Match = {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
  kickoffDate: string;
  venue: string;
  competition: string; // now accepts extended set
  played: boolean;
  homeScore?: number;
  awayScore?: number;
};

// Top-flight league teams (representative subset). Ensure league fields are top-flight domestic leagues.
export const teams: Team[] = [
  { id: 'bayern', name: 'Bayern Munich', shortName: 'BAY', league: 'Bundesliga', leagueId: 'bundesliga', startingRating: 1650, isCore: true },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', league: 'Ligue 1', leagueId: 'ligue1', startingRating: 1630, isCore: true },
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', league: 'Premier League', leagueId: 'pl', startingRating: 1610, isCore: true },
  { id: 'mancity', name: 'Manchester City', shortName: 'MCI', league: 'Premier League', leagueId: 'pl', startingRating: 1590, isCore: true },
  { id: 'barcelona', name: 'Barcelona', shortName: 'BAR', league: 'La Liga', leagueId: 'laliga', startingRating: 1570, isCore: true },
  { id: 'dortmund', name: 'Borussia Dortmund', shortName: 'BVB', league: 'Bundesliga', leagueId: 'bundesliga', startingRating: 1550, isCore: true },
  { id: 'realmadrid', name: 'Real Madrid', shortName: 'RMA', league: 'La Liga', leagueId: 'laliga', startingRating: 1530, isCore: true },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', league: 'Premier League', leagueId: 'pl', startingRating: 1510, isCore: true },
  { id: 'nottingham', name: 'Nottingham Forest', shortName: 'NFO', league: 'Premier League', leagueId: 'pl', startingRating: 1500, isCore: false },
  { id: 'monaco', name: 'AS Monaco', shortName: 'ASM', league: 'Ligue 1', leagueId: 'ligue1', startingRating: 1500, isCore: false },
  { id: 'manutd', name: 'Manchester United', shortName: 'MUN', league: 'Premier League', leagueId: 'pl', startingRating: 1500, isCore: false },
  { id: 'fiorentina', name: 'Fiorentina', shortName: 'FIO', league: 'Serie A', leagueId: 'seriea', startingRating: 1500, isCore: false },
  { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', league: 'Premier League', leagueId: 'pl', startingRating: 1485, isCore: false },
  { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'TOT', league: 'Premier League', leagueId: 'pl', startingRating: 1475, isCore: false },
  { id: 'stuttgart', name: 'VfB Stuttgart', shortName: 'VFB', league: 'Bundesliga', leagueId: 'bundesliga', startingRating: 1500 /* +30 one-time adjustment applied here (original 1470 + 30) */, isCore: false },
  { id: 'leverkusen', name: 'Bayer Leverkusen', shortName: 'LEV', league: 'Bundesliga', leagueId: 'bundesliga', startingRating: 1500, isCore: false },
  { id: 'leipzig', name: 'RB Leipzig', shortName: 'RBL', league: 'Bundesliga', leagueId: 'bundesliga', startingRating: 1490, isCore: false },
  { id: 'inter', name: 'Inter Milan', shortName: 'INT', league: 'Serie A', leagueId: 'seriea', startingRating: 1490, isCore: false },
  { id: 'marseille', name: 'Marseille', shortName: 'OM', league: 'Ligue 1', leagueId: 'ligue1', startingRating: 1490, isCore: false },
  { id: 'ajax', name: 'Ajax', shortName: 'AJA', league: 'Other', leagueId: 'other', startingRating: 1450, isCore: false },
];

export const players: Player[] = [
  { id: 'kane', name: 'Kane', team_id: 'bayern', goals: 24, assists: 10, appearances: 34, trophies_count: 2 },
  { id: 'olise', name: 'Olise', team_id: 'bayern', goals: 14, assists: 13, appearances: 33, trophies_count: 1 },
  { id: 'mbappe', name: 'Mbapp\u00e9', team_id: 'realmadrid', goals: 17, assists: 7, appearances: 30, trophies_count: 1 },
  { id: 'rice', name: 'Rice', team_id: 'arsenal', goals: 8, assists: 12, appearances: 35, trophies_count: 2 },
  { id: 'dembele', name: 'Demb\u00e9l\u00e9', team_id: 'psg', goals: 11, assists: 10, appearances: 29, trophies_count: 1 },
  { id: 'yamal', name: 'Yamal', team_id: 'barcelona', goals: 9, assists: 11, appearances: 31, trophies_count: 1 },
  { id: 'kimmich', name: 'Kimmich', team_id: 'bayern', goals: 6, assists: 9, appearances: 30, trophies_count: 2 },
  { id: 'haaland', name: 'Haaland', team_id: 'mancity', goals: 5, assists: 3, appearances: 18, trophies_count: 0 },
];

// Matches: include different competition types. competition now uses the new allowed values.
export const matches: Match[] = [
  { id: 'm1', leagueId: 'laliga', homeTeamId: 'barcelona', awayTeamId: 'nottingham', kickoff: 'Sat 8 Aug 2026', kickoffDate: '2026-08-08', venue: 'Udine', competition: 'friendly', played: true, homeScore: 3, awayScore: 1 },
  { id: 'm2', leagueId: 'ligue1', homeTeamId: 'manutd', awayTeamId: 'psg', kickoff: 'Sat 8 Aug 2026', kickoffDate: '2026-08-08', venue: 'Gothenburg', competition: 'friendly', played: true, homeScore: 2, awayScore: 2 },
  { id: 'm3', leagueId: 'bundesliga', homeTeamId: 'arsenal', awayTeamId: 'dortmund', kickoff: 'Sun 9 Aug 2026', kickoffDate: '2026-08-09', venue: 'Emirates Stadium', competition: 'friendly', played: true, homeScore: 1, awayScore: 2 },
  { id: 'm4', leagueId: 'ligue1', homeTeamId: 'liverpool', awayTeamId: 'monaco', kickoff: 'Sun 9 Aug 2026', kickoffDate: '2026-08-09', venue: 'Anfield', competition: 'champions_league', played: true, homeScore: 0, awayScore: 1 },
  { id: 'm5', leagueId: 'pl', homeTeamId: 'arsenal', awayTeamId: 'mancity', kickoff: 'Sun 16 Aug 2026', kickoffDate: '2026-08-16', venue: 'Cardiff', competition: 'premier_league', played: false },
  { id: 'm6', leagueId: 'laliga', homeTeamId: 'realmadrid', awayTeamId: 'fiorentina', kickoff: 'Aug 2026', kickoffDate: '2026-08-31', venue: 'TBA', competition: 'friendly', played: false },
  // Example Championship and Bundesliga 2 fixtures (for the new competitions)
  { id: 'm7', leagueId: 'other', homeTeamId: 'ajax', awayTeamId: 'nottingham', kickoff: 'Sat 15 Aug 2026', kickoffDate: '2026-08-15', venue: 'Amsterdam', competition: 'championship', played: false },
  { id: 'm8', leagueId: 'bundesliga', homeTeamId: 'stuttgart', awayTeamId: 'leverkusen', kickoff: 'Sun 22 Aug 2026', kickoffDate: '2026-08-22', venue: 'Mercedes-Benz Arena', competition: 'bundesliga_2', played: false },
];
