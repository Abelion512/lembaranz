export const formatRetryMinutes = (resetAt?: number, now = Date.now()): number => {
  const remainingMs = (resetAt || 0) - now;
  if (remainingMs <= 0) return 1;
  return Math.ceil(remainingMs / 60000);
};

export const formatRemainingUnlockAttempts = (remaining?: number): string => {
  if (remaining === undefined) return 'locked';
  return `${remaining} attempt(s) left`;
};
