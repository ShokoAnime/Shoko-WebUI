import React, { useEffect } from 'react';

import DynamicConfiguration from '@/components/Configuration/DynamicConfiguration';
import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  show: boolean;
  configGuid: string | undefined | null;
  title: string | undefined;
  description: string | undefined | null;
  onClose: () => void;
};

function ConfigurationModal(props: Props) {
  const { configGuid, description, onClose, show, title } = props;

  const onKeyboard = useEventCallback((event: KeyboardEvent) => {
    if (!show) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      onClose();
    }
  });

  useEffect(() => {
    if (show) {
      window.addEventListener('keydown', onKeyboard);
    }
    return () => {
      if (!show) return;
      window.removeEventListener('keydown', onKeyboard);
    };
  }, [onKeyboard, show]);

  return (
    <ModalPanel
      show={configGuid != null && show}
      onRequestClose={onClose}
      header={title}
      subHeader={description ?? undefined}
      size="md"
      shouldCloseOnEsc={false}
      overlayClassName="!z-[90]"
    >
      <DynamicConfiguration configGuid={configGuid} onSave={onClose} />
    </ModalPanel>
  );
}

export default ConfigurationModal;
