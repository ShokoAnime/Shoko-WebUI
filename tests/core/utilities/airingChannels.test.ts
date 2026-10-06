import { describe, expect, it } from 'vitest';

import { matchesChannelSearch } from '@/core/utilities/airingChannels';

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
