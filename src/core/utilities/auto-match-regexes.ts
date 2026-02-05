import { EpisodeTypeEnum } from '@/core/types/api/episode';

import type { PathDetails, PathMatchRule } from './auto-match-logic';

const PathMatchRuleSet: PathMatchRule[] = [];

try {
  // TODO: mohan couldn't find a dprint setting to make the = go to next line. This needs to be fixed.
  const TrimShowNameRegex =
    /(?![\s_.]*\(part[\s_.]*[ivx]+\))(?![\s_.]*\((?:19|20)\d{2}\))(?:[\s_.]*(?:[([{][^)\]}\n]*[)\]}]|(?:(?<![a-z])(?:jpn?|jap(?:anese)?|en|eng(?:lish)?|es|(?:spa(?:nish)?|de|ger(?:man)?)|\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|[hx]26[45])(?:-[a-z0-9]{1,6})?|(?:dolby(?:[\s_.-]*atmos)?|dts|opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,3})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*){1,20})){0,20}[\s_.]*$/i;

  const ReStitchRegex = /^[\s_.]*-+[\s_.]*$/i;

  const Crc32Regex = /\(([0-9a-fA-F]{8})\)|\[([0-9a-fA-F]{8})\]/;

  const ThemeSongCheckRegex =
    /(?<isThemeSong>(?<![a-z0-9])(?:(?:nc|creditless)[\s_.]*)?(?:ed|op)(?![a-z]))(?:[\s_.]*(?<episode>\d+(?!\d*p)))?/i;

  const TrailerCheckRegex =
    /(?<isTrailer>(?<![a-z0-9])(?:(?:character)[\s_.]*)?(?:cm|pv|trailer)(?![a-z]))(?:[\s_.]*(?<episode>\d+(?!\d*p)))?/i;

  const ExtraCheckRegex =
    /(?<isTrailer>(?<![a-z0-9])(?:(?:bd)[\s_.]*)?(?:menu|web preview)(?![a-z]))(?:[\s_.]*(?<episode>\d+(?!\d*p)))?/i;

  const parseRomanNumerals = (letters: string): number => {
    switch (letters) {
      case 'I':
        return 1;
      case 'II':
        return 2;
      case 'III':
        return 3;
      case 'IV':
        return 4;
      case 'V':
        return 5;
      case 'VI':
        return 6;
      case 'VII':
        return 7;
      case 'VIII':
        return 8;
      case 'IX':
        return 9;
      default:
        return -1;
    }
  };

  // Default transform rule to fix up the output of the regex.
  const defaultTransform = (originalDetails: PathDetails, match: RegExpExecArray) => {
    const modifiedDetails = { ...originalDetails };

    // Add crc32 if found
    const crc32Result = Crc32Regex.exec(match[0]);
    if (crc32Result) {
      modifiedDetails.crc32 = crc32Result[1] || crc32Result[2];
    }

    // Fix up show name by removing unwanted details and fixing spaces.
    if (modifiedDetails.showName) {
      let showName = modifiedDetails.showName.replace(TrimShowNameRegex, '');

      // Fix movie name when no episode number is provided.
      const { episode, episodeName, isTv, year } = match.groups!;
      if (episodeName && !episode) {
        const { episodeName: [rangeEnd], showName: [, rangeStart] } = match.indices!.groups!;
        const inBetween = match[0].slice(rangeStart, rangeEnd);
        if (ReStitchRegex.test(inBetween)) {
          showName = showName + inBetween + episodeName;
          modifiedDetails.episodeName = null;
        }
      }

      // Convert underscores and dots to spaces if we don't have any spaces in
      // the show name yet.
      if (!showName.includes(' ')) {
        showName = showName.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim();
        // A hack.
        if (showName.startsWith('//')) {
          showName = `.${showName}`;
        }
      }

      if (/ S\d+$/.exec(showName)) {
        const result = / S(\d+)$/.exec(showName)!;
        showName = showName.slice(0, -result[0].length);
        modifiedDetails.season = parseInt(result[1], 10);
      }

      if (/\s+\b([IVX]+)\s*$/.exec(showName)) {
        const result = /\s+\b(?<letters>[IVX]+)\s*$/.exec(showName)!;
        const seasonNumber = parseRomanNumerals(result.groups!.letters);
        if (seasonNumber !== -1) {
          showName = showName.slice(0, -result[0].length);
          modifiedDetails.season = seasonNumber;
        }
      }

      // Fix up year for some shows.
      if (/ \d{4}$/.exec(showName)) {
        showName = `${showName.slice(0, -5)} (${showName.slice(-4)})`;
      }

      // Append back the '(TV)' part if we removed it.
      if (isTv) {
        showName += ' (TV)';
      } else if (showName.endsWith(' - TV')) {
        showName = `${showName.slice(0, -5)} (TV)`;
      } else if (showName.endsWith(' TV')) {
        showName = `${showName.slice(0, -3)} (TV)`;
      }

      // Append the 'season' number to the show name to help with the search if a
      // year was not found.
      if (modifiedDetails.season !== null && modifiedDetails.season !== 1 && episode && !year) {
        showName += ` S${modifiedDetails.season}`;
      }

      modifiedDetails.showName = showName;
    }

    if (modifiedDetails.episodeName) {
      let episodeName = modifiedDetails.episodeName.replace(TrimShowNameRegex, '');

      // Convert underscores and dots to spaces if we don't have any spaces in
      // the show name yet.
      if (!episodeName.includes(' ')) {
        episodeName = episodeName.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim();
      }

      modifiedDetails.episodeName = episodeName;
    }

    // Add theme video information if found.
    const themeCheckResult = ThemeSongCheckRegex.exec(originalDetails.filePath);
    if (themeCheckResult) {
      const { episode: episodeText = '1' } = themeCheckResult.groups!;
      const episode = parseInt(episodeText, 10);

      modifiedDetails.episodeStart = episode;
      modifiedDetails.episodeEnd = episode;
    }
    if (modifiedDetails.episodeStart === 0) {
      const trailerCheckResult = TrailerCheckRegex.exec(originalDetails.filePath);
      if (trailerCheckResult) {
        const { episode: episodeText = '0' } = trailerCheckResult.groups!;
        const episode = parseInt(episodeText, 10);

        modifiedDetails.episodeType = EpisodeTypeEnum.Trailer;
        if (episode > 0) {
          modifiedDetails.episodeStart = episode;
          modifiedDetails.episodeEnd = episode;
        }
      }
      const extraCheckResult = ExtraCheckRegex.exec(originalDetails.filePath);
      if (extraCheckResult && modifiedDetails.episodeStart === 0) {
        const { episode: episodeText = '0' } = extraCheckResult.groups!;
        const episode = parseInt(episodeText, 10);

        modifiedDetails.episodeType = EpisodeTypeEnum.Special;
        if (episode > 0) {
          modifiedDetails.episodeStart = episode;
          modifiedDetails.episodeEnd = episode;
        }
      }
    }

    // Correct movie numbering.
    if (
      (match.groups!.isMovie || match.groups!.isMovie2) && modifiedDetails.episodeStart === 0
      && modifiedDetails.episodeEnd === 0
    ) {
      modifiedDetails.episodeStart = 1;
      modifiedDetails.episodeEnd = 1;
    }
    return modifiedDetails;
  };

  PathMatchRuleSet.push(
    {
      name: 'anti-timestamp',
      regex:
        /^\d{4}[._:\- ]\d{2}[._:\- ]\d{2}[._:\- T]\d{2}[._:\- ]\d{2}[._:\- ]\d{2}(?:[._:\- ]\d{1,6})?(?:Z|[+-]\d{2}:?\d{2})?\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      // invalidate the match.
      transform: () => null,
    },
    {
      name: 'raws-1',
      regex:
        /^(?<showName>[^\n]+?) (?:(?:- ?)?(?:S(?<season>\d+)E|E?)(?<episode>\d+)(?:v(?<version>\d+))?(?: ?-)? )?(?:\w* )?(?<resolution>((?:[0-9]{3,4})x(?:[0-9]{3,4}))|(?:[0-9]{3,4})p)(?: [^ \n]+)*? ?(?<!DTS|Atmos|Dolby)-(?<releaseGroup>[^ \n]+)(?: \((?<source>[^)]+)\))?\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'raws-2',
      regex:
        // eslint-disable-next-line no-useless-escape
        /^(?<showName>[^\n]+?)\.(?:-\.)?(?:S(?<season>\d+)E|E(?:p(?:isode)?\.?)?|(?<=(?<!\d)\.))(?<episode>\d+(?!\.(?:0|S\d+|E(?:p(?:isode)?\.?)?\d+)))(?:\.-)?(?:\.[^\.\n]+)*?-(?<releaseGroup>[^\.\n]+)(?:\.\((?<source>[^)]+)\))?\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'raws-3',
      regex:
        // eslint-disable-next-line no-useless-escape
        /^(?<showName>[^\n]+?)(?:(?:- )?(?:S(?<season>\d+)E|E?)(?<episode>\d+)(?:v(?<version>\d+))?(?: -)? )?(?:[ \.](?:\[[^\]]+\]|{[^}]+})*)*-(?<releaseGroup>[A-Za-z0-9_]+)(?:\.\((?<source>[^)]+)\))?\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'trash-anime',
      regex:
        // eslint-disable-next-line no-useless-escape
        /^(?<showName>.+?(?: \((?<year>\d{4})\))) - (?:(?<isSpecial>S00?)|S\d+)E\d+(?:-E?\d+)? - (?<episode>\d+(?:-\d+)?) - (?<episodeName>.+?(?=\[)).*?(?:-(?<releaseGroup>[^\[\] ]+))?\s*\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'default',
      regex:
        // eslint-disable-next-line no-useless-escape
        /^(?:[{[(](?<releaseGroup>[^)}\]]+)[)}\]][\s_.]*)?(?<showName>(?<isMovie2>gekijouban[\s_.]+)?(?:[a-z]+[\s_\.]+\d+(?=[\s_\.]*(?:-+[\s_\.]*)[a-z]+))?.+?(?<!\d)(?:[\s_\.]*\(part[\s_\.]*[ivx]+\))?(?<isMovie>[\s_\.]*(?:[-!+]+[\s_\.]*)?(?:the[\s_\.]+)?movie)?(?:[\s_\.]*\(part[\s_\.]*[ivx]+\))?(?:[\s_\.]*\((?<year>(?:19|20)\d{2})\))?)(?<isTrailer>[\s_\.]*(?:character[\s_\.]*)?(?:cm|pv|menu))?[\s_\.]*(?:-+[\s_\.]*)?(?:(?:(?<isThemeSong>(?<![a-z])(?:nc)?(?:ed|op)[\s_\.]*))|(?<isSpecial>sp(?:ecial)?|s(?=\d+(?<!e)))|(?<isOVA>ova)(?:[\s_\.]+(?:[_-]+[\s_\.]*)?e|(?=e))|s(?:eason)?(?<season>\d+)(?:[\s_\.]+(?:[_-]+\.*)?e?|(?=e))|)(?:(?<!part[\s_\.]*)(?:(?<![a-z])e(?:ps?|pisodes?)?[\s_\.]*)?(?<episode>\d+(?:(?!-\d+p)-+E?\d+?|\.5)?|(?<=(?:ed|op)\s*)\d+\.\d+)(?:[\s:\.]*end)?)(?:[\s:\.]*v(?<version>\d{1,2}))?(?:[\s_\.]*-+(?:[\s_\.]+(?<episodeName>(?!\d)[^([{\n]*?))?)?(?:[\s_\.]+(?:[\s_\.]+)?)?(?:[\s_.]*(?:\([^)]*\)|\[[^\]]*\]|{[^}]*}|[([{]+[^)\]}\n]*[)\]}]+|(?:(?<![a-z])(?:jpn?|jap(?:anese)?|en|eng(?:lish)?|es|(?:spa(?:nish)?|de|ger(?:man)?)|\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_\.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_\.-]*ray)(?:[\s_\.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|[hx]26[45])(?:-[a-z0-9]{1,6})?|(?:dolby(?:[\s_\.-]*(?:atmos|vision))?|dts|opus|e?ac3|aac|flac|dovi)(?:[\s\._]*[257]\.[0124](?:[_.-]+\w{1,6})?)?|(?:\w{2,3}[\s_\.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_\.]*){1,20})){0,20}[\s_\.]*(?:-[a-zA-Z0-9]+?)?\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'foreign-1',
      regex: /^(?<showName>[^\]\n]+) - (?<episode>\d+) 「[^」\n]+」 \([^)\n]+\)\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'brackets-1',
      regex:
        /^\[(?<releaseGroup>[^\]\n]+)\](?:\[[^\]\n]+\]){0,2}\[(?<showName>[^\]\n]+)\]\[(?<year>\d{4})\]\[(?<episode>\d+)\](?:\[[^\]\n]+\]){0,3}\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'brackets-2',
      regex:
        /^\[(?<releaseGroup>[^\]\n]+)\](?:\[[^\]\n]+\]){0,2}\[(?<showName>[^\]\n]+)\]\[(?<episode>\d+)\](?:\[[^\]\n]+\]){0,3}\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'brackets-3',
      regex:
        /^\[(?<releaseGroup>[^\]\n]+)\](?:\[[^\]\n]+\]){0,2}\[?(?<showName>[^\]\n]+)\]? - (?<episode>\d+)(?: ?\[[^\]\n]+\] ?){0,20}\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'reversed-1',
      regex: /^\[?(?<episode>\d+)\s*-\s*(?<showName>[^[]+])\s*(?:\[[^\]]*\])*\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    // TODO: Add more rules here.
    {
      name: 'fallback',
      regex:
        // eslint-disable-next-line no-useless-escape
        /^(?:[{[(](?<releaseGroup>[^)}\]]+)[)}\]][\s_.]*)?(?<showName>(?<isMovie2>gekijouban[\s_.]+)?(?:[a-z]+[\s_\.]+\d+(?=[\s_\.]*(?:-+[\s_\.]*)[a-z]+))?.+?(?<!\d)(?:[\s_\.]*\(part[\s_\.]*[ivx]+\))?(?<isMovie>[\s_\.]*(?:[-!+]+[\s_\.]*)?(?:the[\s_\.]+)?movie)?(?:[\s_\.]*\(part[\s_\.]*[ivx]+\))?(?:[\s_\.]*\((?<year>(?:19|20)\d{2})\))?)(?<isTrailer>[\s_\.]*(?:character[\s_\.]*)?(?:cm|pv|menu))?[\s_\.]*(?:-+[\s_\.]*)?(?:(?:(?<isThemeSong>(?<![a-z])(?:nc)?(?:ed|op)[\s_\.]*))|(?<isSpecial>sp(?:ecial)?|s(?=\d+(?<!e)))|(?<isOVA>ova)(?:[\s_\.]+(?:[_-]+[\s_\.]*)?e|(?=e))|s(?:eason)?(?<season>\d+)(?:[\s_\.]+(?:[_-]+\.*)?e?|(?=e))|)(?:(?<!part[\s_\.]*)(?:(?<![a-z])e(?:ps?|pisodes?)?[\s_\.]*)?(?<episode>\d+(?:(?!-\d+p)-+E?\d+?|\.5)?|(?<=(?:ed|op)\s*)\d+\.\d+)?(?:[\s:\.]*end)?)(?:[\s:\.]*v(?<version>\d{1,2}))?(?:[\s_\.]*-+(?:[\s_\.]+(?<episodeName>(?!\d)[^([{\n]*?))?)?(?:[\s_\.]+(?:[\s_\.]+)?)?(?:[\s_.]*(?:\([^)]*\)|\[[^\]]*\]|{[^}]*}|[([{]+[^)\]}\n]*[)\]}]+|(?:(?<![a-z])(?:jpn?|jap(?:anese)?|en|eng(?:lish)?|es|(?:spa(?:nish)?|de|ger(?:man)?)|\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_\.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_\.-]*ray)(?:[\s_\.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|[hx]26[45])(?:-[a-z0-9]{1,6})?|(?:dolby(?:[\s_\.-]*(?:atmos|vision))?|dts|opus|e?ac3|aac|flac|dovi)(?:[\s\._]*[257]\.[0124](?:[_.-]+\w{1,6})?)?|(?:\w{2,3}[\s_\.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_\.]*){1,20})){0,20}[\s_\.]*(?:-[a-zA-Z0-9]+?)?\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
  );
} catch (error) {
  console.error(error);
}

export default PathMatchRuleSet;
