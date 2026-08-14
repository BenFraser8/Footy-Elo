import { useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, CalendarDays, ChevronDown, Clock3, Info, LineChart, MapPin, Menu, Radio, Shield, SlidersHorizontal, Sparkles, Trophy, X } from 'lucide-react';

type League = { id: string; name: string; shortName: string; country: string };
type Team = { id: string; name: string; shortName: string; leagueId: string; rating: number; form: string[] };
type Match = { id: string; leagueId: string; homeTeamId: string; awayTeamId: string; kickoff: string; venue: string };

const leagues: League[] = [
  { id: 'pl', name: 'Premier League', shortName: 'PL', country: 'England' },
  { id: 'laliga', name: 'La Liga', shortName: 'LL', country: 'Spain' },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'BL', country: 'Germany' },
  { id: 'seriea', name: 'Serie A', shortName: 'SA', country: 'Italy' },
  { id: 'ligue1', name: 'Ligue 1', shortName: 'L1', country: 'France' },
];

const teams: Team[] = [
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', leagueId: 'pl', rating: 1876, form: ['W', 'W', 'D', 'W', 'W'] },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', leagueId: 'pl', rating: 1859, form: ['W', 'W', 'W', 'L', 'W'] },
  { id: 'mancity', name: 'Manchester City', shortName: 'MCI', leagueId: 'pl', rating: 1838, form: ['D', 'W', 'W', 'W', 'D'] },
  { id: 'astonvilla', name: 'Aston Villa', shortName: 'AVL', leagueId: 'pl', rating: 1732, form: ['W', 'L', 'W', 'D', 'W'] },
  { id: 'realmadrid', name: 'Real Madrid', shortName: 'RMA', leagueId: 'laliga', rating: 1904, form: ['W', 'W', 'W', 'D', 'W'] },
  { id: 'barcelona', name: 'Barcelona', shortName: 'BAR', leagueId: 'laliga', rating: 1835, form: ['W', 'W', 'L', 'W', 'W'] },
  { id: 'atletico', name: 'Atlético Madrid', shortName: 'ATM', leagueId: 'laliga', rating: 1789, form: ['D', 'W', 'W', 'D', 'W'] },
  { id: 'bayern', name: 'Bayern Munich', shortName: 'BAY', leagueId: 'bundesliga', rating: 1861, form: ['W', 'W', 'W', 'W', 'L'] },
  { id: 'leverkusen', name: 'Bayer Leverkusen', shortName: 'LEV', leagueId: 'bundesliga', rating: 1819, form: ['W', 'D', 'W', 'W', 'W'] },
  { id: 'dortmund', name: 'Borussia Dortmund', shortName: 'BVB', leagueId: 'bundesliga', rating: 1718, form: ['L', 'W', 'W', 'D', 'L'] },
  { id: 'inter', name: 'Inter Milan', shortName: 'INT', leagueId: 'seriea', rating: 1848, form: ['W', 'W', 'D', 'W', 'W'] },
  { id: 'napoli', name: 'Napoli', shortName: 'NAP', leagueId: 'seriea', rating: 1773, form: ['W', 'D', 'W', 'W', 'D'] },
  { id: 'juventus', name: 'Juventus', shortName: 'JUV', leagueId: 'seriea', rating: 1742, form: ['D', 'W', 'L', 'W', 'W'] },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', leagueId: 'ligue1', rating: 1831, form: ['W', 'W', 'W', 'W', 'W'] },
  { id: 'monaco', name: 'AS Monaco', shortName: 'ASM', leagueId: 'ligue1', rating: 1698, form: ['W', 'L', 'W', 'D', 'W'] },
];

const matches: Match[] = [
  { id: 'm1', leagueId: 'pl', homeTeamId: 'arsenal', awayTeamId: 'astonvilla', kickoff: 'Sat 15 Mar · 12:30', venue: 'Emirates Stadium' },
  { id: 'm2', leagueId: 'pl', homeTeamId: 'mancity', awayTeamId: 'liverpool', kickoff: 'Sun 16 Mar · 16:30', venue: 'Etihad Stadium' },
  { id: 'm3', leagueId: 'laliga', homeTeamId: 'realmadrid', awayTeamId: 'atletico', kickoff: 'Sat 15 Mar · 20:00', venue: 'Santiago Bernabéu' },
  { id: 'm4', leagueId: 'laliga', homeTeamId: 'barcelona', awayTeamId: 'realmadrid', kickoff: 'Sun 16 Mar · 21:00', venue: 'Estadi Olímpic Lluís Companys' },
  { id: 'm5', leagueId: 'bundesliga', homeTeamId: 'bayern', awayTeamId: 'dortmund', kickoff: 'Sat 15 Mar · 18:30', venue: 'Allianz Arena' },
  { id: 'm6', leagueId: 'bundesliga', homeTeamId: 'leverkusen', awayTeamId: 'bayern', kickoff: 'Sun 16 Mar · 15:30', venue: 'BayArena' },
  { id: 'm7', leagueId: 'seriea', homeTeamId: 'inter', awayTeamId: 'juventus', kickoff: 'Sun 16 Mar · 20:45', venue: 'San Siro' },
  { id: 'm8', leagueId: 'seriea', homeTeamId: 'napoli', awayTeamId: 'inter', kickoff: 'Sat 15 Mar · 18:00', venue: 'Stadio Diego Armando Maradona' },
  { id: 'm9', leagueId: 'ligue1', homeTeamId: 'psg', awayTeamId: 'monaco', kickoff: 'Fri 14 Mar · 21:00', venue: 'Parc des Princes' },
  { id: 'm10', leagueId: 'ligue1', homeTeamId: 'monaco', awayTeamId: 'psg', kickoff: 'Sun 16 Mar · 17:05', venue: 'Stade Louis II' },
];

const teamById = Object.fromEntries(teams.map((team) => [team.id, team])) as Record<string, Team>;
const leagueById = Object.fromEntries(leagues.map((league) => [league.id, league])) as Record<string, League>;

function expectedScore(teamRating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - teamRating) / 400));
}

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

function MatchCard({ match, featured = false }: { match: Match; featured?: boolean }) {
  const home = teamById[match.homeTeamId];
  const away = teamById[match.awayTeamId];
  const homeProbability = Math.round(expectedScore(home.rating, away.rating) * 100);
  const awayProbability = 100 - homeProbability;
  const league = leagueById[match.leagueId];
  return (
    <article className={`group relative overflow-hidden border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.5)] hover:shadow-[var(--shadow-md)] ${featured ? 'rounded-xl' : 'rounded-lg'}`} data-testid={`fixture-card-${match.id}`}>
      {featured && <div className="absolute left-0 top-0 h-full w-1 bg-[hsl(var(--accent))]" />}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]" data-testid={`fixture-league-${match.id}`}>
          <span className="flex h-5 w-5 items-center justify-center rounded border border-[hsl(var(--border))] text-[9px] text-[hsl(var(--foreground))]">{league.shortName}</span>
          {league.name}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--muted-foreground))]" data-testid={`fixture-kickoff-${match.id}`}>
          <Clock3 className="h-3.5 w-3.5" /> {match.kickoff}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-center gap-3">
          <TeamMark team={home} compact={!featured} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-[15px]" data-testid={`fixture-home-team-${match.id}`}>{home.name}</p>
            <p className="mt-0.5 font-data text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`fixture-home-rating-${match.id}`}>{home.rating} ELO</p>
          </div>
        </div>
        <div className="text-center">
          <span className="font-display text-xl text-[hsl(var(--muted-foreground)/.7)]">v</span>
          <div className="mt-1 flex items-center justify-center gap-1 font-data text-[10px] text-[hsl(var(--muted-foreground))]"><MapPin className="h-3 w-3" /> {match.venue}</div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-[15px]" data-testid={`fixture-away-team-${match.id}`}>{away.name}</p>
            <p className="mt-0.5 font-data text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`fixture-away-rating-${match.id}`}>{away.rating} ELO</p>
          </div>
          <TeamMark team={away} compact={!featured} />
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.45)]">
        <div className="border-r border-[hsl(var(--border))] px-4 py-3 sm:px-6">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]"><span>Home win</span><span className="font-data text-xs text-[hsl(var(--foreground))]" data-testid={`probability-home-${match.id}`}>{homeProbability}%</span></div>
          <div className="h-1 overflow-hidden rounded-full bg-[hsl(var(--border))]"><div className="h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-500" style={{ width: `${homeProbability}%` }} /></div>
        </div>
        <div className="px-4 py-3 sm:px-6">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]"><span>Away win</span><span className="font-data text-xs text-[hsl(var(--foreground))]" data-testid={`probability-away-${match.id}`}>{awayProbability}%</span></div>
          <div className="h-1 overflow-hidden rounded-full bg-[hsl(var(--border))]"><div className="ml-auto h-full rounded-full bg-[hsl(var(--secondary-foreground))] transition-all duration-500" style={{ width: `${awayProbability}%` }} /></div>
        </div>
      </div>
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
        <p className="font-data text-sm font-medium" data-testid={`ranking-rating-${team.id}`}>{team.rating}</p>
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
            <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[hsl(var(--accent))]"><span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Matchday snapshot <span className="text-[hsl(var(--muted-foreground))]">/</span> 14 March 2025</div>
            <h1 className="max-w-3xl font-display text-5xl leading-[.96] tracking-[-.045em] sm:text-7xl lg:text-[88px]" data-testid="heading-dashboard">The weekend,<br /><span className="text-[hsl(var(--accent))]">reduced to a number.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">A clear-eyed read on the games ahead. Elo ratings turn recent results, opponent quality, and home advantage into one honest signal.</p>
          </div>
          <div className="animate-rise-in rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-5 [animation-delay:120ms] sm:p-6" data-testid="card-model-status">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4"><div className="flex items-center gap-2 text-xs font-semibold"><Radio className="h-3.5 w-3.5 text-[hsl(var(--accent))]" /> Model status</div><span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-1 font-data text-[9px] font-medium uppercase tracking-[.12em] text-[hsl(var(--secondary-foreground))]" data-testid="status-model-live">Live</span></div>
            <div className="grid grid-cols-2 gap-4 pt-5"><div><p className="font-data text-3xl tracking-[-.06em]" data-testid="text-team-count">15</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">teams indexed</p></div><div><p className="font-data text-3xl tracking-[-.06em]" data-testid="text-fixture-count">10</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">fixtures ahead</p></div></div>
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
            <div className="mb-5 flex items-end justify-between"><div><p className="mb-2 font-data text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Next up</p><h2 className="font-display text-3xl tracking-[-.035em] sm:text-4xl">Fixtures to watch</h2></div><div className="hidden items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex"><CalendarDays className="h-3.5 w-3.5" /> 14–16 March</div></div>
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
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]" data-testid="ranking-note"><LineChart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" /> Form dots show the last five results. The rating is the longer view.</div>
          </aside>
        </div>

        <section id="methodology" className="mt-20 scroll-mt-8 border-t border-[hsl(var(--border))] pt-8 sm:mt-28 sm:pt-10" data-testid="section-methodology">
          <div className="grid gap-8 sm:grid-cols-[1fr_2fr] sm:items-start"><div><p className="mb-2 font-data text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Under the hood</p><h2 className="font-display text-3xl tracking-[-.03em]">A simple model.<br />A useful signal.</h2></div><div className="grid gap-6 sm:grid-cols-2"><div><Shield className="mb-3 h-5 w-5 text-[hsl(var(--accent))]" /><h3 className="text-sm font-semibold">Elo, without the fog</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Every team starts with a rating that moves with results and the quality of the opposition. Higher is stronger. It is deliberately legible.</p></div><div><Sparkles className="mb-3 h-5 w-5 text-[hsl(var(--accent))]" /><h3 className="text-sm font-semibold">Probability, not prophecy</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Match percentages use the standard expected-score formula. They help frame the game; they do not pretend to know its ending.</p></div></div></div>
        </section>
      </main>
      <footer className="border-t border-[hsl(var(--border))]"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span className="font-display text-lg text-[hsl(var(--foreground))]">footy<span className="text-[hsl(var(--accent))]">elo</span></span><span data-testid="text-footer-update">Built for the curious fan · Model snapshot 14 Mar 2025</span><a href="#methodology" className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))]" data-testid="link-footer-methodology">How it works <ArrowUpRight className="h-3.5 w-3.5" /></a></div></footer>
    </div>
  );
}

export default function App() {
  return <Home />;
}
