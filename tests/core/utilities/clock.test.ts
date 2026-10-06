import { describe, expect, it, vi } from 'vitest';

import { formatClockOffset, parseClockOffset } from '@/core/utilities/clock';

// The shared module reads the document, which the node environment lacks; only its dayjs is needed.
vi.mock('@/core/util', async () => {
  const { default: mockDayjs } = await import('dayjs');
  return { dayjs: mockDayjs, isDebug: () => true };
});

describe('parseClockOffset', () => {
  it('reads signed days, hours, minutes and seconds', () => {
    expect(parseClockOffset('-90m')).toBe(-90 * 60_000);
    expect(parseClockOffset('+2h')).toBe(2 * 3_600_000);
    expect(parseClockOffset('-1d6h')).toBe(-30 * 3_600_000);
    expect(parseClockOffset('1h30s')).toBe(3_630_000);
  });

  // A `+` in a query string arrives as a space.
  it('counts forward without a sign', () => {
    expect(parseClockOffset(' 2h')).toBe(2 * 3_600_000);
  });

  it('refuses anything else', () => {
    for (const value of [null, '', '-', '90', '2x', '1h-30m', 'h']) expect(parseClockOffset(value)).toBeNull();
  });
});

describe('formatClockOffset', () => {
  it('shows the offset to the minute', () => {
    expect(formatClockOffset(-90 * 60_000)).toBe('−1h30m');
    expect(formatClockOffset(30 * 3_600_000)).toBe('+1d6h');
  });
});
