import React from 'react';

import ModalPanel from '@/components/Panels/ModalPanel';

import type { HashProviderInfoType } from '@/core/types/api/hashing';
import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';

type Props = {
  show: boolean;
  provider: HashProviderInfoType | ReleaseProviderInfoType | null;
  onClose: () => void;
};

function ProviderInfoModal(props: Props) {
  const { onClose, provider, show } = props;
  return (
    <ModalPanel
      show={provider != null && show}
      onRequestClose={onClose}
      header={provider?.Name}
      subHeader={`v${provider?.Version}`}
      size="md"
      overlayClassName="!z-[90]"
    >
      {provider?.Description}
    </ModalPanel>
  );
}

export default ProviderInfoModal;
