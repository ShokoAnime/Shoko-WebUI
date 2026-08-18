import { groupBy, mapValues } from 'lodash';

import type { EpisodeCoverageType } from '@/core/types/api/release-management';
import type { ReleaseSignalTypeValues } from '@/core/types/api/settings';

const episodePriority: string[] = ['Episode', 'Special', 'Trailer', 'Credits', 'Parody', 'Other', 'Unknown'];

export const typeOrder: Record<string, number> = Object.fromEntries(
  episodePriority.map((type, idx) => [type, idx]),
);

export const signalLabels: Record<ReleaseSignalTypeValues, string> = {
  AudioCodec: 'Audio Codec',
  AudioLanguage: 'Audio Language',
  AudioStreams: 'Audio Streams',
  BitDepth: 'Bit Depth',
  Censored: 'Censored',
  Chaptered: 'Chaptered',
  Corrupted: 'Corrupted',
  Creditless: 'Creditless',
  GroupHomogeneity: 'Group Consistency',
  Resolution: 'Resolution',
  Source: 'Source',
  SubGroup: 'Sub Group',
  SubtitleLanguage: 'Subtitle Language',
  SubtitleStreams: 'Subtitle Streams',
  Version: 'Version',
  VideoCodec: 'Video Codec',
};

export const typeDisplayNameMap: Record<string, string> = {
  Episode: 'Episodes',
  Special: 'Specials',
  Trailer: 'Trailers',
  Credits: 'Credits',
  Parody: 'Parodies',
  Other: 'Others',
};

const collapseToRanges = (numbers: number[]): string => {
  const ranges: string[] = [];
  let rangeStart = numbers[0];
  let rangeEnd = numbers[0];

  for (let idx = 1; idx < numbers.length; idx += 1) {
    if (numbers[idx] === rangeEnd + 1) {
      rangeEnd = numbers[idx];
    } else {
      ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
      rangeStart = numbers[idx];
      rangeEnd = numbers[idx];
    }
  }
  ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
  return ranges.join(', ');
};

export const buildEpisodeCoverageString = (episodes: EpisodeCoverageType[]): string => {
  if (episodes.length === 0) return '';

  const episodesByType = groupBy(episodes, 'Type');
  const episodeNumbersByType = mapValues(episodesByType, eps => eps.map(episode => episode.Number));

  const sortedTypes = episodePriority.filter(type => type in episodeNumbersByType);

  return sortedTypes
    .map(type => `${typeDisplayNameMap[type] ?? type}: ${collapseToRanges(episodeNumbersByType[type])}`)
    .join(', ');
};
