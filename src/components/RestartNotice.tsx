import { useState } from 'react';
import { mdiAlertCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { isAxiosError } from 'axios';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useServerRestartMutation } from '@/core/react-query/init/mutations';
import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { useCurrentUserQuery } from '@/core/react-query/user/queries';
import { clearAction, setAction } from '@/core/slices/serverLifecycle';
import { useDispatch, useSelector } from '@/core/store';
import toast from '@/core/toast';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { RestartReasonType } from '@/core/types/api/init';

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

const isNetworkError = (error: unknown) =>
  isAxiosError(error) && (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error');

const RestartNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();
  const reasons = useSelector(state => state.mainpage.restartReasons);
  const isIdle = useSelector(state => state.serverLifecycle.action === 'idle');
  const isAdmin = useCurrentUserQuery().data?.IsAdmin;
  const canRestart = useServerStatusQuery().data?.CanRestart;
  const { isPending: isRestarting, mutate: restartServer } = useServerRestartMutation();
  const [showModal, setShowModal] = useState(false);

  if (!isIdle || reasons.length === 0) return null;

  const closeModal = () => setShowModal(false);

  const onRestart = () => {
    dispatch(setAction('restarting'));
    restartServer(undefined, {
      onError: (error) => {
        console.error(error);
        if (isNetworkError(error)) {
          // Server likely dropped the connection mid-restart; treat as success
          navigate('/webui/status');
          return;
        }
        dispatch(clearAction());
        toast.error('Failed to restart Shoko');
      },
      onSuccess: () => navigate('/webui/status'),
    });
  };

  // Unknown (still loading) blocks the button like a known "no".
  let restartBlockedReason = '';
  if (isAdmin === undefined || canRestart === undefined) restartBlockedReason = 'Checking if Shoko can be restarted…';
  else if (!isAdmin) restartBlockedReason = 'Only administrators can restart Shoko.';
  else if (!canRestart) {
    restartBlockedReason = 'This Shoko instance cannot be restarted from the WebUI. Restart it manually.';
  }

  return (
    <>
      <div className="flex cursor-pointer items-center gap-x-2 font-semibold" onClick={() => setShowModal(true)}>
        <Icon path={mdiAlertCircleOutline} size={1} className="text-panel-text-danger" />
        <div>Restart required</div>
      </div>
      <ModalPanel
        onRequestClose={closeModal}
        show={showModal}
        size="sm"
        header={
          <div className="flex items-center gap-x-2">
            <Icon path={mdiAlertCircleOutline} size={1} className="text-panel-text-danger" />
            Restart Required!
          </div>
        }
        footer={
          <div className="flex justify-end gap-x-2">
            <Button buttonType="secondary" buttonSize="normal" onClick={closeModal}>Close</Button>
            <Button
              buttonType="danger"
              buttonSize="normal"
              onClick={onRestart}
              loading={isRestarting}
              disabled={restartBlockedReason !== ''}
              tooltip={restartBlockedReason}
            >
              Restart
            </Button>
          </div>
        }
      >
        <div>Restart the server for these changes to take effect.</div>
        <ul className="flex list-disc flex-col gap-y-1 pl-4">
          {reasons.map(reason => (
            <li key={getReasonKey(reason)}>
              <span className="font-semibold">{getReasonLabel(reason)}</span>
              {`: ${reason.Description}`}
            </li>
          ))}
        </ul>
      </ModalPanel>
    </>
  );
};

export default RestartNotice;
