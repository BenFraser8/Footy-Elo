import { Router } from "express";

const router = Router();

const teams = [
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
  // additional teams (truncated for brevity)
  { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', league: 'Premier League', leagueId: 'pl', startingRating: 1485, isCore: false },
  { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'TOT', league: 'Premier League', leagueId: 'pl', startingRating: 1475, isCore: false },
  { id: 'ajax', name: 'Ajax', shortName: 'AJA', league: 'Other', leagueId: 'other', startingRating: 1450, isCore: false },
];

router.get('/', (_req, res) => {
  res.json(teams);
});

export default router;
