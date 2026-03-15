import { Router } from 'express';
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from '../validation/matches';
import { getMatchStatus } from '../utils/match-status';
import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { string } from 'zod';

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      errors: 'Invalid query parameters',
      details: JSON.stringify(parsed.error),
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
    res.json({ data });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch matches',
    });
  }
});

matchRouter.post('/', async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsed;
  if (!parsed.success) {
    return res.status(400).json({
      errors: 'Invalid payload',
      details: JSON.stringify(parsed.error),
    });
  }
  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();
    res.status(201).json({ data: event });
  } catch (error) {
    return res.status(500).json({
      errors: 'Failed to creatre match',
      details: JSON.stringify(error),
    });
  }
  const matchData = parsed.data;
  res
    .status(201)
    .json({ message: 'Match created successfully', match: matchData });
});
