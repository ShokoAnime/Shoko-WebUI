import type { PathMatchRule } from './auto-match-logic';

const PathMatchRuleSet: PathMatchRule[] = [
  {
    name: 'general',
    regex: /^[{[](?<releaseGroup>[a-zA-Z0-9_-]+)[}\]]\s+(?<showName>.+?(?:\((?:19|20)\d{2}\)\s+)?)\s+(?:-\s+)?(?:(?<isThemeSong>(?:NC)?(?:ED|OP)\s*))?(?<isSpecial>SP?)?(?<episode>\d+(?:-\d+|\.\d+)?)(?:[vV](?<version>\d{1,2}))?(?:\s+\((?:\d{3,4}[pPiI]|(?:\b(?:BD|RIP|FLAC(?:\s+[257]\.[0124])?)\b\s*)+)\))*(?:\s+\[(?<crc32>[0-9a-fA-F]{8})\])?\.(?<extension>[a-zA-Z0-9_\-+]+)$/,
  },
  // TODO: Add more rules here.
];

export default PathMatchRuleSet;
