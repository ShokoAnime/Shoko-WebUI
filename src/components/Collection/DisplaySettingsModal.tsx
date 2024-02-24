import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { produce } from 'immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  show: boolean;
  onClose(): void;
};

const DisplaySettingsModal = ({ onClose, show }: Props) => {
  const dispatch = useDispatch();

  const settings = useSettingsQuery().data;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(settings);

  useEffect(() => {
    setNewSettings(settings);
  }, [dispatch, settings]);

  const { list: listSettings, poster: posterSettings } = newSettings.WebUI_Settings.collection;

  const handleSettingChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const [type, key] = event.target.id.split('-') as [type: 'poster' | 'list', key: string];
    const tempSettings = produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection[type][key] = event.target.checked;
    });
    setNewSettings(tempSettings);
  });

  const handleSave = useEventCallback(() => {
    patchSettings({ newSettings }, {
      onSuccess: () => onClose(),
    });
  });

  const handleCancel = useEventCallback(() => {
    setNewSettings(settings);
    onClose();
  });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="Display Settings"
      size="sm"
    >
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-4">
          <div className="border-b border-panel-border pb-4 font-semibold">Poster View Options</div>
          <div className="flex flex-col gap-y-2">
            <Checkbox
              justify
              label="Total Episodes"
              id="poster-showEpisodeCount"
              isChecked={posterSettings.showEpisodeCount}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Group Indicator"
              id="poster-showGroupIndicator"
              isChecked={posterSettings.showGroupIndicator}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Unwatched Epsiode Count"
              id="poster-showUnwatchedCount"
              isChecked={posterSettings.showUnwatchedCount}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Random Posters on Load"
              id="poster-showRandomPoster"
              isChecked={posterSettings.showRandomPoster}
              onChange={handleSettingChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <div className="border-b border-panel-border pb-4 font-semibold">List View Options</div>
          <div className="flex flex-col gap-2">
            <Checkbox
              justify
              label="Item Type"
              id="list-showItemType"
              isChecked={listSettings.showItemType}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Group Indicator"
              id="list-showGroupIndicator"
              isChecked={listSettings.showGroupIndicator}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Top Tags"
              id="list-showTopTags"
              isChecked={listSettings.showTopTags}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Custom Tags"
              id="list-showCustomTags"
              isChecked={listSettings.showCustomTags}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Random Posters on Load"
              id="list-showRandomPoster"
              isChecked={listSettings.showRandomPoster}
              onChange={handleSettingChange}
            />
          </div>
        </div>

        <div className="flex justify-end gap-x-3 font-semibold">
          <Button onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
          <Button
            onClick={handleSave}
            buttonType="primary"
            className="px-6 py-2"
          >
            Save
          </Button>
        </div>
      </div>
    </ModalPanel>
  );
};

export default DisplaySettingsModal;
