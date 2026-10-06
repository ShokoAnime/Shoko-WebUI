import { useCurrentUserQuery } from '@/core/react-query/user/queries';

/**
 * The current user, loaded once fetched since mounting: a user cached from before a logout is fetched again before
 * it counts.
 */
const useFreshCurrentUser = () => {
  const currentUserQuery = useCurrentUserQuery();
  const isFresh = currentUserQuery.isFetchedAfterMount || !currentUserQuery.isFetching;
  const isLoaded = isFresh && (currentUserQuery.isSuccess || currentUserQuery.isError);
  return { isLoaded, isAdmin: isLoaded && (currentUserQuery.data?.IsAdmin ?? false) };
};

export default useFreshCurrentUser;
