import { reduce } from 'lodash';

import { EpisodeTypeEnum } from '@/core/types/api/episode';

import PathMatchRuleSet from './auto-match-regexes';

export interface PathDetails {
  filePath: string;
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
  transform?(
    pathDetails: PathDetails,
    match: RegExpExecArray,
    parentMatch: RegExpExecArray | null,
    grandparentMatch: RegExpExecArray | null,
  ): PathDetails | null;
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

  let [fileName = null, parentDir = null, grandParentDir = null] = filePath.trim().split(/[/\\]+/).filter(s => s)
    .reverse();
  if (grandParentDir && DriveLetterRegex.test(grandParentDir)) grandParentDir = null;
  else if (parentDir && DriveLetterRegex.test(parentDir)) parentDir = null;
  else if (fileName && DriveLetterRegex.test(fileName)) fileName = null;
  if (!fileName) return null;

  for (let index = 0; index < PathMatchRuleSet.length; index += 1) {
    // TODO: I couldn't find a dprint setting to make the = go to next line. This needs to be fixed.
    /* eslint-disable-next-line operator-linebreak */
    const { defaults = {}, grandParentRegex, name: ruleName, parentRegex, regex, transform = noopTransform } =
      PathMatchRuleSet[index];
    const match = fileName ? regex.exec(fileName) : null;
    const parentMatch = parentRegex && parentDir ? parentRegex.exec(parentDir) : null;
    const grandParentMatch = grandParentRegex && grandParentDir ? grandParentRegex.exec(grandParentDir) : null;
    if (match && match.groups) {
      // We accept specials in-between episodes or episode ranges, so we split
      // the range and parse the text as floats.
      let [episodeStart = 1, episodeEnd = episodeStart] = match.groups.episode.split('-').filter(s => s)
        .map(parseFloat);

      // Swap episode numbers if they're reversed.
      if (episodeEnd - episodeStart < 0) {
        const tempEpisode = episodeStart;
        episodeStart = episodeEnd;
        episodeEnd = tempEpisode;
      }

      // Special handling of in-between episodes specials. We can't get the
      // special episode number, but we can guess it based on context later
      // provided the user tries to link all the episodes in the series at once.
      //
      // The user is responsible if they link it without checking. We even show
      // a notification telling them to verify the matches before saving.
      let episodeType = detectEpisodeType(match.groups);
      if (episodeType === EpisodeTypeEnum.Normal && episodeStart === episodeEnd && !Number.isInteger(episodeStart)) {
        episodeType = EpisodeTypeEnum.Special;
        episodeStart = 0;
        episodeEnd = 0;
      }

      // Make sure we have a valid show name.
      let showName = match.groups.showName?.trim() || null;
      if (showName && showName === 'Episode') showName = null;
      let pathDetails: PathDetails | null = {
        releaseGroup: match.groups.releaseGroup || null,
        crc32: match.groups.crc32?.toUpperCase() || null,
        showName,
        season: match.groups.season ? parseFloat(match.groups.season) : null,
        version: match.groups.version ? parseFloat(match.groups.version) : null,
        episodeType,
        ...defaults,
        episodeStart,
        episodeEnd,
        filePath,
        ruleName,
      };

      // Inherit show name and release group from grand parent or parent.
      if (grandParentMatch && grandParentMatch.groups && parentMatch && parentMatch.groups) {
        const releaseGroup = grandParentMatch.groups.releaseGroup || null;
        if (releaseGroup) pathDetails.releaseGroup = releaseGroup;
        showName = grandParentMatch.groups.showName?.trim() || null;
        if (showName && showName) pathDetails.showName = showName;
      }
      if (parentMatch && parentMatch.groups) {
        const releaseGroup = parentMatch.groups.releaseGroup || null;
        if (releaseGroup) pathDetails.releaseGroup = releaseGroup;
        showName = parentMatch.groups.showName?.trim() || null;
        if (showName && showName) pathDetails.showName = showName;
      }

      // Transform the details if the rule has a trasformer/validator.
      pathDetails = transform(pathDetails, match, parentMatch, grandParentMatch);

      // Since the transformer also can return null (to invalidte the match)
      // then we need to check if the transformed details before returning.
      if (pathDetails) {
        return pathDetails;
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
