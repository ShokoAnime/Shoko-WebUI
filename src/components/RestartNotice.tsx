import { useEffect, useRef } from 'react';

import { useConfigurationRestartQuery, useRestartReasonsQuery } from '@/core/react-query/init/queries';
import { useCurrentUserQuery } from '@/core/react-query/user/queries';
import { useSelector } from '@/core/store';
import toast from '@/core/toast';

import type { RestartReasonType } from '@/core/types/api/init';

const restartToastId = 'restart-required';

const getReasonLabel = (reason: RestartReasonType) => {
  switch (reason.Source) {
    case 'Configuration':
      return 'Settings';
    case 'PluginState':
      return 'Plugins';
    default:
      return reason.PluginName ?? 'A plugin';
  }
};

/**
 * The reasons a restart is needed: the restart feed's, which only admins fetch and join, and the configuration feed's
 * for everyone. Only `RestartNotice` fetches them; the prompt reads what is there.
 */
const useRestartState = (canFetchReasons = false) => {
  const reasonsQuery = useRestartReasonsQuery(canFetchReasons);
  const configurationRestartQuery = useConfigurationRestartQuery();

  const reasons = reasonsQuery.data ?? [];
  return {
    reasons,
    restartRequired: configurationRestartQuery.data || reasons.length > 0,
  };
};

const RestartReasonsMessage = () => {
  const { reasons } = useRestartState();

  return (
    <div className="flex flex-col gap-y-1">
      A restart is pending. Please restart the application.
      {reasons.length > 0 && (
        <ul className="list-disc pl-4">
          {reasons.map(reason => (
            <li key={`${reason.Source}-${reason.PluginID}-${reason.Key}`}>
              <span className="font-semibold">{getReasonLabel(reason)}</span>
              {`: ${reason.Description}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Shows the restart prompt while the server needs a restart, and again when the reasons change. */
const RestartNotice = () => {
  // A user cached from before a logout is fetched again before it counts.
  const currentUserQuery = useCurrentUserQuery();
  const isAdmin = (currentUserQuery.isFetchedAfterMount || !currentUserQuery.isFetching)
    && (currentUserQuery.data?.IsAdmin ?? false);
  const { reasons, restartRequired } = useRestartState(isAdmin);
  const isIdle = useSelector(state => state.serverLifecycle.action === 'idle');
  const reasonKeys = reasons.map(reason => `${reason.Source}-${reason.PluginID}-${reason.Key}`).join(',');
  // The reasons last shown, so a closed prompt only comes back once they change.
  const shownReasonKeys = useRef<string | null>(null);

  useEffect(() => {
    // Suppress during a user-initiated restart/shutdown; StatusPage is the canonical UX then
    if (!isIdle) return;
    if (!restartRequired) {
      toast.dismiss(restartToastId);
      shownReasonKeys.current = null;
      return;
    }
    if (toast.isActive(restartToastId) || shownReasonKeys.current === reasonKeys) return;
    shownReasonKeys.current = reasonKeys;
    toast.info('Restart required!', <RestartReasonsMessage />, {
      autoClose: false,
      position: 'top-right',
      toastId: restartToastId,
    });
  }, [isIdle, reasonKeys, restartRequired]);

  return null;
};

export default RestartNotice;
