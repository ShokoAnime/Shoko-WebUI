import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import ModalPanel from '@/components/Panels/ModalPanel';
import { hideProviderInfo } from '@/core/slices/modals/providerInfo';
import { useDispatch, useSelector } from '@/core/store';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

const ProviderInfoModal = () => {
  const dispatch = useDispatch();
  const { provider, show } = useSelector(state => state.modals.providerInfo);

  const onClose = () => dispatch(hideProviderInfo());

  useToggleModalKeybinds(show, 'nested-modal');
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
