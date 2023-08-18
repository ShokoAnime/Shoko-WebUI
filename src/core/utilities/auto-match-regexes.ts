import type { PathDetails, PathMatchRule } from './auto-match-logic';

// TODO: mohan couldn't find a dprint setting to make the = go to next line. This needs to be fixed.
// eslint-disable-next-line operator-linebreak
const TrimShowNameRegex =
  /(?![\s_.]*\(part[\s_.]*[ivx]+\))(?![\s_.]*\((?:19|20)\d{2}\))(?:[\s_.]*(?<![a-z])(?:[([{][^)\]}\n]*[)\]}]|(?:(?:\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|h26[45])(?:-[a-z0-9]{1,3})?|(?:opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,3})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*){0,20})){0,20}[\s_.]*$/i;

// Default transform rule to fix up the output of the regex.
const defaultTransform = (originalDetails: PathDetails, match: RegExpExecArray) => {
  const modifiedDetails = { ...originalDetails };
  // Fix up show name by removing unwanted details and fixing spaces.
  if (modifiedDetails.showName) {
    let showName = modifiedDetails.showName.replace(TrimShowNameRegex, '');

    // Convert underscores and dots to spaces if we don't have any spaces in
    // the show name yet.
    if (!showName.includes(' ')) {
      showName = showName.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim();
      // A hack.
      if (showName.startsWith('//')) {
        showName = `.${showName}`;
      }
    }

    modifiedDetails.showName = showName;
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

const PathMatchRuleSet: PathMatchRule[] = [
  {
    name: 'default',
    regex:
      /^(?:[{[(](?<releaseGroup>[^)}\]]+)[)}\]][\s_.]*)?(?<showName>(?<isMovie2>gekijouban[\s_.]+)?(?:[a-z]+[\s_.]+\d+(?=[\s_.]*(?:-+[\s_.]*)[a-z]+))?.+?(?<!\d)(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?<isMovie>[\s_.]*(?:[-!+]+[\s_.]*)?(?:the[\s_.]+)?movie)?(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?:[\s_.]*\((?<year>(?:19|20)\d{2})\))?)[\s_.]*(?:-+[\s_.]*)?(?:(?:(?<isThemeSong>(?<![a-z])(?:nc)?(?:ed|op)[\s_.]*))|(?<isSpecial>sp)|(?<isOVA>ova)(?:[\s_.]+(?:[_-]+[\s_.]*)?e|(?=e))|s(?:eason)?(?<season>\d+)(?:[\s_.]+(?:[_-]+[\s_.]*)?e?|(?=e))|)(?:(?<!part[\s_.]*)e?(?<episode>\d+(?:-+\d+|\.5)?))(?:v(?<version>\d{1,2}))?(?:[\s_.]*-+(?:[\s_.]+(?<episodeTitle>(?!\d)[^([{\n]*?))?)?(?:[\s_.]+(?:[\s_.]*-+)?)?(?:[\s_.]*(?<![a-z])(?:\([^)]*\)|\[[^\]]*\]|{[^}]*}|[([{]+[^)\]}\n]*[)\]}]+|(?:(?:\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|h26[45])(?:-[a-z0-9]{1,3})?|(?:opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,3})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*){0,20})){0,20}[\s_.]*\.(?:[a-zA-Z0-9_\-+]+)$/i,
    transform: defaultTransform,
  },
  {
    name: 'default+',
    regex:
      /^(?:[{[(](?<releaseGroup>[^)}\]]+)[)}\]][\s_.]*)?(?<showName>(?<isMovie2>gekijouban[\s_.]+)?(?:[a-z]+[\s_.]+\d+(?=[\s_.]*(?:-+[\s_.]*)[a-z]+))?.+?(?<!\d)(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?<isMovie>[\s_.]*(?:[-!+]+[\s_.]*)?(?:the[\s_.]+)?movie)?(?:[\s_.]*\(part[\s_.]*[ivx]+\))?(?:[\s_.]*\((?<year>(?:19|20)\d{2})\))?)[\s_.]*(?:-+[\s_.]*)?(?:(?:(?<isThemeSong>(?<![a-z])(?:nc)?(?:ed|op)[\s_.]*))|(?<isSpecial>sp)|(?<isOVA>ova)(?:[\s_.]+(?:[_-]+[\s_.]*)?e|(?=e))|s(?:eason)?(?<season>\d+)(?:[\s_.]+(?:[_-]+[\s_.]*)?e?|(?=e))|)(?:(?<!part[\s_.]*)e?(?<episode>\d+(?:-+\d+|\.5)?))?(?:v(?<version>\d{1,2}))?(?:[\s_.]*-+(?:[\s_.]+(?<episodeTitle>(?!\d)[^([{\n]*?))?)?(?:[\s_.]+(?:[\s_.]*-+)?)?(?:[\s_.]*(?<![a-z])(?:\([^)]*\)|\[[^\]]*\]|{[^}]*}|[([{]+[^)\]}\n]*[)\]}]+|(?:(?:\d{3,4}[pi](?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|h26[45])(?:-[a-z0-9]{1,3})?|(?:opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,3})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*){0,20})){0,20}[\s_.]*\.(?:[a-zA-Z0-9_\-+]+)$/i,
    transform: defaultTransform,
  },
  // TODO: Add more rules here.
];

export default PathMatchRuleSet;
