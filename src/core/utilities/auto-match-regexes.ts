import type { PathMatchRule } from './auto-match-logic';

const PathMatchRuleSet: PathMatchRule[] = [
  {
    name: 'general',
    regex:
      /^(?:[{[(](?<releaseGroup>[a-zA-Z0-9_-]+)[)}\]][\s_]*)?(?<showName>.+?(?:[\s_]*\((?<year>(?:19|20)\d{2})\)[\s_]*)?)[\s_]*(?:-+[\s_]*)?(?:(?:(?<isThemeSong>(?:NC)?(?:ED|OP)[\s_]*))?|(?<isSpecial>SP?)?|S(?<season>\d+)(?:[\s_]+(?:-+[\s_]*)?E?|E)|E?)(?<episode>\d+(?:-+\d+|\.\d+)?)(?:[vV](?<version>\d{1,2}))?(?:[\s_]*-+)?(?:[\s_]*(?:[([{](?:(?:(?:[uf]?hd|sd|bd|ld|dvd|blu[\s_-]*ray)?(?:[48]k|\d{3,4}[pi])|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_-]*audio|(?:bd|dvd|ld|blu[\s_-]*ray)(?:[\s_-]*rip)?|rip|(?:hevc|x26[45])|(?:ac3|aac|flac)(?:[\s_]*[257]\.[0124])?|(?:\w{2,3}[\s_-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_]*)+[)\]}]|(?:(?:(?:[uf]?hd|sd|bd|ld|dvd|blu[\s_-]*ray)?(?:[48]k|\d{3,4}[pi])|(?:[uf]?hd|sd)|\d{3,4}x\d{3,4}|dual[\s_-]*audio|(?:bd|dvd|ld|blu[\s_-]*ray)(?:[\s_-]*rip)?|rip|(?:hevc|x26[45])|(?:ac3|aac|flac)(?:[\s_]*[257]\.[0124])?|(?:\w{2,3}[\s_-]*)?(?:sub(?:title)?s?|dub)|(?:un)?cen(?:\.|sored)?)[\s_]*)+))*(?:[\s_]*\[(?<crc32>[0-9a-fA-F]{8})\])?[\s_]*\.(?<extension>[a-zA-Z0-9_\-+]+)$/i,
    transform(pathDetails) {
      if (pathDetails.showName) {
        // eslint-disable-next-line no-param-reassign
        pathDetails.showName = pathDetails.showName.replaceAll('_', ' ').replace(/\s+/g, ' ').trim();
      }
      return pathDetails;
    },
  },
  // TODO: Add more rules here.
];

export default PathMatchRuleSet;
