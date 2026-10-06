import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';

import {
  formatDayCountdown,
  getAgendaRows,
  getCalendarPeriod,
  getSlideDirection,
  isAiringNow,
} from '@/core/utilities/airingSchedule';

import type { EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { CalendarEntryType } from '@/core/utilities/airingSchedule';

// The shared module reads the document, which the node environment lacks; only its dayjs is needed.
vi.mock('@/core/util', async () => {
  const { default: mockDayjs } = await import('dayjs');
  return { dayjs: mockDayjs };
});

describe('formatDayCountdown', () => {
  it('counts whole days', () => {
    const now = dayjs('2026-10-05T23:00');
    expect(formatDayCountdown(dayjs('2026-10-05'), now)).toBe('Today');
    expect(formatDayCountdown(dayjs('2026-10-06'), now)).toBe('Tomorrow');
    expect(formatDayCountdown(dayjs('2026-10-09'), now)).toBe('4 days');
  });
});

describe('getSlideDirection', () => {
  const week = (order: number, text: string) => ({ order, resetKey: 'week', text });

  it('slides in the direction of travel', () => {
    expect(getSlideDirection(week(1, 'A'), week(5, 'B'))).toBe('forward');
    expect(getSlideDirection(week(5, 'B'), week(1, 'A'))).toBe('backward');
  });

  it('swaps on a view switch or an unchanged text', () => {
    expect(getSlideDirection(week(1, 'A'), { order: 5, resetKey: 'month', text: 'B' })).toBeNull();
    expect(getSlideDirection(week(1, 'A'), week(5, 'A'))).toBeNull();
  });
});

describe('getCalendarPeriod', () => {
  it('shows six weeks for every month, from the week of its first day', () => {
    // February 2026 starts on a Sunday and fits in four weeks; June 2026 starts on a Monday.
    for (const [date, start] of [['2026-02-14', '2026-01-26'], ['2026-06-30', '2026-06-01']]) {
      const period = getCalendarPeriod('month', dayjs(date));
      expect(period.start.format('YYYY-MM-DD')).toBe(start);
      expect(period.end.diff(period.start, 'day')).toBe(42);
    }
  });
});

describe('getAgendaRows', () => {
  const entry = (id: string) => ({ airing: { ID: id } as EpisodeAiringType }) as CalendarEntryType;

  it('lists the days in the map in order, each heading its entries, striping and ending each day', () => {
    const entries = new Map([
      ['2026-10-03', [entry('3')]],
      ['2026-10-01', [entry('1'), entry('2'), entry('4')]],
      ['2026-10-02', []],
    ]);
    const rows = getAgendaRows(dayjs('2026-10-01'), dayjs('2026-10-05'), entries);
    expect(rows.map(row => [row.key, row.type === 'entry' && row.isStriped, row.isDayEnd])).toEqual([
      ['2026-10-01', false, false],
      ['2026-10-01-1', false, false],
      ['2026-10-01-2', true, false],
      ['2026-10-01-4', false, true],
      ['2026-10-02', false, true],
      ['2026-10-03', false, false],
      ['2026-10-03-3', false, true],
    ]);
  });
});

describe('isAiringNow', () => {
  const airing = { AiredAt: '2026-10-06T12:00:00Z', EndsAt: '2026-10-06T12:30:00Z' } as EpisodeAiringType;

  it('is on air from its start until, not at, its end', () => {
    expect(isAiringNow(airing, dayjs('2026-10-06T11:59:59Z'))).toBe(false);
    expect(isAiringNow(airing, dayjs('2026-10-06T12:00:00Z'))).toBe(true);
    expect(isAiringNow(airing, dayjs('2026-10-06T12:29:59Z'))).toBe(true);
    expect(isAiringNow(airing, dayjs('2026-10-06T12:30:00Z'))).toBe(false);
  });

  it('never is without an end', () => {
    expect(isAiringNow({ ...airing, EndsAt: null }, dayjs('2026-10-06T12:10:00Z'))).toBe(false);
  });
});
