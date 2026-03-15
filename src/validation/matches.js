import { z } from 'zod';

// Match status constant
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Schema for listing matches (optional limit)
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Schema for match ID param
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ISO date validation helper
const isISODate = (val) => {
  if (typeof val !== 'string') return false;
  const date = new Date(val);
  return !isNaN(date.getTime()) && val === date.toISOString();
};

// Schema for creating a match
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'Sport is required'),
    homeTeam: z.string().min(1, 'Home team is required'),
    awayTeam: z.string().min(1, 'Away team is required'),
    startTime: z.string().refine(isISODate, {
      message: 'startTime must be a valid ISO date string',
    }),
    endTime: z.string().refine(isISODate, {
      message: 'endTime must be a valid ISO date string',
    }),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (start >= end) {
      ctx.addIssue({
        path: ['endTime'],
        code: z.ZodIssueCode.custom,
        message: 'endTime must be after startTime',
      });
    }
  });

// Schema for updating scores
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});
