import React, { useEffect, useMemo, useState } from 'react';
import type { Team, Player, Match } from './data/demo';

type Competition =
  | 'premier_league'
  | 'bundesliga'
  | 'la_liga'
  | 'serie_a'
  | 'ligue_1'
  | 'championship'
  | 'bundesliga_2'
  | 'champions_league'
  | 'friendly';

const K_FACTORS: Record<Competition, number> = {
  champions_league: 35,
  premier_league: 30,
  bundesliga: 30,
  bundesliga_2: 18,
  la_liga: 15,
  serie_a: 15,
  ligue_1: 10,
  championship: 18,
  friendly: 8,
};

function expectedScore(teamRating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - teamRating) / 400));
}

function applyPlayedResults(seeds: Team[], fixtures: Match[], competitionFilter?: Competition) {
  // Initialize ratings from seeds
  const ratings = Object.fromEntries(seeds.map((team) => [team.id, team.startingRating])) as Record<string, number>;

  const relevant = competitionFilter ? fixtures.filter((m) => m.competition === competitionFilter) : fixtures;

  const updatedMatches = [...relevant]
    .filter((m) => m.played && m.homeScore !== undefined && m.awayScore !== undefined)
    .sort((a, b) => a.kickoffDate.localeCompare(b.kickoffDate))
    .map((match) => {
      const homeRatingAtKickoff = ratings[match.homeTeamId] ?? 1500;
      const awayRatingAtKickoff = ratings[match.awayTeamId] ?? 1500;
      const homeExpected = expectedScore(homeRatingAtKickoff, awayRatingAtKickoff);
      const homeResult = match.homeScore === match.awayScore ? 0.5 : match.homeScore! > match.awayScore! ? 1 : 0;
      const k = K_FACTORS[match.competition as Competition] ?? 10;
      const homeEloChange = k * (homeResult - homeExpected);
      ratings[match.homeTeamId] = (ratings[match.homeTeamId] ?? 1500) + homeEloChange;
      ratings[match.awayTeamId] = (ratings[match.awayTeamId] ?? 1500) - homeEloChange;

      return {
        ...match,
        homeRatingAtKickoff,
        awayRatingAtKickoff,
        homeEloChange,
        awayEloChange: -homeEloChange,
      } as Match & { homeRatingAtKickoff: number; awayRatingAtKickoff: number; homeEloChange: number; awayEloChange: number };
    });

  const teams = seeds.map((team) => ({ ...team, rating: Math.round(ratings[team.id] ?? team.startingRating) }));

  return { teams, matches: updatedMatches };
}

// Map UI leagueId -> competition value for domestic leagues
const LEAGUE_COMPETITION_BY_ID: Record<string, Competition> = {
  pl: 'premier_league',
  bundesliga: 'bundesliga',
  laliga: 'la_liga',
  seriea: 'serie_a',
  ligue1: 'ligue_1',
};

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'league' | Competition>('league');
  const [selectedLeague, setSelectedLeague] = useState('pl');

  useEffect(() => {
    let mounted = true;
    async function fetchJson<T>(url: string, fallback: T): Promise<T> {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as T;
      } catch (err) {
        // fallback imported demo data
        // eslint-disable-next-line no-console
        console.warn('fetch failed', url, err);
        return fallback;
      }
    }

    async function load() {
      setLoading(true);
      const demo = await import('./data/demo');
      const [t, p, m] = await Promise.all([
        fetchJson('/api/teams', demo.teams),
        fetchJson('/api/players', demo.players),
        fetchJson('/api/matches', demo.matches),
      ]);
      if (!mounted) return;
      setTeams(t);
      setPlayers(p);
      setMatches(m);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const competitionOptions: Competition[] = ['premier_league', 'bundesliga', 'la_liga', 'serie_a', 'ligue_1'];
  const extraCompetitionTabs: Competition[] = ['friendly', 'champions_league', 'championship', 'bundesliga_2'];

  const selectedCompetition: Competition | undefined = useMemo(() => {
    if (view === 'league') return LEAGUE_COMPETITION_BY_ID[selectedLeague];
    return view as Competition;
  }, [view, selectedLeague]);

  const { teams: computedTeams, matches: computedMatches } = useMemo(() => {
    if (selectedCompetition) return applyPlayedResults(teams, matches, selectedCompetition);
    return applyPlayedResults(teams, matches);
  }, [teams, matches, selectedCompetition]);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Footy Elo — Standings by Competition</h1>
      </header>

      <nav className="mb-4 flex gap-2">
        <button onClick={() => setView('league')} className={`px-3 py-1 rounded ${view === 'league' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>League (domestic)</button>
        {extraCompetitionTabs.map((c) => (
          <button key={c} onClick={() => setView(c)} className={`px-3 py-1 rounded ${view === c ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{c.replace(/_/g, ' ')}</button>
        ))}
      </nav>

      {view === 'league' && (
        <div className="mb-4">
          <label className="mr-2">Select league:</label>
          <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
            <option value="pl">Premier League</option>
            <option value="laliga">La Liga</option>
            <option value="bundesliga">Bundesliga</option>
            <option value="seriea">Serie A</option>
            <option value="ligue1">Ligue 1</option>
          </select>
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Top 20 · {selectedCompetition ?? 'overall'}</h2>
        <div className="mt-3 grid gap-2">
          {computedTeams
            .slice()
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 20)
            .map((team, idx) => (
              <div key={team.id} className="p-2 border rounded flex justify-between">
                <div>
                  <div className="font-semibold">{idx + 1}. {team.name}</div>
                  <div className="text-sm text-gray-500">{team.league}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg">{team.rating}</div>
                  <div className="text-sm text-gray-500">ELO</div>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Matches ({computedMatches.length})</h2>
        <ul className="mt-3 space-y-2">
          {computedMatches.map((m) => (
            <li key={m.id} className="p-2 border rounded">
              <div className="flex justify-between">
                <div>{m.homeTeamId} vs {m.awayTeamId}</div>
                <div className="text-sm text-gray-500">{m.kickoff} • {m.competition}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
