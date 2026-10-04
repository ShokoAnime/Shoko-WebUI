import { describe, expect, it, vi } from 'vitest';

import { formatDate } from '@/core/util';

// `@/core/util` reads the root font size at module scope (`pxPerRem`); stub the DOM
// APIs it touches so the import succeeds in the node test environment.
vi.hoisted(() => {
  vi.stubGlobal('document', { documentElement: {} });
  vi.stubGlobal('getComputedStyle', () => ({ fontSize: '16px' }));
});

describe('formatDate', () => {
  describe('full dates and timestamps (10+ chars)', () => {
    it('renders with the default day format', () => {
      expect(formatDate('2027-03-05')).toBe('Mar 05, 2027');
    });

    it('honors an explicit day format', () => {
      expect(formatDate('2027-03-05', 'YYYY-MM-DD')).toBe('2027-03-05');
    });

    it('honors an explicit day format for timestamps', () => {
      expect(formatDate('2027-03-05 14:30:00', 'YYYY-MM-DD HH:mm')).toBe('2027-03-05 14:30');
    });
  });

  describe('partial AniDB dates', () => {
    it('renders a year-only date as the year', () => {
      expect(formatDate('2027')).toBe('2027');
    });

    it('renders a year-month date as month and year', () => {
      expect(formatDate('2027-03')).toBe('Mar 2027');
    });

    it('ignores the day format for year-only dates', () => {
      expect(formatDate('2027', 'DD/MM/YYYY')).toBe('2027');
    });

    it('ignores the day format for year-month dates', () => {
      expect(formatDate('2027-03', 'YYYY')).toBe('Mar 2027');
    });

    it('treats non-conforming short strings as full dates', () => {
      // The server emits exactly 4, 7 or 10 chars, so a 6-char string falls to the day
      // branch and keeps its day instead of being silently truncated to a month.
      expect(formatDate('3/5/27')).toBe('Mar 05, 2027');
    });
  });

  describe('invalid and missing input', () => {
    it('returns an empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('returns an empty string for undefined', () => {
      // dayjs(undefined) resolves to "now" - the falsy guard must catch it first.
      expect(formatDate(undefined)).toBe('');
    });

    it('returns an empty string for the empty string', () => {
      expect(formatDate('')).toBe('');
    });

    it('returns an empty string for unparseable input', () => {
      expect(formatDate('garbage')).toBe('');
    });
  });
});
