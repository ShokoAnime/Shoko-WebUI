import type { PathDetails, PathMatchRule } from './auto-match-logic';

const PathMatchRuleSet: PathMatchRule[] = [];

try {
  // TODO: mohan couldn't find a dprint setting to make the = go to next line. This needs to be fixed.
  // eslint-disable-next-line operator-linebreak
  const TrimShowNameRegex =
    /(?![\s_.]*\(part[\s_.]*[ivx]+\))(?![\s_.]*\((?:19|20)\d{2}\))(?:[\s_.]*(?:[([{][^)\]}\n]*[)\]}]|(?:(?<![a-z])(?:jpn?|jap(?:anese)?|en|eng(?:lish)?|es|(?:spa(?:nish)?|de|ger(?:man)?)|\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|[hx]26[45])(?:-[a-z0-9]{1,6})?|(?:dolby(?:[\s_.-]*atmos)?|dts|opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,3})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*){1,20})){0,20}[\s_.]*$/i;

  const ReStitchRegex = /^[\s_.]*-+[\s_.]*$/i;

  const Crc32Regex = /\(([0-9a-fA-F]{8})\)|\[([0-9a-fA-F]{8})\]/;

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
      const { episode, episodeName, year } = match.groups!;
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

      // Append the "season" number to the show name to help with the search if a
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
      name: 'default',
      regex:
        /^(?:[{[(](?<releaseGroup>[^)}\]]+)[)}\]][\s_.]*)?(?<showName>(?<isMovie2>gekijouban[\s_.]+)?(?:[a-z]+[\s_.]+\d+(?=[\s_.]*(?:-+[\s_.]*)[a-z]+))?.+?(?<!\d)(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?<isMovie>[\s_.]*(?:[-!+]+[\s_.]*)?(?:the[\s_.]+)?movie)?(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?:[\s_.]*\((?<year>(?:19|20)\d{2})\))?)[\s_.]*(?:-+[\s_.]*)?(?:(?:(?<isThemeSong>(?<![a-z])(?:nc)?(?:ed|op)[\s_.]*))|(?<isSpecial>sp(?:ecial)?)|(?<isOVA>ova)(?:[\s_.]+(?:[_-]+[\s_.]*)?e|(?=e))|s(?:eason)?(?<season>\d+)(?:[\s_.]+(?:[_-]+[\s_.]*)?e?|(?=e))|)(?:(?<!part[\s_.]*)(?:(?<![a-z])e(?:ps?|pisodes?)?[\s_.]*)?(?<episode>\d+(?:-+\d+|\.5)?|(?<=(?:ed|op)\s*)\d+\.\d+))(?:v(?<version>\d{1,2}))?(?:[\s_.]*-+(?:[\s_.]+(?<episodeName>(?!\d)[^([{\n]*?))?)?(?:[\s_.]+(?:[\s_.]*-+)?)?(?:[\s_.]*(?:\([^)]*\)|\[[^\]]*\]|{[^}]*}|[([{]+[^)\]}\n]*[)\]}]+|(?:(?<![a-z])(?:jpn?|jap(?:anese)?|en|eng(?:lish)?|es|(?:spa(?:nish)?|de|ger(?:man)?)|\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|[hx]26[45])(?:-[a-z0-9]{1,6})?|(?:dolby(?:[\s_.-]*atmos)?|dts|opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,6})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*){1,20})){0,20}[\s_.]*\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    {
      name: 'default+',
      regex:
        /^(?:[{[(](?<releaseGroup>[^)}\]]+)[)}\]][\s_.]*)?(?<showName>(?<isMovie2>gekijouban[\s_.]+)?(?:[a-z]+[\s_.]+\d+(?=[\s_.]*(?:-+[\s_.]*)[a-z]+))?.+?(?<!\d)(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?<isMovie>[\s_.]*(?:[-!+]+[\s_.]*)?(?:the[\s_.]+)?movie)?(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?:[\s_.]*\((?<year>(?:19|20)\d{2})\))?)[\s_.]*(?:-+[\s_.]*)?(?:(?:(?<isThemeSong>(?<![a-z])(?:nc)?(?:ed|op)[\s_.]*))|(?<isSpecial>sp(?:ecial)?)|(?<isOVA>ova)(?:[\s_.]+(?:[_-]+[\s_.]*)?e|(?=e))|s(?:eason)?(?<season>\d+)(?:[\s_.]+(?:[_-]+[\s_.]*)?e?|(?=e))|)(?:(?<!part[\s_.]*)(?:(?<![a-z])e(?:ps?|pisodes?)?[\s_.]*)?(?<episode>\d+(?:-+\d+|\.5)?|(?<=(?:ed|op)\s*)\d+\.\d+))?(?:v(?<version>\d{1,2}))?(?:[\s_.]*-+(?:[\s_.]+(?<episodeName>(?!\d)[^([{\n]*?))?)?(?:[\s_.]+(?:[\s_.]*-+)?)?(?:[\s_.]*(?:\([^)]*\)|\[[^\]]*\]|{[^}]*}|[([{]+[^)\]}\n]*[)\]}]+|(?:(?<![a-z])(?:jpn?|jap(?:anese)?|en|eng(?:lish)?|es|(?:spa(?:nish)?|de|ger(?:man)?)|\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|[hx]26[45])(?:-[a-z0-9]{1,6})?|(?:dolby(?:[\s_.-]*atmos)?|dts|opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,6})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*){1,20})){0,20}[\s_.]*\.(?<extension>[a-zA-Z0-9_\-+]+)$/id,
      transform: defaultTransform,
    },
    // TODO: Add more rules here.
  );
} catch (error) {
  console.error(error);
}

export default PathMatchRuleSet;
