import { useEffect } from 'react';

import { useRestartReasonsQuery } from '@/core/react-query/init/queries';
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

const getReasonKey = (reason: RestartReasonType) => `${reason.Source}-${reason.PluginID}-${reason.Key}`;

const RestartReasonsMessage = () => {
  // RestartNotice and SignalR fetches the reasons; the prompt reads what is there.
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

const RestartNotice = () => {
  const reasons = useRestartReasonsQuery(true).data ?? [];
  const restartRequired = reasons.length > 0;
  const isIdle = useSelector(state => state.serverLifecycle.action === 'idle');

  useEffect(() => {
    if (!isIdle || !restartRequired) {
      toast.dismiss(restartToastId);
      shownReasonKeys.current = null;
      return;
    }
    if (toast.isActive(restartToastId)) return;
    toast.info('Restart required!', <RestartReasonsMessage />, {
      autoClose: false,
      position: 'top-right',
      toastId: restartToastId,
    });
  }, [isIdle, restartRequired]);

  return null;
};

export default RestartNotice;
