import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch, useSelector } from 'react-redux';

import ModalPanel from '@/components/Panels/ModalPanel';
import { hideProviderInfo } from '@/core/slices/modals/providerInfo';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { RootState } from '@/core/store';

const ProviderInfoModal = () => {
  const dispatch = useDispatch();
  const { provider, show } = useSelector((state: RootState) => state.modals.providerInfo);

  const onClose = () => dispatch(hideProviderInfo());

  useToggleModalKeybinds(true, show);
  useHotkeys(['escape', 'enter'], onClose, { scopes: 'nested-modal' });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={provider?.Name}
      subHeader={`v${provider?.Version}`}
      size="sm"
      overlayClassName="!z-[90]"
    >
      <div className="whitespace-pre-wrap">{provider?.Description?.replaceAll('\n', '\n\n')}</div>
    </ModalPanel>
  );
};

export default ProviderInfoModal;
