import React, { useEffect } from 'react';

import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

import type { HashProviderInfoType } from '@/core/types/api/hashing';
import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';

type Props = {
  show: boolean;
  provider: HashProviderInfoType | ReleaseProviderInfoType | null;
  onClose: () => void;
};

function ProviderInfoModal(props: Props) {
  const { onClose, provider, show } = props;

  const onKeyboard = useEventCallback((event: KeyboardEvent) => {
    if (!show) return;
    if (event.key === 'Escape' || event.key === 'Enter') {
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
      show={provider != null && show}
      onRequestClose={onClose}
      header={provider?.Name}
      shouldCloseOnEsc={false}
      subHeader={`v${provider?.Version}`}
      size="md"
      overlayClassName="!z-[90]"
    >
      {provider?.Description?.split(/\r\n|\n|\r/g).map((line, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <p key={index}>{line}</p>
      ))}
    </ModalPanel>
  );
}

export default ProviderInfoModal;
