import { useSyncExternalStore } from 'react';
import { useSearchParams } from 'react-router';

import { getClockOffset, getNow } from '@/core/utilities/clock';

// The countdowns are in minutes, so the clock moves on twice a minute.
const tickInterval = 30_000;

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let tickedAt = Date.now();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  timer ??= setInterval(() => {
    tickedAt = Date.now();
    listeners.forEach(notify => notify());
  }, tickInterval);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    clearInterval(timer);
    timer = undefined;
  };
};

// While nothing listens the clock stands still, so the first reader after a while moves it on.
const getSnapshot = () => {
  if (!timer && Date.now() - tickedAt >= tickInterval) tickedAt = Date.now();
  return tickedAt;
};

/** The clock offset from the URL in debug builds, else `null`. */
export const useClockOffset = () => {
  const [searchParams] = useSearchParams();
  return getClockOffset(searchParams);
};

/**
 * The airing schedule's clock: one time for every countdown, on-air mark and default period, moving on every 30
 * seconds together, and shifted by the clock offset in debug builds.
 */
const useNow = () => {
  const time = useSyncExternalStore(subscribe, getSnapshot);
  const offset = useClockOffset();
  return getNow(time, offset);
};

export default useNow;
