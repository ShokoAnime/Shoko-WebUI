import React from 'react';

import ModalPanel from '@/components/Panels/ModalPanel';
import useKeyboardBindings from '@/hooks/useKeyboardBindings';

import type { HashProviderInfoType } from '@/core/types/api/hashing';
import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';

type Props = {
  show: boolean;
  provider?: HashProviderInfoType | ReleaseProviderInfoType;
  onClose: () => void;
};

const ProviderInfoModal = (props: Props) => {
  const { onClose, provider, show } = props;

  useKeyboardBindings(show, { Escape: onClose, Enter: onClose });

  return (
    <ModalPanel
      show={!!provider && show}
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
};

export default ProviderInfoModal;
