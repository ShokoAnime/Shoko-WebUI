import { isAxiosError } from 'axios';
import { toNumber } from 'lodash';

import queryClient from '@/core/react-query/queryClient';

export type AnilistUnavailableStateType = {
  /**
   * `503` when the AniList rate limiter is paused, `502` when the upstream
   * request failed mid-flight.
   */
  status: 502 | 503;

  /**
   * Seconds until the request can be retried, from the `Retry-After`
   * header, if present.
   */
  retryAfter: number | null;
};

/**
 * Detects the "AniList is temporarily unavailable" responses returned by
 * endpoints that talk to AniList directly.
 */
export const getAnilistUnavailableState = (error: unknown): AnilistUnavailableStateType | undefined => {
  if (!isAxiosError(error)) return undefined;
  const status = error.response?.status;
  if (status !== 502 && status !== 503) return undefined;

  const retryAfterHeader = (error.response?.headers as Record<string, unknown> | undefined)?.['retry-after'];
  const retryAfter = toNumber(retryAfterHeader);

  return {
    status,
    retryAfter: Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter) : null,
  };
};

export const getAnilistUnavailableMessage = (state: AnilistUnavailableStateType) => {
  if (state.retryAfter) return `AniList is temporarily unavailable, try again in ${state.retryAfter} seconds.`;
  return 'AniList is temporarily unavailable, try again later.';
};

/**
 * Retry policy for queries that talk to AniList directly. The server already
 * tells us when to retry through `Retry-After`, so we don't retry those
 * responses ourselves; everything else falls through to the default policy.
 */
export const retryUnlessAnilistUnavailable = (failureCount: number, error: Error) => {
  if (getAnilistUnavailableState(error)) return false;
  const defaultRetry = queryClient.getDefaultOptions().queries?.retry;
  return typeof defaultRetry === 'function' ? defaultRetry(failureCount, error) : false;
};
