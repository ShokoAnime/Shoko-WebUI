import React, { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { produce } from 'immer';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import ReleaseManagementSettings from '@/components/Settings/HashingAndReleaseSettings/ReleaseManagementSettings';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ReleaseComparisonPreferencesType } from '@/core/types/api/settings';

type Props = {
  show: boolean;
  onClose: () => void;
};

const ReleaseManagementSettingsModal = ({ onClose, show }: Props) => {
  const settings = useSettingsQuery().data;
  const { isPending, mutate: patchSettings } = usePatchSettingsMutation();

  const [preferences, setPreferences] = useState<ReleaseComparisonPreferencesType>(
    settings.ReleaseComparisonPreferences,
  );

  useEffect(() => {
    if (!show) return;
    setPreferences(settings.ReleaseComparisonPreferences);
  }, [show, settings.ReleaseComparisonPreferences]);

  const handleSave = () => {
    const newSettings = produce(settings, (draft) => {
      draft.ReleaseComparisonPreferences = preferences;
    });
    patchSettings(newSettings, { onSuccess: () => onClose() });
  };

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', onClose, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="Release Management Settings"
      size="md"
      footer={(
        <div className="flex justify-end gap-x-3">
          <Button onClick={onClose} buttonType="secondary" buttonSize="normal">
            Cancel
          </Button>
          <Button onClick={handleSave} buttonType="primary" buttonSize="normal" loading={isPending}>
            Save
          </Button>
        </div>
      )}
    >
      <ReleaseManagementSettings preferences={preferences} onChange={setPreferences} />
    </ModalPanel>
  );
};

export default ReleaseManagementSettingsModal;
