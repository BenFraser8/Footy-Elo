import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, CalendarDays, ChevronDown, Clock3, Info, LineChart, MapPin, Menu, Radio, Shield, SlidersHorizontal, Sparkles, Trophy, X } from 'lucide-react';
import type { Team, Player, Match } from './data/demo';

// Replace hardcoded arrays with fetch to /api; keep fallback to local demo data for offline dev

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Fetch failed for ${url}, using fallback:`, err);
    return fallback;
  }
}

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const [t, p, m] = await Promise.all([
        fetchJson('/api/teams', (await import('./data/demo')).teams),
        fetchJson('/api/players', (await import('./data/demo')).players),
        fetchJson('/api/matches', (await import('./data/demo')).matches),
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

  if (loading) return <div className="p-8">Loading demo data…</div>;

  return (
    <div className="p-6">
      <h1>Footy Elo — fetched demo data</h1>
      <section>
        <h2>Teams ({teams.length})</h2>
        <ul>
          {teams.slice(0, 10).map((t) => <li key={t.id}>{t.name} — {t.startingRating}</li>)}
        </ul>
      </section>
      <section>
        <h2>Players ({players.length})</h2>
        <ul>
          {players.map((p) => <li key={p.id}>{p.name} — {p.goals} goals</li>)}
        </ul>
      </section>
      <section>
        <h2>Matches ({matches.length})</h2>
        <ul>
          {matches.map((m) => <li key={m.id}>{m.homeTeamId} vs {m.awayTeamId} — {m.kickoff}</li>)}
        </ul>
      </section>
    </div>
  );
}
