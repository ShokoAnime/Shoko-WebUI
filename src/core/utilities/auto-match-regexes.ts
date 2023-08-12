import type { PathMatchRule } from './auto-match-logic';

const PathMatchRuleSet: PathMatchRule[] = [
  {
    name: 'general',
    regex: /^(?:[{[](?<releaseGroup>[a-zA-Z0-9_-]+)[}\]]\s+)?(?<showName>.+?(?:\((?:19|20)\d{2}\)\s+)?)\s+(?:-\s+)?(?:(?:(?<isThemeSong>(?:NC)?(?:ED|OP)\s*))?|(?<isSpecial>SP?)?|E?)(?<episode>\d+(?:-\d+|\.\d+)?)(?:[vV](?<version>\d{1,2}))?(?:\s+(?:\((?:(?:\b(?:\d{3,4}[pPiI]|\d{3,4}x\d{3,4}|Dual Audio|BD|RIP|FLAC(?:\s+[257]\.[0124])?)\b\s*)+)\)|\[(?:(?:\d{3,4}[pPiI]|\d{3,4}x\d{3,4}|Dual Audio|BD|RIP|FLAC(?:\s+[257]\.[0124])?)\s*)+\]))*(?:\s+\[(?<crc32>[0-9a-fA-F]{8})\])?\.(?<extension>[a-zA-Z0-9_\-+]+)$/,
  },
  // TODO: Add more rules here.
];

export default PathMatchRuleSet;
