import React from 'react';

import UpdateModal from '@/components/Dashboard/UpdateModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useUpdateWebuiMutation } from '@/core/react-query/webui/mutations';
import { useWebuiUpdateCheckQuery } from '@/core/react-query/webui/queries';
import { getUiVersion, isDebug } from '@/core/util';
import useNavigateVoid from '@/hooks/useNavigateVoid';

type Props = {
  onClose: () => void;
  show: boolean;
};

const UpdateCompleteToast = () => {
  const navigate = useNavigateVoid();

  return (
    <div className="flex flex-col gap-y-3">
      WebUI Update Successful!
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            toast.dismiss('webui-update');
            navigate('/webui/dashboard');
            setTimeout(() => window.location.reload(), 100);
          }}
          buttonType="primary"
          className="w-full py-1.5 font-semibold"
        >
          Click Here to Reload
        </Button>
      </div>
    </div>
  );
};

const WebUIUpdateModal = ({ onClose, show }: Props) => {
  const settingsQuery = useSettingsQuery();
  const { updateChannel } = settingsQuery.data.WebUI_Settings;

  const { data: updateCheckData } = useWebuiUpdateCheckQuery(
    { channel: updateChannel, force: false },
    show && !isDebug() && settingsQuery.isSuccess,
  );

  const {
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
    mutate: updateWebui,
  } = useUpdateWebuiMutation();

  const handleUpdate = () => {
    toast.info('', 'Updating WebUI...', { autoClose: false, toastId: 'webui-updating' });

    updateWebui(updateChannel, {
      onSuccess: () => {
        toast.dismiss('webui-updating');
        toast.success('', <UpdateCompleteToast />, { autoClose: false });
        onClose();
      },
    });
  };

  return (
    <UpdateModal
      currentVersion={getUiVersion()}
      handleUpdate={handleUpdate}
      latestVersion={updateCheckData?.Version}
      onClose={onClose}
      show={show}
      type="WebUI"
      updatePending={isUpdatePending}
      updateSuccess={isUpdateSuccess}
    >
      {(updateCheckData?.Description ?? 'No changelog available!')
        .replace(/<!--.*What's Changed/gs, '')
        .replace(/ by @\w+ in https.*/g, '')}
    </UpdateModal>
  );
};

export default WebUIUpdateModal;
