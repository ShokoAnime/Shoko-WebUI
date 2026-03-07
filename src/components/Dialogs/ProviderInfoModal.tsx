import React from 'react';

import ModalPanel from '@/components/Panels/ModalPanel';
import useKeyboardBindings from '@/hooks/useKeyboardBindings';

import type { HashProviderInfoType } from '@/core/react-query/hashing/types';
import type { ReleaseProviderInfoType } from '@/core/react-query/release-info/types';

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
      show={show}
      onRequestClose={onClose}
      header={provider?.Name}
      shouldCloseOnEsc={false}
      subHeader={`v${provider?.Version}`}
      size="md"
      overlayClassName="!z-[90]"
    >
      <div className="whitespace-pre-wrap">{provider?.Description?.replaceAll('\n', '\n\n')}</div>
    </ModalPanel>
  );
};

export default ProviderInfoModal;
