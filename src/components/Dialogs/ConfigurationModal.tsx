import React from 'react';

import DynamicConfiguration from '@/components/Configuration/DynamicConfiguration';
import ModalPanel from '@/components/Panels/ModalPanel';

type Props = {
  show: boolean;
  configGuid: string | undefined | null;
  title: string | undefined;
  description: string | undefined | null;
  onClose: () => void;
};

function ConfigurationModal(props: Props) {
  const { configGuid, description, onClose, show, title } = props;
  return (
    <ModalPanel
      show={configGuid != null && show}
      onRequestClose={onClose}
      header={title}
      subHeader={description ?? undefined}
      size="md"
      overlayClassName="!z-[90]"
    >
      <DynamicConfiguration configGuid={configGuid} />
    </ModalPanel>
  );
}

export default ConfigurationModal;
