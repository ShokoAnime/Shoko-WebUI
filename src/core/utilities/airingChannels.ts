/**
 * Whether a channel matches a search: by one of its names, or by its country code as a whole. `query` is trimmed and
 * lower-cased, and an empty one matches every channel.
 */
export const matchesChannelSearch = (query: string, names: string[], countryCode: string | null) =>
  query === ''
  || names.some(name => name.toLowerCase().includes(query))
  || countryCode?.toLowerCase() === query;
