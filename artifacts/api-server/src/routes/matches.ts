import { Router } from "express";

const router = Router();

const matches = [
  { id: 'm1', leagueId: 'laliga', homeTeamId: 'barcelona', awayTeamId: 'nottingham', kickoff: 'Sat 8 Aug 2026', kickoffDate: '2026-08-08', venue: 'Udine', competition: 'friendly', played: true, homeScore: 3, awayScore: 1 },
  { id: 'm2', leagueId: 'ligue1', homeTeamId: 'manutd', awayTeamId: 'psg', kickoff: 'Sat 8 Aug 2026', kickoffDate: '2026-08-08', venue: 'Gothenburg', competition: 'friendly', played: true, homeScore: 2, awayScore: 2 },
  { id: 'm3', leagueId: 'bundesliga', homeTeamId: 'arsenal', awayTeamId: 'dortmund', kickoff: 'Sun 9 Aug 2026', kickoffDate: '2026-08-09', venue: 'Emirates Stadium', competition: 'friendly', played: true, homeScore: 1, awayScore: 2 },
  { id: 'm4', leagueId: 'ligue1', homeTeamId: 'liverpool', awayTeamId: 'monaco', kickoff: 'Sun 9 Aug 2026', kickoffDate: '2026-08-09', venue: 'Anfield', competition: 'friendly', played: true, homeScore: 0, awayScore: 1 },
  { id: 'm5', leagueId: 'pl', homeTeamId: 'arsenal', awayTeamId: 'mancity', kickoff: 'Sun 16 Aug 2026', kickoffDate: '2026-08-16', venue: 'Cardiff', competition: 'friendly', played: false },
  { id: 'm6', leagueId: 'laliga', homeTeamId: 'realmadrid', awayTeamId: 'fiorentina', kickoff: 'August 2026', kickoffDate: '2026-08-31', venue: 'TBA', competition: 'friendly', played: false },
];

router.get('/', (_req, res) => {
  res.json(matches);
});

export default router;
