import { useState } from 'react';
import { Navigate } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import PluginManagementSections from '@/components/Settings/PluginManagement/PluginManagementSections';
import PluginRestartPanel from '@/components/Settings/PluginManagement/PluginRestartPanel';
import PluginUpdateSettingsButton from '@/components/Settings/PluginManagement/PluginUpdateSettingsButton';
import ToastContainer from '@/components/ToastContainer';
import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { useSelector } from '@/core/store';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { PluginManagementSectionType } from '@/components/Settings/PluginManagement/PluginManagementSections.utils';

const STATUS_POLL_INTERVAL_MS = 15_000;

// Plugin management for a server that failed to start, reached from the status page. No login is needed then.
const PluginManagementPage = () => {
  const navigate = useNavigateVoid();
  const lifecycleAction = useSelector(state => state.serverLifecycle.action);
  const serverStatusQuery = useServerStatusQuery(STATUS_POLL_INTERVAL_MS);
  const [section, setSection] = useState<PluginManagementSectionType>('installed');

  if (serverStatusQuery.isError || lifecycleAction !== 'idle') return <Navigate to="/webui/status" replace />;

  if (serverStatusQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={4} />
      </div>
    );
  }

  const { StartupMessage: startupMessage, State: serverState } = serverStatusQuery.data;
  if (serverState === 'Started') return <Navigate to="/webui/settings/plugin-management" replace />;
  if (serverState === 'Waiting') return <Navigate to="/webui/firstrun/plugins" replace />;
  if (serverState !== 'Failed') return <Navigate to="/webui/status" replace />;

  return (
    <>
      <title>Plugin Management | Shoko</title>
      <ToastContainer toastPosition="bottom-right" />
      <div className="flex w-full justify-center">
        <div className="flex size-full max-w-7xl p-6">
          <div className="flex grow flex-col gap-y-6 overflow-y-auto rounded-lg border border-panel-border bg-panel-background-transparent p-6">
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">Plugin Management</div>
                <div className="flex items-center gap-2">
                  <PluginUpdateSettingsButton />
                  <Button buttonType="secondary" buttonSize="normal" onClick={() => navigate('/webui/status')}>
                    Back to Status
                  </Button>
                </div>
              </div>
              <div>
                Shoko failed to start. If a plugin is the cause, disable, update or uninstall it here, then restart the
                server.
              </div>
            </div>

            {startupMessage && (
              <div className="rounded-lg border border-panel-text-danger px-4 py-3 whitespace-pre-wrap">
                {startupMessage}
              </div>
            )}

            <PluginRestartPanel>
              Changes to plugins take effect once the server is restarted.
            </PluginRestartPanel>

            <div className="border-b border-panel-border" />

            <PluginManagementSections section={section} onSectionChange={setSection} />
          </div>
        </div>
        <div className="login-image-default fixed top-0 left-0 -z-10 size-full opacity-20" />
      </div>
    </>
  );
};

export default PluginManagementPage;
