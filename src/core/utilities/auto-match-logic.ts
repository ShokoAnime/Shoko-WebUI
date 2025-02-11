import { every, reduce } from 'lodash';

import { EpisodeTypeEnum } from '@/core/types/api/episode';

import PathMatchRuleSet from './auto-match-regexes';

export type PathDetails = {
  filePath: string;
  fileExtension: string | null;
  releaseGroup: string | null;
  showName: string | null;
  season: number | null;
  episodeName: string | null;
  episodeStart: number;
  episodeEnd: number;
  episodeType: EpisodeTypeEnum;
  version: number | null;
  crc32: string | null;
  ruleName: string;
};

export type PathMatchRule = {
  name: string;
  regex: RegExp;
  parentRegex?: RegExp;
  grandParentRegex?: RegExp;
  transform?(
    this: void,
    pathDetails: PathDetails,
    match: RegExpExecArray,
    parentMatch: RegExpExecArray | null,
    grandparentMatch: RegExpExecArray | null,
  ): PathDetails | null | false;
  defaults?: Partial<PathDetails>;
};

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

  let [fileName = null, parentDir = null, grandParentDir = null] = filePath.trim().split(/[/\\]+/).filter(item => item)
    .reverse();
  if (grandParentDir && DriveLetterRegex.test(grandParentDir)) grandParentDir = null;
  else if (parentDir && DriveLetterRegex.test(parentDir)) parentDir = null;
  else if (fileName && DriveLetterRegex.test(fileName)) fileName = null;
  if (!fileName) return null;

  for (const rule of PathMatchRuleSet) {
    const {
      defaults = {},
      grandParentRegex,
      name: ruleName,
      parentRegex,
      regex,
      transform = noopTransform,
    } = rule;
    const match = fileName ? regex.exec(fileName) : null;
    const parentMatch = parentRegex && parentDir ? parentRegex.exec(parentDir) : null;
    const grandParentMatch = grandParentRegex && grandParentDir ? grandParentRegex.exec(grandParentDir) : null;
    if (match?.groups) {
      // We accept specials in-between episodes or episode ranges, so we split
      // the range and parse the text as floats.
      let [episodeStart = 1, episodeEnd = episodeStart] = match.groups.episode?.split('-')
        .filter(item => item)
        .map(str => (str.startsWith('E') ? str.slice(1) : str))
        .map<number>(parseFloat) ?? new Array<number>();

      // Swap episode numbers if they're reversed.
      if (episodeEnd - episodeStart < 0) {
        const tempEpisode = episodeStart;
        episodeStart = episodeEnd;
        episodeEnd = tempEpisode;
      }

      // Special handling of in-between episodes specials. We can't get the
      // special episode number, but we can guess it based on context provided
      // later when/if the user tries to link all the episodes in the series at
      // once.
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
      const initialDetails: PathDetails = {
        filePath,
        fileExtension: match.groups.extension || null,
        releaseGroup: match.groups.releaseGroup || null,
        showName,
        season: match.groups.season ? parseFloat(match.groups.season) : null,
        episodeName: match.groups.episodeName || null,
        episodeStart,
        episodeEnd,
        episodeType,
        version: match.groups.version ? parseFloat(match.groups.version) : null,
        crc32: match.groups.crc32 || null,
        ...defaults,
        ruleName,
      };

      // Inherit show name and release group from grand parent or parent.
      if (grandParentMatch?.groups && parentMatch?.groups) {
        const releaseGroup = grandParentMatch.groups.releaseGroup || null;
        if (releaseGroup) initialDetails.releaseGroup = releaseGroup;
        showName = grandParentMatch.groups.showName?.trim() || null;
        if (showName && showName) initialDetails.showName = showName;
      }
      if (parentMatch?.groups) {
        const releaseGroup = parentMatch.groups.releaseGroup || null;
        if (releaseGroup) initialDetails.releaseGroup = releaseGroup;
        showName = parentMatch.groups.showName?.trim() || null;
        if (showName && showName) initialDetails.showName = showName;
      }

      // Transform the details if the rule has a transformer/validator.
      const finalDetails = transform(initialDetails, match, parentMatch, grandParentMatch);

      // Since the transformer also can return null (to invalidate the match)
      // then we need to check the transformed details before returning.
      if (finalDetails) {
        return finalDetails;
      }

      // Break the loop if we receive `null`, continue the loop if we receive
      // `false`.
      if (finalDetails === null) {
        break;
      }
    }
  }
  return null;
}

export function findMostCommonShowName(showList: (PathDetails | null)[]): string {
  if (showList.length === 0) {
    return '';
  }

  const showNameMap = reduce(showList, (acc, show) => {
    if (show?.showName) {
      acc.set(show.showName, (acc.get(show.showName) ?? 0) + 1);
    }
    return acc;
  }, new Map<string, number>());

  if (showNameMap.size === 0) {
    return '';
  }

  // If we couldn't find a show name that appeared more than two times, then try
  // to look for a shared prefix in the show names, but if we can't find one
  // then fallback to the first found show name, since it doesn't matter at that
  // point.
  const showNames = Array.from(showNameMap.keys());
  const allShowNamesAppearOnce = every(Array.from(showNameMap.values()), value => value === 1);
  if (allShowNamesAppearOnce) {
    const sharedShowName = findSharedShowName(showNames);
    if (sharedShowName) {
      return sharedShowName;
    }

    return showNames[0];
  }

  return reduce(
    showNames,
    (result, showName) => (showNameMap.get(result)! > showNameMap.get(showName)! ? result : showName),
    showNames[0],
  );
}

function findSharedShowName(showNames: string[]): string {
  if (!showNames.length) {
    return '';
  }

  let lastMatchingIndex = 0;
  const sortedArr = showNames.slice().sort();
  const firstName = sortedArr[0];
  const lastName = sortedArr[sortedArr.length - 1];
  while (lastMatchingIndex < firstName.length && firstName[lastMatchingIndex] === lastName[lastMatchingIndex]) {
    lastMatchingIndex += 1;
  }

  return firstName.slice(0, lastMatchingIndex).trim();
}
