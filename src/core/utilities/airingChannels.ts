import { sortBy } from 'lodash';

/**
 * Whether a channel matches a search: by one of its names, or by its country code as a whole. `query` is trimmed and
 * lower-cased, and an empty one matches every channel.
 */
export const matchesChannelSearch = (query: string, names: string[], countryCode: string | null) =>
  query === ''
  || names.some(name => name.toLowerCase().includes(query))
  || countryCode?.toLowerCase() === query;

/**
 * A channel name reduced for comparing: NFKC, lower-cased, and only its letters, digits and `+` kept, so `TOKYO MX`,
 * `Tokyo-MX` and full-width `ＴＯＫＹＯ ＭＸ` read the same while `Disney+` stays apart from `Disney`.
 */
export const getChannelNameKey = (name: string) =>
  name.normalize('NFKC').toLowerCase().replaceAll(/[^\p{L}\p{N}+]/gu, '');

/** The parts of a channel the duplicate check reads. */
type DuplicateCandidate = {
  Name: string;
  Type: string;
  CountryCode: string | null;
  CreatedAt: string;
};

/**
 * The channels that look like one: the same type and the same name once reduced by `getChannelNameKey`. Each group is
 * oldest first, the one a merge keeps, and a group whose members name different countries is left out. Groups are
 * ordered by their first channel's name.
 */
export const findDuplicateChannels = <TChannel extends DuplicateCandidate>(channels: TChannel[]): TChannel[][] => {
  const groups = new Map<string, TChannel[]>();
  for (const channel of channels) {
    const nameKey = getChannelNameKey(channel.Name);
    // A name of only punctuation says nothing about which channel it is.
    if (nameKey) {
      const key = `${channel.Type}\n${nameKey}`;
      groups.set(key, [...(groups.get(key) ?? []), channel]);
    }
  }
  return [...groups.values()]
    .filter(group => group.length > 1)
    .filter(group => new Set(group.map(channel => channel.CountryCode?.toUpperCase()).filter(Boolean)).size <= 1)
    .map(group => sortBy(group, ['CreatedAt', 'Name']))
    .toSorted((left, right) => left[0].Name.localeCompare(right[0].Name));
};
