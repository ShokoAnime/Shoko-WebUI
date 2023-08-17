import type { PathMatchRule } from './auto-match-logic';

const PathMatchRuleSet: PathMatchRule[] = [
  {
    name: 'general',
    regex:
      /^(?:[{[(](?<releaseGroup>[a-zA-Z0-9_-\s]+)[)}\]][\s_.]*)?(?<showName>.+?(?:[\s_.]*\((?<year>(?:19|20)\d{2})\)[\s_.]*)?)[\s_.]*(?:-+[\s_.]*)?(?:(?:(?<isThemeSong>(?:NC)?(?:ED|OP)[\s_.]*))?|(?<isSpecial>SP)?|S(?<season>\d+)(?:[\s_.]+(?:-+[\s_.]*)?E?|E)|E?)(?<episode>\d+(?:-+\d+|\.\d+)?)(?:v(?<version>\d{1,2}))?(?<episodeName>.*)\.(?<extension>[a-zA-Z0-9_\-+]+)$/i,
    transform(pathDetails) {
      if (pathDetails.showName && !pathDetails.showName.includes(' ')) {
        // eslint-disable-next-line no-param-reassign
        pathDetails.showName = pathDetails.showName.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim();
      }
      return pathDetails;
    },
  },
  // TODO: Add more rules here.
];

export default PathMatchRuleSet;
