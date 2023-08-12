import { reduce } from 'lodash';

import { EpisodeTypeEnum } from '@/core/types/api/episode';

import PathMatchRuleSet from './auto-match-regexes';

export interface PathDetails {
  filePath: string;
  fileExtension: string | null;
  releaseGroup: string | null;
  crc32: string | null;
  showName: string | null;
  season: number | null;
  episodeStart: number;
  episodeEnd: number;
  episodeType: EpisodeTypeEnum;
  version: number | null;
  ruleName: string;
}

export interface PathMatchRule {
  name: string;
  regex: RegExp;
  parentRegex?: RegExp;
  grandParentRegex?: RegExp;
  transform?(show: PathDetails, match: RegExpExecArray, parentMatch: RegExpExecArray | null, grandparentMatch: RegExpExecArray | null): PathDetails | null;
  defaults?: Partial<PathDetails>;
}

const DriveLetterRegex = /^[A-Z]:$/;

const noopTransform = (show: PathDetails) => show;

const detectEpisodeType = (matchGroups: Record<string, string | undefined>): EpisodeTypeEnum => {
  if (matchGroups.isSpecial) {
    return EpisodeTypeEnum.Special;
  }

  if (matchGroups.isThemeSong) {
    return EpisodeTypeEnum.ThemeSong;
  }

  if (matchGroups.isOther) {
    return EpisodeTypeEnum.Other;
  }

  if (matchGroups.isTrailer) {
    return EpisodeTypeEnum.Trailer;
  }

  return EpisodeTypeEnum.Normal;
};

export function detectShow(filePath: string | undefined | null): PathDetails | null {
  if (!filePath) return null;

  let [fileName = null, parentDir = null, grandParentDir = null] = filePath.trim().split(/[/\\]+/).filter(s => s).reverse();
  if (grandParentDir && DriveLetterRegex.test(grandParentDir)) grandParentDir = null;
  else if (parentDir && DriveLetterRegex.test(parentDir)) parentDir = null;
  else if (fileName && DriveLetterRegex.test(fileName)) fileName = null;
  if (!fileName) return null;

  for (let index = 0; index < PathMatchRuleSet.length; index += 1) {
    const { name: ruleName, regex, defaults = {}, grandParentRegex, parentRegex, transform = noopTransform } = PathMatchRuleSet[index];
    const match = fileName ? regex.exec(fileName) : null;
    const parentMatch = parentRegex && parentDir ? parentRegex.exec(parentDir) : null;
    const grandParentMatch = grandParentRegex && grandParentDir ? grandParentRegex.exec(grandParentDir) : null;
    if (match && match.groups) {
      // Swap episode numbers if they're reversed.
      let [episodeStart = 0, episodeEnd = episodeStart] = match.groups.episode.split('-').map(parseFloat);
      if (episodeEnd !== null) {
        const desiredCount = episodeEnd - episodeStart;
        if (desiredCount < 0) {
          const tempEpisode = episodeStart;
          episodeStart = episodeEnd;
          episodeEnd = tempEpisode;
        }
      }

      // Make sure we have a valid show name.
      let showName = match.groups.showName?.trim() || null;
      if (showName && showName === 'Episode') showName = null;
      const show: PathDetails = {
        releaseGroup: match.groups.releaseGroup || null,
        crc32: match.groups.crc32?.toUpperCase() || null,
        showName,
        season: match.groups.season ? parseFloat(match.groups.season) : null,
        fileExtension: match.groups.extension || null,
        version: match.groups.version ? parseFloat(match.groups.version) : null,
        episodeType: detectEpisodeType(match.groups),
        ...defaults,
        episodeStart,
        episodeEnd,
        filePath,
        ruleName,
      };

      // Inherit show name and release group from grand parent or parent.
      if (grandParentMatch && grandParentMatch.groups && parentMatch && parentMatch.groups) {
        const releaseGroup = grandParentMatch.groups.releaseGroup || null;
        if (releaseGroup) show.releaseGroup = releaseGroup;
        showName = grandParentMatch.groups.showName?.trim() || null;
        if (showName && showName) show.showName = showName;
      }
      if (parentMatch && parentMatch.groups) {
        const releaseGroup = parentMatch.groups.releaseGroup || null;
        if (releaseGroup) show.releaseGroup = releaseGroup;
        showName = parentMatch.groups.showName?.trim() || null;
        if (showName && showName) show.showName = showName;
      }

      const finalShow = transform(show, match, parentMatch, grandParentMatch);
      if (finalShow) {
        return finalShow;
      }
    }
  }
  return null;
}

export function findMostCommonShowName(showList: Array<PathDetails | null>): string {
  if (showList.length === 0) {
    return '';
  }

  const showNameMap = reduce(showList, (acc, show) => {
    if (show && show.showName) {
      acc.set(show.showName, (acc.get(show.showName) || 0) + 1);
    }
    return acc;
  }, new Map<string, number>());

  if (showNameMap.size === 0) {
    return '';
  }

  return reduce(Array.from(showNameMap.keys()), (a, b) => (showNameMap.get(a)! > showNameMap.get(b)! ? a : b), '')!;
}
