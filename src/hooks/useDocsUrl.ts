import { useVersionQuery } from '@/core/react-query/init/queries';

/**
 * Returns the base docs URL for the current server release channel.
 * Routes to /daily/ when the server is not on the stable channel,
 * otherwise returns the stable docs root.
 */
const useDocsUrl = (): string => {
  const { data: versionData } = useVersionQuery();
  const isStable = versionData?.Server?.ReleaseChannel === 'Stable';
  return `https://docs.shokoanime.com${isStable ? '' : '/daily/'}`;
};

export default useDocsUrl;
