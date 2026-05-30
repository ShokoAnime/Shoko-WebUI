import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import DynamicConfiguration from '@/components/Configuration/DynamicConfiguration';
import ModalPanel from '@/components/Panels/ModalPanel';

type Props = {
  show: boolean;
  configGuid: string | undefined | null;
  title: string | undefined;
  description: string | undefined | null;
  onClose: () => void;
};

const ConfigurationModal = (props: Props) => {
  const { configGuid, description, onClose, show, title } = props;

  useHotkeys('escape', onClose, { scopes: 'nested-modal' });

  return (
    <ModalPanel
      show={configGuid != null && show}
      onRequestClose={onClose}
      header={title}
      subHeader={description ?? undefined}
      size="md"
      shouldCloseOnEsc={false}
    >
      <DynamicConfiguration configGuid={configGuid} onSave={onClose} />
    </ModalPanel>
  );
};

export default ConfigurationModal;
