import type { ReactNode } from 'react';
import { map } from 'lodash';

import Button from '@/components/Input/Button';
import InsetPanel from '@/components/Panels/InsetPanel';
import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { usePluginsQuery } from '@/core/react-query/plugin/queries';
import useServerLifecycleActions from '@/hooks/useServerLifecycleActions';

type Props = {
  children: ReactNode;
  // Where to come back to when the restarted server is in first-run setup again.
  returnTo?: string;
};

// Says that plugin changes need a restart and offers what the server allows: restart, shutdown, or doing it by hand.
const PluginRestartPanel = ({ children, returnTo }: Props) => {
  const serverStatusQuery = useServerStatusQuery();
  const pendingPluginsQuery = usePluginsQuery({ allVersions: true, restartPending: 'only' });
  const { isRestarting, isShuttingDown, restart, shutdown } = useServerLifecycleActions(returnTo);

  const canRestart = serverStatusQuery.data?.CanRestart ?? false;
  const canShutdown = serverStatusQuery.data?.CanShutdown ?? false;
  const pendingNames = map(pendingPluginsQuery.data, plugin => `${plugin.Name} ${plugin.Version}`);

  return (
    <InsetPanel className="flex items-center justify-between gap-x-4 p-4">
      <div className="flex flex-col gap-y-1">
        <div>{children}</div>
        {pendingNames.length > 0 && (
          <div className="font-semibold text-panel-text-warning">
            Waiting for a restart:&nbsp;
            {pendingNames.join(', ')}
          </div>
        )}
        {!canRestart && (
          <div className="text-sm opacity-65">
            {canShutdown
              ? 'This server cannot restart itself. Shut it down here, then start it again by hand.'
              : 'This server cannot be restarted or shut down from here. Restart Shoko Server by hand.'}
          </div>
        )}
      </div>
      {(canRestart || canShutdown) && (
        <div className="flex shrink-0 gap-x-2">
          {canShutdown && (
            <Button
              buttonType={canRestart ? 'secondary' : 'primary'}
              buttonSize="normal"
              disabled={isRestarting}
              loading={isShuttingDown}
              onClick={() => {
                shutdown().catch(console.error);
              }}
            >
              Shut Down
            </Button>
          )}
          {canRestart && (
            <Button
              buttonType="primary"
              buttonSize="normal"
              disabled={isShuttingDown}
              loading={isRestarting}
              onClick={() => {
                restart().catch(console.error);
              }}
            >
              Restart Server
            </Button>
          )}
        </div>
      )}
    </InsetPanel>
  );
};

export default PluginRestartPanel;
