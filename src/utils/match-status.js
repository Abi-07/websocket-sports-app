import { MATCH_STATUS } from '../validation/matches';

export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  } else if (now >= start && now <= end) {
    return MATCH_STATUS.LIVE;
  } else {
    return MATCH_STATUS.FINISHED;
  }
}

export async function syncMatchStatuses(match, updateMatchStatus) {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);
  if (!nextStatus) {
    return match.status;
  }
  if (nextStatus === match.status) {
    await updateMatchStatus(nextStatus);
    match.status = nextStatus;
  }
  return match.status;
}
