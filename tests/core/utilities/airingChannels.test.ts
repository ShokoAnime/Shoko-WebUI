import { describe, expect, it } from 'vitest';

import { findDuplicateChannels, getChannelNameKey, matchesChannelSearch } from '@/core/utilities/airingChannels';

describe('matchesChannelSearch', () => {
  it('matches a name or an alias by part, ignoring case', () => {
    expect(matchesChannelSearch('mx', ['Tokyo MX'], 'JP')).toBe(true);
    expect(matchesChannelSearch('metro', ['Tokyo MX', 'Tokyo Metropolitan Television'], null)).toBe(true);
  });

  it('matches the country code only as a whole', () => {
    expect(matchesChannelSearch('jp', ['BS11'], 'JP')).toBe(true);
    expect(matchesChannelSearch('j', ['BS11'], 'JP')).toBe(false);
    expect(matchesChannelSearch('jp', ['Crunchyroll'], null)).toBe(false);
  });
});

const makeChannel = (
  Name: string,
  CountryCode: string | null = null,
  Type = 'Television',
  CreatedAt = '2026-09-01',
) => ({
  Name,
  Type,
  CountryCode,
  CreatedAt,
});

describe('getChannelNameKey', () => {
  it('reads width, case, spaces and punctuation as one, but keeps a plus', () => {
    expect(getChannelNameKey('ＴＯＫＹＯ　ＭＸ')).toBe(getChannelNameKey('Tokyo-MX'));
    expect(getChannelNameKey('Disney+')).not.toBe(getChannelNameKey('Disney'));
  });
});

describe('findDuplicateChannels', () => {
  it('groups the same name and type, oldest first', () => {
    const older = makeChannel('TOKYO MX', 'JP', 'Television', '2026-01-01');
    const newer = makeChannel('Tokyo MX', null, 'Television', '2026-02-01');
    expect(findDuplicateChannels([newer, older, makeChannel('BS11')])).toEqual([[older, newer]]);
  });

  it('keeps apart other types, other countries and names of punctuation alone', () => {
    expect(findDuplicateChannels([makeChannel('ABEMA'), makeChannel('ABEMA', null, 'Streaming')])).toEqual([]);
    expect(findDuplicateChannels([makeChannel('Netflix', 'JP'), makeChannel('netflix', 'US')])).toEqual([]);
    expect(findDuplicateChannels([makeChannel('???'), makeChannel('!!')])).toEqual([]);
  });
});
