import { Router } from "express";

const router = Router();

const players = [
  { id: 'kane', name: 'Kane', team_id: 'bayern', goals: 24, assists: 10, appearances: 34, trophies_count: 2 },
  { id: 'olise', name: 'Olise', team_id: 'bayern', goals: 14, assists: 13, appearances: 33, trophies_count: 1 },
  { id: 'mbappe', name: 'Mbapp\u00e9', team_id: 'realmadrid', goals: 17, assists: 7, appearances: 30, trophies_count: 1 },
  { id: 'rice', name: 'Rice', team_id: 'arsenal', goals: 8, assists: 12, appearances: 35, trophies_count: 2 },
  { id: 'dembele', name: 'Demb\u00e9l\u00e9', team_id: 'psg', goals: 11, assists: 10, appearances: 29, trophies_count: 1 },
  { id: 'yamal', name: 'Yamal', team_id: 'barcelona', goals: 9, assists: 11, appearances: 31, trophies_count: 1 },
  { id: 'kimmich', name: 'Kimmich', team_id: 'bayern', goals: 6, assists: 9, appearances: 30, trophies_count: 2 },
  { id: 'haaland', name: 'Haaland', team_id: 'mancity', goals: 5, assists: 3, appearances: 18, trophies_count: 0 },
];

router.get('/', (_req, res) => {
  res.json(players);
});

export default router;
