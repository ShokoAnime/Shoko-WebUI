import { useEffect, useRef } from 'react';

import { useRestartReasonsQuery } from '@/core/react-query/init/queries';
import { useSelector } from '@/core/store';
import toast from '@/core/toast';
import useFreshCurrentUser from '@/hooks/useFreshCurrentUser';

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

const getReasonKey = (reason: RestartReasonType) => `${reason.Source}-${reason.PluginID}-${reason.Key}`;

const RestartReasonsMessage = () => {
  // RestartNotice fetches the reasons; the prompt reads what is there.
  const reasons = useRestartReasonsQuery(false).data ?? [];

  return (
    <div className="flex flex-col gap-y-1">
      A restart is pending. Please restart the application.
      {reasons.length > 0 && (
        <ul className="list-disc pl-4">
          {reasons.map(reason => (
            <li key={getReasonKey(reason)}>
              <span className="font-semibold">{getReasonLabel(reason)}</span>
              {`: ${reason.Description}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Shows the restart prompt while the server needs a restart, and again when the reasons change. The reasons come from
 * the restart feed, which only admins fetch and join; the configuration feed's notice is for everyone.
 */
const RestartNotice = () => {
  const { isAdmin } = useFreshCurrentUser();
  const reasons = useRestartReasonsQuery(isAdmin).data ?? [];
  const configurationRestartRequired = useSelector(state => state.mainpage.configurationRestartRequired);
  const restartRequired = configurationRestartRequired || reasons.length > 0;
  const isIdle = useSelector(state => state.serverLifecycle.action === 'idle');
  const reasonKeys = reasons.map(getReasonKey).join(',');
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
