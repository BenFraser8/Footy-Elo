import { useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, CalendarDays, ChevronDown, Clock3, Info, LineChart, MapPin, Menu, Radio, Shield, SlidersHorizontal, Sparkles, Trophy, X } from 'lucide-react';

type League = { id: string; name: string; shortName: string; country: string };
type Team = {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  startingRating: number;
  rating: number;
  form: string[];
  isCore: boolean;
};
type TeamSeed = Omit<Team, 'rating'>;
type Competition = 'champions_league' | 'premier_league' | 'bundesliga' | 'la_liga' | 'serie_a' | 'ligue_1' | 'friendly';
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
  { id: 'bayern', name: 'Bayern Munich', shortName: 'BAY', leagueId: 'bundesliga', startingRating: 1650, form: [], isCore: true },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', leagueId: 'ligue1', startingRating: 1630, form: ['D'], isCore: true },
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', leagueId: 'pl', startingRating: 1610, form: ['L'], isCore: true },
  { id: 'mancity', name: 'Manchester City', shortName: 'MCI', leagueId: 'pl', startingRating: 1590, form: [], isCore: true },
  { id: 'barcelona', name: 'Barcelona', shortName: 'BAR', leagueId: 'laliga', startingRating: 1570, form: ['W'], isCore: true },
  { id: 'dortmund', name: 'Borussia Dortmund', shortName: 'BVB', leagueId: 'bundesliga', startingRating: 1550, form: ['W'], isCore: true },
  { id: 'realmadrid', name: 'Real Madrid', shortName: 'RMA', leagueId: 'laliga', startingRating: 1530, form: [], isCore: true },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', leagueId: 'pl', startingRating: 1510, form: ['L'], isCore: true },
  { id: 'nottingham', name: 'Nottingham Forest', shortName: 'NFO', leagueId: 'pl', startingRating: 1500, form: ['L'], isCore: false },
  { id: 'monaco', name: 'AS Monaco', shortName: 'ASM', leagueId: 'ligue1', startingRating: 1500, form: ['W'], isCore: false },
  { id: 'manutd', name: 'Manchester United', shortName: 'MUN', leagueId: 'pl', startingRating: 1500, form: ['D'], isCore: false },
  { id: 'fiorentina', name: 'Fiorentina', shortName: 'FIO', leagueId: 'seriea', startingRating: 1500, form: [], isCore: false },
];

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

const { teams, matches } = applyPlayedResults(teamSeeds, rawMatches);
const coreTeams = teams.filter((team) => team.isCore);
const teamById = Object.fromEntries(teams.map((team) => [team.id, team])) as Record<string, Team>;
const leagueById = Object.fromEntries(leagues.map((league) => [league.id, league])) as Record<string, League>;

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

function Home() {
  const [activeLeague, setActiveLeague] = useState('all');
  const [showAllFixtures, setShowAllFixtures] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const filteredMatches = useMemo(() => activeLeague === 'all' ? matches : matches.filter((match) => match.leagueId === activeLeague), [activeLeague]);
  const filteredTeams = useMemo(() => [...coreTeams].filter((team) => activeLeague === 'all' || team.leagueId === activeLeague).sort((a, b) => b.rating - a.rating), [activeLeague]);
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
            <a href="#rankings" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-rankings">Rankings</a>
            <a href="#methodology" className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-methodology">Methodology</a>
          </nav>
          <button type="button" className="rounded-md p-2 md:hidden" onClick={() => setMobileNavOpen((value) => !value)} aria-label="Toggle navigation" data-testid="button-toggle-navigation">
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileNavOpen && <nav className="border-t border-[hsl(var(--border))] px-5 py-3 md:hidden" aria-label="Mobile navigation"><div className="flex gap-5"><a href="#fixtures" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs font-semibold" data-testid="mobile-link-fixtures">Fixtures</a><a href="#rankings" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]" data-testid="mobile-link-rankings">Rankings</a><a href="#methodology" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]" data-testid="mobile-link-methodology">Methodology</a></div></nav>}
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
             <div className="grid grid-cols-2 gap-4 pt-5"><div><p className="font-data text-3xl tracking-[-.06em]" data-testid="text-team-count">{coreTeams.length}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">teams indexed</p></div><div><p className="font-data text-3xl tracking-[-.06em]" data-testid="text-fixture-count">{matches.length}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">fixtures tracked</p></div></div>
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
             <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]" data-testid="ranking-note"><LineChart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" /> The index follows the eight requested starting ratings. Other fixture opponents are tracked from 1500 until a rating is provided.</div>
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
  return <Home />;
}
