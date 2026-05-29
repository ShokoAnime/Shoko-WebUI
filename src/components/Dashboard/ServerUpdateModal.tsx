import React from 'react';

import UpdateModal from '@/components/Dashboard/UpdateModal';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useServerUpdateCheckQuery } from '@/core/react-query/webui/queries';

type Props = {
  onClose: () => void;
  show: boolean;
};

const ServerUpdateModal = ({ onClose, show }: Props) => {
  const { data: versionData } = useVersionQuery();
  const settingsQuery = useSettingsQuery();
  const { serverUpdateChannel } = settingsQuery.data.WebUI_Settings;

  const { data: updateCheckData } = useServerUpdateCheckQuery(
    { channel: serverUpdateChannel, force: false },
    show && settingsQuery.isSuccess,
  );

  return (
    <UpdateModal
      currentVersion={versionData?.Server.Version}
      handleUpdate={onClose}
      latestVersion={updateCheckData?.Version}
      onClose={onClose}
      show={show}
      type="Server"
      updatePending={false}
      updateSuccess={false}
    >
      {updateCheckData?.Description ?? 'No changelog available!'}
    </UpdateModal>
  );
};

export default ServerUpdateModal;
