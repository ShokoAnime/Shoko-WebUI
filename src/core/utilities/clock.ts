import { dayjs, isDebug } from '@/core/util';

const unitMilliseconds: Record<string, number> = { d: 86_400_000, h: 3_600_000, m: 60_000, s: 1_000 };

/** A signed offset like `-90m`, `+2h` or `-1d6h`, in milliseconds; `null` when it is none. Unsigned counts forward. */
export const parseClockOffset = (value: string | null) => {
  const match = /^([+-]?)((?:\d+[dhms])+)$/i.exec(value?.trim() ?? '');
  if (!match) return null;
  const total = [...match[2].matchAll(/(\d+)([dhms])/gi)]
    .reduce((sum, [, amount, unit]) => sum + Number(amount) * unitMilliseconds[unit.toLowerCase()], 0);
  return match[1] === '-' ? -total : total;
};

/** An offset to the minute, eg. `−1h30m` or `+2d`. */
export const formatClockOffset = (offset: number) => {
  const minutes = Math.round(Math.abs(offset) / 60_000);
  const parts = [
    { value: Math.floor(minutes / 1440), unit: 'd' },
    { value: Math.floor((minutes % 1440) / 60), unit: 'h' },
    { value: minutes % 60, unit: 'm' },
  ].filter(part => part.value > 0);
  return `${offset < 0 ? '−' : '+'}${parts.map(part => `${part.value}${part.unit}`).join('') || '0m'}`;
};

/** The `clockOffset` URL parameter, which shifts the airing schedule's clock in debug builds only. */
export const getClockOffset = (
  searchParams: URLSearchParams,
) => (isDebug() ? parseClockOffset(searchParams.get('clockOffset')) : null);

/** The time now, as the airing schedule reads it: shifted by the clock offset, when there is one. */
export const getNow = (time = Date.now(), offset: number | null = null) => dayjs(time + (offset ?? 0));

/** The `at` parameter of the reads that count from now: the shifted time, sent only while the clock is shifted. */
export const getAtParam = (
  offset: number | null,
) => (offset === null ? undefined : getNow(Date.now(), offset).toISOString());
