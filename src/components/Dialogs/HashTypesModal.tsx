import React, { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useUpdateHashingProviderMutation } from '@/core/react-query/hashing/mutations';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { HashProviderInfoType } from '@/core/react-query/hashing/types';

type HashTypesModalProps = {
  show: boolean;
  onClose: () => void;
  provider?: HashProviderInfoType;
};

const HashTypesModal = ({ onClose, provider, show }: HashTypesModalProps) => {
  const { isPending, mutate: updateHashingProvider } = useUpdateHashingProviderMutation();

  const [enabledHashTypes, setEnabledHashTypes] = useImmer<string[]>([]);

  useEffect(() => {
    if (!show || !provider) return;
    setEnabledHashTypes(provider.EnabledHashTypes);
  }, [provider, setEnabledHashTypes, show]);

  const handleSave = () => {
    if (!show || !provider || isPending) return;
    updateHashingProvider({ id: provider.ID, settings: { EnabledHashTypes: enabledHashTypes } }, {
      onSuccess: () => onClose(),
    });
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, id } = event.target;
    if (checked) {
      setEnabledHashTypes(Array.from(new Set([...enabledHashTypes, id])));
      return;
    }

    const index = enabledHashTypes.findIndex(hashType => hashType === id);
    if (index !== -1) {
      setEnabledHashTypes((draft) => {
        draft.splice(index, 1);
      });
    }
  };

  useToggleModalKeybinds(show);
  useHotkeys('escape', onClose, { scopes: 'modal' });
  useHotkeys('enter', handleSave, { scopes: 'modal' });

  if (!provider) return null;

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={`${provider.Name} - Hash Types`}
      size="sm"
    >
      <div className="flex flex-col gap-y-4">
        Enabled Algorithms

        <div className="flex min-h-10 flex-col rounded-lg border border-panel-border bg-panel-input p-4">
          {provider.AvailableHashTypes.map(hashType => (
            <Checkbox
              key={hashType}
              id={hashType}
              label={hashType}
              labelRight
              isChecked={enabledHashTypes.includes(hashType)}
              onChange={handleToggle}
              disabled={provider.Name === 'Built-In Hasher' && hashType === 'ED2K'}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-x-3">
        <Button
          onClick={onClose}
          buttonType="secondary"
          buttonSize="normal"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          buttonSize="normal"
          loading={isPending}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default HashTypesModal;
