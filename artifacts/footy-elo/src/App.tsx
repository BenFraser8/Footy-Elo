import { useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, CalendarDays, ChevronDown, Clock3, Info, LineChart, MapPin, Menu, Radio, Shield, SlidersHorizontal, Sparkles, Trophy, X } from 'lucide-react';

type League = { id: string; name: string; shortName: string; country: string };
type Team = {
  id: string;
  name: string;
  shortName: string;
  league: TeamLeague;
  leagueId: string;
  startingRating: number;
  rating: number;
  form: string[];
  isCore: boolean;
};
type TeamSeed = Omit<Team, 'rating'>;
type Player = {
  id: string;
  name: string;
  team_id: string;
  goals: number;
  assists: number;
  appearances: number;
  trophies_count: number;
  player_elo: number;
};
type Competition = 'champions_league' | 'premier_league' | 'bundesliga' | 'la_liga' | 'serie_a' | 'ligue_1' | 'friendly';
type TeamLeague = 'Premier League' | 'Bundesliga' | 'La Liga' | 'Serie A' | 'Ligue 1' | 'Other';
type Match = {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
  kickoffDate: string;
  venue: string;
  competition: Competition;
  played: boolean;
  homeScore?: number;
  awayScore?: number;
  homeRatingAtKickoff?: number;
  awayRatingAtKickoff?: number;
  homeEloChange?: number;
  awayEloChange?: number;
};

const leagues: League[] = [
  { id: 'pl', name: 'Premier League', shortName: 'PL', country: 'England' },
  { id: 'laliga', name: 'La Liga', shortName: 'LL', country: 'Spain' },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'BL', country: 'Germany' },
  { id: 'seriea', name: 'Serie A', shortName: 'SA', country: 'Italy' },
  { id: 'ligue1', name: 'Ligue 1', shortName: 'L1', country: 'France' },
];

function expectedScore(teamRating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - teamRating) / 400));
}

const K_FACTORS: Record<Competition, number> = {
  champions_league: 35,
  premier_league: 30,
  bundesliga: 30,
  la_liga: 15,
  serie_a: 15,
  ligue_1: 10,
  friendly: 8,
};

const LEAGUE_ELO_ADJUSTMENTS: Record<TeamLeague, number> = {
  'Premier League': 30,
  Bundesliga: 30,
  'La Liga': 0,
  'Serie A': 0,
  'Ligue 1': -40,
  Other: 0,
};

const competitionLabels: Record<Competition, string> = {
  champions_league: 'Champions League',
  premier_league: 'Premier League',
  bundesliga: 'Bundesliga',
  la_liga: 'La Liga',
  serie_a: 'Serie A',
  ligue_1: 'Ligue 1',
  friendly: 'Friendly',
};

function matchProbabilities(homeRating: number, awayRating: number) {
  const homeExpectedScore = expectedScore(homeRating, awayRating);
  const drawProbability = Math.max(0.1, 0.28 - Math.abs(homeRating - awayRating) / 2000);
  const decisiveProbability = 1 - drawProbability;
  const homeProbability = homeExpectedScore * decisiveProbability;
  const awayProbability = (1 - homeExpectedScore) * decisiveProbability;
  const homePercentage = Math.round(homeProbability * 100);
  const drawPercentage = Math.round(drawProbability * 100);

  return {
    home: homePercentage,
    draw: drawPercentage,
    away: 100 - homePercentage - drawPercentage,
  };
}

const teamSeeds: TeamSeed[] = [
  { id: 'bayern', name: 'Bayern Munich', shortName: 'BAY', league: 'Bundesliga', leagueId: 'bundesliga', startingRating: 1650, form: [], isCore: true },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', league: 'Ligue 1', leagueId: 'ligue1', startingRating: 1630, form: ['D'], isCore: true },
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', league: 'Premier League', leagueId: 'pl', startingRating: 1610, form: ['L'], isCore: true },
  { id: 'mancity', name: 'Manchester City', shortName: 'MCI', league: 'Premier League', leagueId: 'pl', startingRating: 1590, form: [], isCore: true },
  { id: 'barcelona', name: 'Barcelona', shortName: 'BAR', league: 'La Liga', leagueId: 'laliga', startingRating: 1570, form: ['W'], isCore: true },
  { id: 'dortmund', name: 'Borussia Dortmund', shortName: 'BVB', league: 'Bundesliga', leagueId: 'bundesliga', startingRating: 1550, form: ['W'], isCore: true },
  { id: 'realmadrid', name: 'Real Madrid', shortName: 'RMA', league: 'La Liga', leagueId: 'laliga', startingRating: 1530, form: [], isCore: true },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', league: 'Premier League', leagueId: 'pl', startingRating: 1510, form: ['L'], isCore: true },
  { id: 'nottingham', name: 'Nottingham Forest', shortName: 'NFO', league: 'Premier League', leagueId: 'pl', startingRating: 1500, form: ['L'], isCore: false },
  { id: 'monaco', name: 'AS Monaco', shortName: 'ASM', league: 'Ligue 1', leagueId: 'ligue1', startingRating: 1500, form: ['W'], isCore: false },
  { id: 'manutd', name: 'Manchester United', shortName: 'MUN', league: 'Premier League', leagueId: 'pl', startingRating: 1500, form: ['D'], isCore: false },
  { id: 'fiorentina', name: 'Fiorentina', shortName: 'FIO', league: 'Serie A', leagueId: 'seriea', startingRating: 1500, form: [], isCore: false },
];

type RankedTeamEntry = { id: string; name: string; shortName: string; rating: number };

function makeRankedTeamSeeds(leagueId: string, league: TeamLeague, entries: RankedTeamEntry[]): TeamSeed[] {
  return entries.map((entry) => ({
    ...entry,
    league,
    leagueId,
    startingRating: entry.rating,
    form: [],
    isCore: false,
  }));
}

const additionalTeamSeeds: TeamSeed[] = [
  ...makeRankedTeamSeeds('pl', 'Premier League', [
    { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', rating: 1485 },
    { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'TOT', rating: 1475 },
    { id: 'newcastle', name: 'Newcastle United', shortName: 'NEW', rating: 1465 },
    { id: 'astonvilla', name: 'Aston Villa', shortName: 'AVL', rating: 1455 },
    { id: 'westham', name: 'West Ham United', shortName: 'WHU', rating: 1445 },
    { id: 'brighton', name: 'Brighton', shortName: 'BRI', rating: 1435 },
    { id: 'crystalpalace', name: 'Crystal Palace', shortName: 'CRY', rating: 1425 },
    { id: 'everton', name: 'Everton', shortName: 'EVE', rating: 1415 },
    { id: 'fulham', name: 'Fulham', shortName: 'FUL', rating: 1405 },
    { id: 'brentford', name: 'Brentford', shortName: 'BRE', rating: 1395 },
    { id: 'wolves', name: 'Wolverhampton Wanderers', shortName: 'WOL', rating: 1385 },
    { id: 'bournemouth', name: 'Bournemouth', shortName: 'BOU', rating: 1375 },
    { id: 'leeds', name: 'Leeds United', shortName: 'LEE', rating: 1365 },
    { id: 'southampton', name: 'Southampton', shortName: 'SOU', rating: 1355 },
  ]),
  ...makeRankedTeamSeeds('laliga', 'La Liga', [
    { id: 'atletico', name: 'Atlético Madrid', shortName: 'ATM', rating: 1490 },
    { id: 'athletic', name: 'Athletic Club', shortName: 'ATH', rating: 1480 },
    { id: 'villarreal', name: 'Villarreal', shortName: 'VIL', rating: 1470 },
    { id: 'realbetis', name: 'Real Betis', shortName: 'BET', rating: 1460 },
    { id: 'realsociedad', name: 'Real Sociedad', shortName: 'RSO', rating: 1450 },
    { id: 'sevilla', name: 'Sevilla', shortName: 'SEV', rating: 1440 },
    { id: 'valencia', name: 'Valencia', shortName: 'VAL', rating: 1430 },
    { id: 'girona', name: 'Girona', shortName: 'GIR', rating: 1420 },
    { id: 'celtavigo', name: 'Celta Vigo', shortName: 'CEL', rating: 1410 },
    { id: 'osasuna', name: 'Osasuna', shortName: 'OSA', rating: 1400 },
    { id: 'mallorca', name: 'Mallorca', shortName: 'MAL', rating: 1390 },
    { id: 'getafe', name: 'Getafe', shortName: 'GET', rating: 1380 },
    { id: 'rayo', name: 'Rayo Vallecano', shortName: 'RAY', rating: 1370 },
    { id: 'alaves', name: 'Alavés', shortName: 'ALA', rating: 1360 },
    { id: 'espanyol', name: 'Espanyol', shortName: 'ESP', rating: 1350 },
    { id: 'laspalmas', name: 'Las Palmas', shortName: 'LPA', rating: 1340 },
    { id: 'valladolid', name: 'Valladolid', shortName: 'VLL', rating: 1330 },
    { id: 'elche', name: 'Elche', shortName: 'ELC', rating: 1320 },
  ]),
  ...makeRankedTeamSeeds('bundesliga', 'Bundesliga', [
    { id: 'leverkusen', name: 'Bayer Leverkusen', shortName: 'LEV', rating: 1500 },
    { id: 'leipzig', name: 'RB Leipzig', shortName: 'RBL', rating: 1490 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', shortName: 'SGE', rating: 1480 },
    { id: 'stuttgart', name: 'VfB Stuttgart', shortName: 'VFB', rating: 1470 },
    { id: 'freiburg', name: 'SC Freiburg', shortName: 'SCF', rating: 1460 },
    { id: 'unionberlin', name: 'Union Berlin', shortName: 'FCU', rating: 1450 },
    { id: 'gladbach', name: 'Borussia Mönchengladbach', shortName: 'BMG', rating: 1440 },
    { id: 'wolfsburg', name: 'Wolfsburg', shortName: 'WOB', rating: 1430 },
    { id: 'mainz', name: 'Mainz 05', shortName: 'M05', rating: 1420 },
    { id: 'augsburg', name: 'Augsburg', shortName: 'FCA', rating: 1410 },
    { id: 'werder', name: 'Werder Bremen', shortName: 'SVW', rating: 1400 },
    { id: 'hoffenheim', name: 'Hoffenheim', shortName: 'TSG', rating: 1390 },
    { id: 'heidenheim', name: 'Heidenheim', shortName: 'HDH', rating: 1380 },
    { id: 'cologne', name: 'Cologne', shortName: 'KOE', rating: 1370 },
    { id: 'hamburg', name: 'Hamburg', shortName: 'HSV', rating: 1360 },
    { id: 'stpauli', name: 'St. Pauli', shortName: 'STP', rating: 1350 },
    { id: 'bochum', name: 'Bochum', shortName: 'BOC', rating: 1340 },
    { id: 'kiel', name: 'Holstein Kiel', shortName: 'KIE', rating: 1330 },
  ]),
  ...makeRankedTeamSeeds('seriea', 'Serie A', [
    { id: 'inter', name: 'Inter Milan', shortName: 'INT', rating: 1490 },
    { id: 'napoli', name: 'Napoli', shortName: 'NAP', rating: 1480 },
    { id: 'juventus', name: 'Juventus', shortName: 'JUV', rating: 1470 },
    { id: 'milan', name: 'AC Milan', shortName: 'MIL', rating: 1460 },
    { id: 'roma', name: 'Roma', shortName: 'ROM', rating: 1450 },
    { id: 'lazio', name: 'Lazio', shortName: 'LAZ', rating: 1440 },
    { id: 'atalanta', name: 'Atalanta', shortName: 'ATA', rating: 1430 },
    { id: 'bologna', name: 'Bologna', shortName: 'BOL', rating: 1420 },
    { id: 'torino', name: 'Torino', shortName: 'TOR', rating: 1410 },
    { id: 'genoa', name: 'Genoa', shortName: 'GEN', rating: 1400 },
    { id: 'udinese', name: 'Udinese', shortName: 'UDI', rating: 1390 },
    { id: 'sassuolo', name: 'Sassuolo', shortName: 'SAS', rating: 1380 },
    { id: 'parma', name: 'Parma', shortName: 'PAR', rating: 1370 },
    { id: 'cagliari', name: 'Cagliari', shortName: 'CAG', rating: 1360 },
    { id: 'lecce', name: 'Lecce', shortName: 'LEC', rating: 1350 },
    { id: 'como', name: 'Como', shortName: 'COM', rating: 1340 },
    { id: 'verona', name: 'Hellas Verona', shortName: 'VER', rating: 1330 },
    { id: 'monza', name: 'Monza', shortName: 'MON', rating: 1320 },
    { id: 'pisa', name: 'Pisa', shortName: 'PIS', rating: 1310 },
  ]),
  ...makeRankedTeamSeeds('ligue1', 'Ligue 1', [
    { id: 'marseille', name: 'Marseille', shortName: 'OM', rating: 1490 },
    { id: 'lyon', name: 'Lyon', shortName: 'OL', rating: 1480 },
    { id: 'lille', name: 'Lille', shortName: 'LOSC', rating: 1470 },
    { id: 'nice', name: 'Nice', shortName: 'OGC', rating: 1460 },
    { id: 'rennes', name: 'Rennes', shortName: 'REN', rating: 1450 },
    { id: 'lens', name: 'Lens', shortName: 'RCL', rating: 1440 },
    { id: 'nantes', name: 'Nantes', shortName: 'NAN', rating: 1430 },
    { id: 'strasbourg', name: 'Strasbourg', shortName: 'RCS', rating: 1420 },
    { id: 'montpellier', name: 'Montpellier', shortName: 'MPL', rating: 1410 },
    { id: 'toulouse', name: 'Toulouse', shortName: 'TFC', rating: 1400 },
    { id: 'brest', name: 'Brest', shortName: 'SBR', rating: 1390 },
    { id: 'reims', name: 'Reims', shortName: 'SDR', rating: 1380 },
    { id: 'auxerre', name: 'Auxerre', shortName: 'AJA', rating: 1370 },
    { id: 'saintetienne', name: 'Saint-Étienne', shortName: 'ASSE', rating: 1360 },
    { id: 'lehavre', name: 'Le Havre', shortName: 'HAC', rating: 1350 },
    { id: 'metz', name: 'Metz', shortName: 'FCM', rating: 1340 },
    { id: 'lorient', name: 'Lorient', shortName: 'FCL', rating: 1330 },
    { id: 'angers', name: 'Angers', shortName: 'SCO', rating: 1320 },
  ]),
  ...makeRankedTeamSeeds('other', 'Other', [
    { id: 'ajax', name: 'Ajax', shortName: 'AJA', rating: 1450 },
    { id: 'benfica', name: 'Benfica', shortName: 'SLB', rating: 1440 },
    { id: 'porto', name: 'Porto', shortName: 'FCP', rating: 1430 },
    { id: 'celtic', name: 'Celtic', shortName: 'CEL', rating: 1420 },
    { id: 'galatasaray', name: 'Galatasaray', shortName: 'GAL', rating: 1410 },
    { id: 'leicester', name: 'Leicester City', shortName: 'LEI', rating: 1350 },
  ]),
];

const allTeamSeeds = [...teamSeeds, ...additionalTeamSeeds];

const rawMatches: Match[] = [
  { id: 'm1', leagueId: 'laliga', homeTeamId: 'barcelona', awayTeamId: 'nottingham', kickoff: 'Sat 8 Aug 2026', kickoffDate: '2026-08-08', venue: 'Udine', competition: 'friendly', played: true, homeScore: 1, awayScore: 0 },
  { id: 'm2', leagueId: 'ligue1', homeTeamId: 'manutd', awayTeamId: 'psg', kickoff: 'Sat 8 Aug 2026', kickoffDate: '2026-08-08', venue: 'Gothenburg', competition: 'friendly', played: true, homeScore: 1, awayScore: 1 },
  { id: 'm3', leagueId: 'bundesliga', homeTeamId: 'arsenal', awayTeamId: 'dortmund', kickoff: 'Sun 9 Aug 2026', kickoffDate: '2026-08-09', venue: 'Emirates Stadium', competition: 'friendly', played: true, homeScore: 2, awayScore: 3 },
  { id: 'm4', leagueId: 'ligue1', homeTeamId: 'liverpool', awayTeamId: 'monaco', kickoff: 'Sun 9 Aug 2026', kickoffDate: '2026-08-09', venue: 'Anfield', competition: 'friendly', played: true, homeScore: 2, awayScore: 3 },
  { id: 'm5', leagueId: 'pl', homeTeamId: 'arsenal', awayTeamId: 'mancity', kickoff: 'Sun 16 Aug 2026', kickoffDate: '2026-08-16', venue: 'Cardiff', competition: 'friendly', played: false },
  { id: 'm6', leagueId: 'laliga', homeTeamId: 'realmadrid', awayTeamId: 'fiorentina', kickoff: 'August 2026', kickoffDate: '2026-08-31', venue: 'TBA', competition: 'friendly', played: false },
];

function applyPlayedResults(seeds: TeamSeed[], fixtures: Match[]) {
  const ratings = Object.fromEntries(seeds.map((team) => [team.id, team.startingRating])) as Record<string, number>;
  const updatedMatches = [...fixtures].sort((a, b) => a.kickoffDate.localeCompare(b.kickoffDate)).map((match) => {
    if (!match.played || match.homeScore === undefined || match.awayScore === undefined) return match;

    const homeRatingAtKickoff = ratings[match.homeTeamId];
    const awayRatingAtKickoff = ratings[match.awayTeamId];
    const homeExpected = expectedScore(homeRatingAtKickoff, awayRatingAtKickoff);
    const homeResult = match.homeScore === match.awayScore ? 0.5 : match.homeScore > match.awayScore ? 1 : 0;
    const homeEloChange = K_FACTORS[match.competition] * (homeResult - homeExpected);
    ratings[match.homeTeamId] += homeEloChange;
    ratings[match.awayTeamId] -= homeEloChange;

    return {
      ...match,
      homeRatingAtKickoff,
      awayRatingAtKickoff,
      homeEloChange,
      awayEloChange: -homeEloChange,
    };
  });

  return {
    teams: seeds.map((team) => ({ ...team, rating: ratings[team.id] })),
    matches: updatedMatches,
  };
}

const { teams: matchAdjustedTeams, matches } = applyPlayedResults(allTeamSeeds, rawMatches);
const teams = matchAdjustedTeams.map((team) => ({
  ...team,
  rating: team.rating + LEAGUE_ELO_ADJUSTMENTS[team.league],
}));
const coreTeams = teams.filter((team) => team.isCore);
const teamById = Object.fromEntries(teams.map((team) => [team.id, team])) as Record<string, Team>;
const rankingLeagues: League[] = [...leagues, { id: 'other', name: 'Other', shortName: 'OTH', country: 'Outside top five' }];
const leagueById = Object.fromEntries(rankingLeagues.map((league) => [league.id, league])) as Record<string, League>;

function calculatePlayerElo(goals: number, assists: number, trophiesCount: number, appearances: number) {
  return 1500 + (goals * 8) + (assists * 5) + (trophiesCount * 15) + (appearances * 0.5);
}

function makePlayer(
  id: string,
  name: string,
  team_id: string,
  goals: number,
  assists: number,
  appearances: number,
  trophies_count: number,
): Player {
  return {
    id,
    name,
    team_id,
    goals,
    assists,
    appearances,
    trophies_count,
    player_elo: calculatePlayerElo(goals, assists, trophies_count, appearances),
  };
}

const players: Player[] = [
  makePlayer('kane', 'Kane', 'bayern', 24, 10, 34, 2),
  makePlayer('olise', 'Olise', 'bayern', 14, 13, 33, 1),
  makePlayer('mbappe', 'Mbappé', 'realmadrid', 17, 7, 30, 1),
  makePlayer('rice', 'Rice', 'arsenal', 8, 12, 35, 2),
  makePlayer('dembele', 'Dembélé', 'psg', 11, 10, 29, 1),
  makePlayer('yamal', 'Yamal', 'barcelona', 9, 11, 31, 1),
  makePlayer('kimmich', 'Kimmich', 'bayern', 6, 9, 30, 2),
  makePlayer('haaland', 'Haaland', 'mancity', 5, 3, 18, 0),
].sort((a, b) => b.player_elo - a.player_elo);

function TeamMark({ team, compact = false }: { team: Team; compact?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] font-data font-medium text-[hsl(var(--secondary-foreground))] ${compact ? 'h-8 w-8 text-[9px]' : 'h-10 w-10 text-[10px]'}`} data-testid={`team-mark-${team.id}`}>
      {team.shortName.slice(0, 3)}
    </span>
  );
}

function FormDots({ form, id }: { form: string[]; id: string }) {
  return (
    <div className="flex items-center gap-1" data-testid={`form-${id}`} aria-label={`Recent form: ${form.join(', ')}`}>
      {form.map((result, index) => (
        <span key={`${id}-${index}`} className={`h-1.5 w-1.5 rounded-full ${result === 'W' ? 'bg-[hsl(var(--secondary-foreground))]' : result === 'D' ? 'bg-[hsl(var(--muted-foreground)/.45)]' : 'bg-[hsl(var(--accent))]'}`} />
      ))}
    </div>
  );
}

function formatEloChange(change: number | undefined) {
  if (change === undefined) return '';
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)} Elo`;
}

function MatchCard({ match, featured = false }: { match: Match; featured?: boolean }) {
  const home = teamById[match.homeTeamId];
  const away = teamById[match.awayTeamId];
  const homeRating = match.homeRatingAtKickoff ?? home.rating;
  const awayRating = match.awayRatingAtKickoff ?? away.rating;
  const probabilities = matchProbabilities(homeRating, awayRating);
  const league = leagueById[match.leagueId];
  return (
    <article className={`group relative overflow-hidden border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.5)] hover:shadow-[var(--shadow-md)] ${featured ? 'rounded-xl' : 'rounded-lg'}`} data-testid={`fixture-card-${match.id}`}>
      {featured && <div className="absolute left-0 top-0 h-full w-1 bg-[hsl(var(--accent))]" />}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]" data-testid={`fixture-league-${match.id}`}>
          <span className="flex h-5 w-5 items-center justify-center rounded border border-[hsl(var(--border))] text-[9px] text-[hsl(var(--foreground))]">{league.shortName}</span>
          <span data-testid={`fixture-competition-${match.id}`}>{competitionLabels[match.competition]}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-[hsl(var(--muted-foreground))]" data-testid={`fixture-kickoff-${match.id}`}>
          <span className={`rounded-full px-2 py-1 font-data text-[9px] uppercase tracking-[.12em] ${match.played ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]' : 'border border-[hsl(var(--border))]'}`} data-testid={`fixture-status-${match.id}`}>{match.played ? 'Played' : 'Upcoming'}</span>
          <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {match.kickoff}</span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-center gap-3">
          <TeamMark team={home} compact={!featured} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-[15px]" data-testid={`fixture-home-team-${match.id}`}>{home.name}</p>
            <p className="mt-0.5 font-data text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`fixture-home-rating-${match.id}`}>{homeRating.toFixed(0)} ELO</p>
          </div>
        </div>
        <div className="text-center">
          {match.played ? (
            <div data-testid={`fixture-score-${match.id}`}>
              <span className="font-data text-2xl font-medium tracking-[-.06em]">{match.homeScore}–{match.awayScore}</span>
              <p className="mt-1 font-data text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Final</p>
            </div>
          ) : (
            <span className="font-display text-xl text-[hsl(var(--muted-foreground)/.7)]">v</span>
          )}
          <div className="mt-1 flex items-center justify-center gap-1 font-data text-[10px] text-[hsl(var(--muted-foreground))]"><MapPin className="h-3 w-3" /> {match.venue}</div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-[15px]" data-testid={`fixture-away-team-${match.id}`}>{away.name}</p>
            <p className="mt-0.5 font-data text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`fixture-away-rating-${match.id}`}>{awayRating.toFixed(0)} ELO</p>
          </div>
          <TeamMark team={away} compact={!featured} />
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.45)]">
        <div className="border-r border-[hsl(var(--border))] px-3 py-3 sm:px-5">
          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]"><span>Home win</span><span className="font-data text-xs text-[hsl(var(--foreground))]" data-testid={`probability-home-${match.id}`}>{probabilities.home}%</span></div>
          <div className="h-1 overflow-hidden rounded-full bg-[hsl(var(--border))]"><div className="h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-500" style={{ width: `${probabilities.home}%` }} /></div>
        </div>
        <div className="border-r border-[hsl(var(--border))] px-3 py-3 sm:px-5">
          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]"><span>Draw</span><span className="font-data text-xs text-[hsl(var(--foreground))]" data-testid={`probability-draw-${match.id}`}>{probabilities.draw}%</span></div>
          <div className="h-1 overflow-hidden rounded-full bg-[hsl(var(--border))]"><div className="h-full rounded-full bg-[hsl(var(--muted-foreground)/.65)] transition-all duration-500" style={{ width: `${probabilities.draw}%` }} /></div>
        </div>
        <div className="px-3 py-3 sm:px-5">
          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]"><span>Away win</span><span className="font-data text-xs text-[hsl(var(--foreground))]" data-testid={`probability-away-${match.id}`}>{probabilities.away}%</span></div>
          <div className="h-1 overflow-hidden rounded-full bg-[hsl(var(--border))]"><div className="ml-auto h-full rounded-full bg-[hsl(var(--secondary-foreground))] transition-all duration-500" style={{ width: `${probabilities.away}%` }} /></div>
        </div>
      </div>
      {match.played && <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-2.5 font-data text-[10px] text-[hsl(var(--muted-foreground))] sm:px-6" data-testid={`fixture-elo-changes-${match.id}`}><span>Rating change <span className="opacity-60">· K={K_FACTORS[match.competition]}</span></span><span><strong className={match.homeEloChange !== undefined && match.homeEloChange >= 0 ? 'text-[hsl(var(--secondary-foreground))]' : 'text-[hsl(var(--accent))]'}>{home.shortName} {formatEloChange(match.homeEloChange)}</strong><span className="mx-2 opacity-40">/</span><strong className={match.awayEloChange !== undefined && match.awayEloChange >= 0 ? 'text-[hsl(var(--secondary-foreground))]' : 'text-[hsl(var(--accent))]'}>{away.shortName} {formatEloChange(match.awayEloChange)}</strong></span></div>}
    </article>
  );
}

function RankingRow({ team, rank }: { team: Team; rank: number }) {
  const league = leagueById[team.leagueId];
  return (
    <div className="group grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-[hsl(var(--border))] py-3.5 last:border-b-0" data-testid={`ranking-row-${team.id}`}>
      <span className={`font-data text-xs ${rank <= 3 ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`ranking-position-${team.id}`}>{String(rank).padStart(2, '0')}</span>
      <div className="flex min-w-0 items-center gap-2.5">
        <TeamMark team={team} compact />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" data-testid={`ranking-team-${team.id}`}>{team.name}</p>
          <div className="mt-1 flex items-center gap-2"><span className="font-data text-[10px] text-[hsl(var(--muted-foreground))]">{league.shortName}</span><FormDots form={team.form} id={`rank-${team.id}`} /></div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-data text-sm font-medium" data-testid={`ranking-rating-${team.id}`}>{Math.round(team.rating)}</p>
        <p className="mt-0.5 text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">ELO</p>
      </div>
    </div>
  );
}

function RankingsTable({ rankedTeams }: { rankedTeams: Team[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.58)]" data-testid="table-rankings">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              <th scope="col" className="w-20 px-4 py-3 text-center sm:px-6">Rank</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Team</th>
              <th scope="col" className="px-4 py-3 sm:px-6">League</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Elo rating</th>
            </tr>
          </thead>
          <tbody>
            {rankedTeams.map((team, index) => (
              <tr key={team.id} className="border-b border-[hsl(var(--border))] last:border-b-0" data-testid={`rankings-table-row-${team.id}`}>
                <td className={`px-4 py-4 text-center font-data text-sm ${index < 3 ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'} sm:px-6`} data-testid={`rankings-table-position-${team.id}`}>
                  {index + 1}
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <TeamMark team={team} compact />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{team.name}</p>
                      <p className="mt-1 font-data text-[10px] text-[hsl(var(--muted-foreground))]">{team.shortName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-[hsl(var(--muted-foreground))]">{team.league}</td>
                <td className="px-4 py-4 text-right font-data text-base font-medium sm:px-6" data-testid={`rankings-table-rating-${team.id}`}>
                  {Math.round(team.rating)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Rankings() {
  const [view, setView] = useState<'league' | 'overall'>('league');
  const [selectedLeague, setSelectedLeague] = useState('pl');
  const rankedTeams = useMemo(() => {
    const eligibleTeams = view === 'league'
      ? teams.filter((team) => team.leagueId === selectedLeague)
      : teams;
    return [...eligibleTeams].sort((a, b) => b.rating - a.rating).slice(0, view === 'league' ? 20 : 50);
  }, [selectedLeague, view]);
  const selectedLeagueName = leagueById[selectedLeague]?.name ?? 'Selected league';

  return (
    <div className="page-grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="/" className="flex items-center gap-3" data-testid="rankings-link-home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><BarChart3 className="h-4.5 w-4.5" /></span>
            <span><span className="block font-display text-xl leading-none tracking-[-.03em]">footy<span className="text-[hsl(var(--accent))]">elo</span></span><span className="mt-1 block font-data text-[8px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">European football index</span></span>
          </a>
          <nav className="flex items-center gap-5 sm:gap-7" aria-label="Primary navigation">
            <a href="/" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="rankings-link-dashboard">Dashboard</a>
            <a href="/rankings" className="text-xs font-semibold text-[hsl(var(--foreground))]" aria-current="page" data-testid="rankings-link-current">Rankings</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
        <section className="max-w-3xl py-12 sm:py-16 lg:py-20">
          <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[hsl(var(--accent))]"><Trophy className="h-3.5 w-3.5" /> The index</div>
          <h1 className="font-display text-5xl leading-[.96] tracking-[-.045em] sm:text-7xl" data-testid="heading-rankings">Every team,<br /><span className="text-[hsl(var(--accent))]">put in order.</span></h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">Explore the final Elo ratings across the full Footy Elo team index. Switch between a league table and the global leaderboard.</p>
        </section>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-[hsl(var(--border))] pb-4" role="tablist" aria-label="Ranking views">
          <button type="button" role="tab" aria-selected={view === 'league'} onClick={() => setView('league')} className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${view === 'league' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`} data-testid="button-rankings-by-league">Top 20 by League</button>
          <button type="button" role="tab" aria-selected={view === 'overall'} onClick={() => setView('overall')} className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${view === 'overall' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`} data-testid="button-rankings-overall">Top 50 Overall</button>
        </div>

        <section aria-labelledby="rankings-table-heading" data-testid="section-full-rankings">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-data text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">{view === 'league' ? 'League leaderboard' : 'Global leaderboard'}</p>
              <h2 id="rankings-table-heading" className="font-display text-3xl tracking-[-.035em] sm:text-4xl">{view === 'league' ? `Top 20 · ${selectedLeagueName}` : 'Top 50 overall'}</h2>
            </div>
            {view === 'league' && (
              <label className="flex items-center gap-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                <span>League</span>
                <select value={selectedLeague} onChange={(event) => setSelectedLeague(event.target.value)} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--accent))]" aria-label="Select league" data-testid="select-ranking-league">
                  {rankingLeagues.map((league) => <option key={league.id} value={league.id}>{league.name}</option>)}
                </select>
              </label>
            )}
          </div>
          {rankedTeams.length === 0 ? <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-14 text-center text-sm text-[hsl(var(--muted-foreground))]" data-testid="empty-full-rankings">No teams to rank here.</div> : <RankingsTable rankedTeams={rankedTeams} />}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]" data-testid="rankings-page-note"><LineChart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" /> Ratings are ordered highest to lowest. Match results are applied chronologically, then a one-time league adjustment is applied: Premier League +30, Bundesliga +30, Ligue 1 −40.</div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))]"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span className="font-display text-lg text-[hsl(var(--foreground))]">footy<span className="text-[hsl(var(--accent))]">elo</span></span><span>Built for the curious fan · Model snapshot 14 Aug 2026</span><a href="/" className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))]" data-testid="rankings-link-footer-dashboard">Back to dashboard <ArrowUpRight className="h-3.5 w-3.5" /></a></div></footer>
    </div>
  );
}

function PlayerRankingsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.58)]" data-testid="table-player-rankings">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              <th scope="col" className="w-20 px-4 py-3 text-center sm:px-6">Rank</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Player</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Team</th>
              <th scope="col" className="px-4 py-3 text-right">Goals</th>
              <th scope="col" className="px-4 py-3 text-right">Assists</th>
              <th scope="col" className="px-4 py-3 text-right">Apps</th>
              <th scope="col" className="px-4 py-3 text-right">Trophies</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Player Elo</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const team = teamById[player.team_id];
              return (
                <tr key={player.id} className="border-b border-[hsl(var(--border))] last:border-b-0" data-testid={`player-ranking-row-${player.id}`}>
                  <td className={`px-4 py-4 text-center font-data text-sm ${index < 3 ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'} sm:px-6`} data-testid={`player-ranking-position-${player.id}`}>{index + 1}</td>
                  <td className="px-4 py-4 sm:px-6"><p className="font-semibold">{player.name}</p><p className="mt-1 font-data text-[10px] text-[hsl(var(--muted-foreground))]">{player.appearances} appearances</p></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-2.5"><TeamMark team={team} compact /><span className="whitespace-nowrap text-sm text-[hsl(var(--muted-foreground))]">{team.name}</span></div></td>
                  <td className="px-4 py-4 text-right font-data text-sm">{player.goals}</td>
                  <td className="px-4 py-4 text-right font-data text-sm">{player.assists}</td>
                  <td className="px-4 py-4 text-right font-data text-sm">{player.appearances}</td>
                  <td className="px-4 py-4 text-right font-data text-sm">{player.trophies_count}</td>
                  <td className="px-4 py-4 text-right font-data text-base font-medium sm:px-6" data-testid={`player-ranking-elo-${player.id}`}>{player.player_elo.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Players() {
  return (
    <div className="page-grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="/" className="flex items-center gap-3" data-testid="players-link-home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><BarChart3 className="h-4.5 w-4.5" /></span>
            <span><span className="block font-display text-xl leading-none tracking-[-.03em]">footy<span className="text-[hsl(var(--accent))]">elo</span></span><span className="mt-1 block font-data text-[8px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">European football index</span></span>
          </a>
          <nav className="flex items-center gap-5 sm:gap-7" aria-label="Primary navigation">
            <a href="/" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="players-link-dashboard">Dashboard</a>
            <a href="/rankings" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="players-link-rankings">Teams</a>
            <a href="/players" className="text-xs font-semibold text-[hsl(var(--foreground))]" aria-current="page" data-testid="players-link-current">Players</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
        <section className="max-w-3xl py-12 sm:py-16 lg:py-20">
          <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[hsl(var(--accent))]"><Trophy className="h-3.5 w-3.5" /> Player index</div>
          <h1 className="font-display text-5xl leading-[.96] tracking-[-.045em] sm:text-7xl" data-testid="heading-player-rankings">Players,<br /><span className="text-[hsl(var(--accent))]">put in order.</span></h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">A transparent player rating built from goals, assists, appearances, and trophies. Every player is ranked against the same starting baseline.</p>
        </section>

        <section aria-labelledby="player-rankings-heading" data-testid="section-player-rankings">
          <div className="mb-5 flex items-end justify-between">
            <div><p className="mb-2 font-data text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Player leaderboard</p><h2 id="player-rankings-heading" className="font-display text-3xl tracking-[-.035em] sm:text-4xl">Player Rankings</h2></div>
            <span className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] sm:flex"><LineChart className="h-3.5 w-3.5" /> {players.length} players indexed</span>
          </div>
          <PlayerRankingsTable />
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]" data-testid="player-rankings-note"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" /> Player Elo = 1500 + (goals × 8) + (assists × 5) + (trophies × 15) + (appearances × 0.5).</div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))]"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span className="font-display text-lg text-[hsl(var(--foreground))]">footy<span className="text-[hsl(var(--accent))]">elo</span></span><span>Built for the curious fan · Model snapshot 14 Aug 2026</span><a href="/" className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))]" data-testid="players-link-footer-dashboard">Back to dashboard <ArrowUpRight className="h-3.5 w-3.5" /></a></div></footer>
    </div>
  );
}

function Home() {
  const [activeLeague, setActiveLeague] = useState('all');
  const [showAllFixtures, setShowAllFixtures] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const filteredMatches = useMemo(() => activeLeague === 'all' ? matches : matches.filter((match) => match.leagueId === activeLeague), [activeLeague]);
  const filteredTeams = useMemo(() => [...teams].filter((team) => activeLeague === 'all' || team.leagueId === activeLeague).sort((a, b) => b.rating - a.rating), [activeLeague]);
  const visibleMatches = showAllFixtures ? filteredMatches : filteredMatches.slice(0, 5);

  return (
    <div className="page-grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="/" className="flex items-center gap-3" data-testid="link-home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><BarChart3 className="h-4.5 w-4.5" /></span>
            <span><span className="block font-display text-xl leading-none tracking-[-.03em]">footy<span className="text-[hsl(var(--accent))]">elo</span></span><span className="mt-1 block font-data text-[8px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">European football index</span></span>
          </a>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            <a href="#fixtures" className="text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:text-[hsl(var(--accent))]" data-testid="link-fixtures">Fixtures</a>
            <a href="/rankings" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-rankings">Rankings</a>
            <a href="/players" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-players">Players</a>
            <a href="#methodology" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-methodology">Methodology</a>
          </nav>
          <button type="button" className="rounded-md p-2 md:hidden" onClick={() => setMobileNavOpen((value) => !value)} aria-label="Toggle navigation" data-testid="button-toggle-navigation">
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
         {mobileNavOpen && <nav className="border-t border-[hsl(var(--border))] px-5 py-3 md:hidden" aria-label="Mobile navigation"><div className="flex gap-5"><a href="#fixtures" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs font-semibold" data-testid="mobile-link-fixtures">Fixtures</a><a href="/rankings" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]" data-testid="mobile-link-rankings">Rankings</a><a href="/players" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]" data-testid="mobile-link-players">Players</a><a href="#methodology" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]" data-testid="mobile-link-methodology">Methodology</a></div></nav>}
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
        <section className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_360px] lg:items-end lg:gap-16 lg:py-20">
          <div className="animate-rise-in">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[hsl(var(--accent))]"><span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Matchday snapshot <span className="text-[hsl(var(--muted-foreground))">/</span> 14 August 2026</div>
            <h1 className="max-w-3xl font-display text-5xl leading-[.96] tracking-[-.045em] sm:text-7xl lg:text-[88px]" data-testid="heading-dashboard">The weekend,<br /><span className="text-[hsl(var(--accent))]">reduced to a number.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">A clear-eyed read on the games ahead. Elo ratings turn recent results, opponent quality, and home advantage into one honest signal.</p>
          </div>
          <div className="animate-rise-in rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-5 [animation-delay:120ms] sm:p-6" data-testid="card-model-status">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4"><div className="flex items-center gap-2 text-xs font-semibold"><Radio className="h-3.5 w-3.5 text-[hsl(var(--accent))]" /> Model status</div><span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-1 font-data text-[9px] font-medium uppercase tracking-[.12em] text-[hsl(var(--secondary-foreground))]" data-testid="status-model-live">Live</span></div>
              <div className="grid grid-cols-2 gap-4 pt-5"><div><p className="font-data text-3xl tracking-[-.06em]" data-testid="text-team-count">{teams.length}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">teams indexed</p></div><div><p className="font-data text-3xl tracking-[-.06em]" data-testid="text-fixture-count">{matches.length}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">fixtures tracked</p></div></div>
            <div className="mt-6 flex items-start gap-2 border-t border-[hsl(var(--border))] pt-4 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" /> Ratings are refreshed after every result. Percentages are model probabilities, not predictions of certainty.</div>
          </div>
        </section>

        <div className="mb-9 flex items-center gap-3 overflow-x-auto border-b border-[hsl(var(--border))] pb-3" data-testid="league-filter">
          <SlidersHorizontal className="mr-1 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <button type="button" onClick={() => { setActiveLeague('all'); setShowAllFixtures(false); }} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${activeLeague === 'all' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`} data-testid="button-filter-all">All leagues</button>
          {leagues.map((league) => <button type="button" key={league.id} onClick={() => { setActiveLeague(league.id); setShowAllFixtures(false); }} className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${activeLeague === league.id ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`} data-testid={`button-filter-${league.id}`}><span className="font-data text-[9px] opacity-60">{league.shortName}</span>{league.name}</button>)}
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <section id="fixtures" className="scroll-mt-8 animate-rise-in [animation-delay:180ms]" data-testid="section-fixtures">
             <div className="mb-5 flex items-end justify-between"><div><p className="mb-2 font-data text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">The match log</p><h2 className="font-display text-3xl tracking-[-.035em] sm:text-4xl">Fixtures to watch</h2></div><div className="hidden items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex"><CalendarDays className="h-3.5 w-3.5" /> August 2026</div></div>
            <div className="space-y-3">
              {visibleMatches.length === 0 ? <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-6 py-14 text-center" data-testid="empty-fixtures"><CalendarDays className="mx-auto mb-3 h-6 w-6 text-[hsl(var(--muted-foreground))]" /><p className="font-display text-xl">No fixtures in this window.</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try another league filter.</p></div> : visibleMatches.map((match, index) => <MatchCard key={match.id} match={match} featured={index === 0 && activeLeague === 'all'} />)}
            </div>
            {filteredMatches.length > 5 && <button type="button" onClick={() => setShowAllFixtures((value) => !value)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] py-3 text-xs font-semibold transition-colors hover:border-[hsl(var(--accent)/.5)] hover:bg-[hsl(var(--card))]" data-testid="button-toggle-fixtures">{showAllFixtures ? 'Show fewer fixtures' : `See all ${filteredMatches.length} fixtures`}<ChevronDown className={`h-4 w-4 transition-transform ${showAllFixtures ? 'rotate-180' : ''}`} /></button>}
          </section>

          <aside id="rankings" className="scroll-mt-8 animate-rise-in [animation-delay:260ms]" data-testid="section-rankings">
            <div className="mb-5 flex items-end justify-between"><div><p className="mb-2 font-data text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">The index</p><h2 className="font-display text-3xl tracking-[-.035em] sm:text-4xl">Team strength</h2></div><Trophy className="mb-1 h-5 w-5 text-[hsl(var(--accent))]" /></div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.58)] px-4 sm:px-5" data-testid="card-rankings">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] py-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]"><span>{activeLeague === 'all' ? 'Across all leagues' : leagueById[activeLeague].name}</span><span>Rating</span></div>
              {filteredTeams.length === 0 ? <div className="py-12 text-center text-sm text-[hsl(var(--muted-foreground))]" data-testid="empty-rankings">No teams to rank here.</div> : filteredTeams.map((team, index) => <RankingRow key={team.id} team={team} rank={index + 1} />)}
            </div>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]" data-testid="ranking-note"><LineChart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" /> The index combines seeded league ratings with the latest completed fixture results.</div>
          </aside>
        </div>

        <section id="methodology" className="mt-20 scroll-mt-8 border-t border-[hsl(var(--border))] pt-8 sm:mt-28 sm:pt-10" data-testid="section-methodology">
          <div className="grid gap-8 sm:grid-cols-[1fr_2fr] sm:items-start"><div><p className="mb-2 font-data text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Under the hood</p><h2 className="font-display text-3xl tracking-[-.03em]">A simple model.<br />A useful signal.</h2></div><div className="grid gap-6 sm:grid-cols-2"><div><Shield className="mb-3 h-5 w-5 text-[hsl(var(--accent))]" /><h3 className="text-sm font-semibold">Elo, without the fog</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Every team starts with a rating that moves with results and the quality of the opposition. Higher is stronger. Competition changes how quickly the rating moves.</p></div><div><Sparkles className="mb-3 h-5 w-5 text-[hsl(var(--accent))]" /><h3 className="text-sm font-semibold">Probability, not prophecy</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Three-way percentages combine the standard Elo expected score with a draw estimate that never falls below 10%.</p></div></div></div>
        </section>
      </main>
       <footer className="border-t border-[hsl(var(--border))]"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span className="font-display text-lg text-[hsl(var(--foreground))]">footy<span className="text-[hsl(var(--accent))]">elo</span></span><span data-testid="text-footer-update">Built for the curious fan · Model snapshot 14 Aug 2026</span><a href="#methodology" className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))]" data-testid="link-footer-methodology">How it works <ArrowUpRight className="h-3.5 w-3.5" /></a></div></footer>
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/players') return <Players />;
  return window.location.pathname === '/rankings' ? <Rankings /> : <Home />;
}
