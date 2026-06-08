import React, { useState } from 'react';
import { produce } from 'immer';
import { isEqual, toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import UpdateFrequencyValues from '@/components/Settings/UpdateFrequencyValues';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { convertMsToTimeSpan, convertTimeSpanToMs, dayjs } from '@/core/util';

import type { PluginUpdatesSettingsType, SettingsUpdateFrequencyType } from '@/core/types/api/settings';

type Props = {
  onClose: () => void;
  show: boolean;
};

const PluginUpdateSettingsModal = ({ onClose, show }: Props) => {
  const settings = useSettingsQuery().data;
  const versionQuery = useVersionQuery();
  const { isPending: isSavePending, mutate: patchSettings } = usePatchSettingsMutation();

  const isDevChannel = versionQuery.data?.Server.ReleaseChannel !== 'Stable';

  const [updatesSettings, setUpdatesSettings] = useState(settings.Plugins.Updates);

  const unsavedChanges = !isEqual(settings.Plugins.Updates, updatesSettings);

  const {
    AutoUpdateFrequency,
    InactivePluginVersionRetention,
    IsAutoSyncEnabled,
    IsAutoUpgradeEnabled,
  } = updatesSettings;

  const updateUpdatesSetting = <Key extends keyof PluginUpdatesSettingsType>(
    key: Key,
    value: PluginUpdatesSettingsType[Key],
  ) => {
    setUpdatesSettings(produce(updatesSettings, (draft) => {
      draft[key] = value;
    }));
  };

  const handleCancel = () => {
    setUpdatesSettings(settings.Plugins.Updates);
    onClose();
  };

  const handleSave = () => {
    const newSettings = produce(settings, (draft) => {
      draft.Plugins.Updates = updatesSettings;
    });

    patchSettings(newSettings, { onSuccess: () => onClose() });
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="Plugin Update Settings"
      size="sm"
      footer={
        <div className="flex justify-end gap-x-3 font-semibold">
          <Button onClick={handleCancel} buttonType="secondary" buttonSize="normal">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            buttonType="primary"
            buttonSize="normal"
            loading={isSavePending}
            disabled={!unsavedChanges}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-y-6">
        {isDevChannel && (
          <>
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center justify-between">
                <span>Update Frequency</span>
                <SelectSmall
                  id="auto-update-frequency"
                  value={AutoUpdateFrequency}
                  onChange={event =>
                    updateUpdatesSetting(
                      'AutoUpdateFrequency',
                      toNumber(event.target.value) as SettingsUpdateFrequencyType,
                    )}
                >
                  <UpdateFrequencyValues min24Hours />
                </SelectSmall>
              </div>
            </div>

            <div className="border-b border-panel-border" />
          </>
        )}

        <div className="flex items-center font-semibold">Plugin Updates</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label="Automatically Sync Repositories"
            id="is-auto-sync-enabled"
            isChecked={IsAutoSyncEnabled}
            onChange={event => updateUpdatesSetting('IsAutoSyncEnabled', event.target.checked)}
          />
          <Checkbox
            justify
            label="Automatically Upgrade Plugins"
            id="is-auto-upgrade-enabled"
            isChecked={IsAutoUpgradeEnabled}
            onChange={event => updateUpdatesSetting('IsAutoUpgradeEnabled', event.target.checked)}
          />
          <div className="flex items-center justify-between">
            <span>Inactive Version Retention</span>
            <SelectSmall
              id="inactive-plugin-version-retention"
              value={Math.round(dayjs.duration(convertTimeSpanToMs(InactivePluginVersionRetention)).asDays())}
              onChange={event =>
                updateUpdatesSetting(
                  'InactivePluginVersionRetention',
                  convertMsToTimeSpan(dayjs.duration(toNumber(event.target.value), 'days').asMilliseconds()),
                )}
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={180}>180 Days</option>
              <option value={365}>1 Year</option>
            </SelectSmall>
          </div>
        </div>
      </div>
    </ModalPanel>
  );
};

export default PluginUpdateSettingsModal;
