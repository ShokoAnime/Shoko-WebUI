import type { PathMatchRule } from './auto-match-logic';

const PathMatchRuleSet: PathMatchRule[] = [
  {
    name: 'episodes',
    regex:
      /^(?:[{[(](?<releaseGroup>[^)}\]]+)[)}\]][\s_.]*)?(?<showName>(?:[a-z]+[\s_.]+\d+(?=[\s_.]*(?:-+[\s_.]*)[a-z]+))?.+?(?<!\d)(?:[\s_.]*\((?<year>(?:19|20)\d{2})\))?)[\s_.]*(?:-+[\s_.]*)?(?:(?:(?<isThemeSong>(?:NC)?(?:ED|OP)[\s_.]*))|(?<isSpecial>SP)|(?<isOVA>OVA)|(?<isMovie>(?:The[\s_.]+)?Movie)(?:[\s_.]+(?:[_-]+[\s_.]*)?E?|(?=E))|S(?:eason)?(?<season>\d+)(?:[\s_.]+(?:[_-]+[\s_.]*)?E?|(?=E))|)(?<!part)(?:e?(?<episode>\d+(?:-+\d+|\.5)?)(?:v(?<version>\d{1,2}))?)(?:[\s_.]*-+(?:[\s_.]+(?<episodeTitle>(?!\d)[^([{\n]*?))?)?(?:[\s_.]+(?:[\s_.]*-+)?)?(?:[\s_.]*(?:\([^)]*\)|\[[^\]]*\]|{[^}]*}|[([{]+[^)\]}\n]*[)\]}]+|(?:(?:(?:[uf]?hd|sd|bd|ld|dvd|blu[\s_.-]*ray)?(?:[48]k|\d{3,4}[pi])(?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|h26[45])(?:-[a-z0-9]{1,3})?|(?:opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,3})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*)+))*[\s_.]*\.(?:[a-zA-Z0-9_\-+]+)$/i,
    transform(pathDetails, match) {
      // TODO: mohan couldn't find a dprint setting to make the = go to next line. This needs to be fixed.
      // eslint-disable-next-line operator-linebreak
      const TrimShowNameRegex =
        /(?![\s_.]*\((?:19|20)\d{2}\))(?:[\s_.]*(?:[([{][^)\]}\n]*[)\]}]|(?:(?:(?:[uf]?hd|sd|bd|ld|dvd|blu[\s_.-]*ray)?(?:[48]k|\d{3,4}[pi])(?:-+hi\w*)?|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_.-]*audio|(?:www|web|bd|dvd|ld|blu[\s_.-]*ray)(?:[\s_.-]*(?:rip|dl))?|dl|rip|(?:av1|hevc|h26[45])(?:-[a-z0-9]{1,3})?|(?:opus|ac3|aac|flac)(?:[\s._]*[257]\.[0124](?:[_.-]+\w{1,3})?)?|(?:\w{2,3}[\s_.-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_.]*)+))*[\s_.]*$/i;

      // Fix up show name by removing unwanted details and fixing spaces.
      if (pathDetails.showName) {
        let showName = pathDetails.showName.replace(TrimShowNameRegex, '');

        // Convert underscores and dots to spaces if we don't have any spaces in
        // the show name yet.
        if (!showName.includes(' ')) {
          showName = showName.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim();
        }

        // eslint-disable-next-line no-param-reassign
        pathDetails.showName = showName;
      }

      // Correct movie numbering.
      if (
        match.groups!.isMovie && pathDetails.episodeStart === 0 && pathDetails.episodeEnd === 0
      ) {
        // eslint-disable-next-line no-multi-assign, no-param-reassign
        pathDetails.episodeStart = pathDetails.episodeEnd = 1;
      }
      return pathDetails;
    },
  },
  // TODO: Add more rules here.
];

export default PathMatchRuleSet;
