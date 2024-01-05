import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { cloneDeep } from 'lodash';

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

  const updatePosterViewSetting = (key: keyof typeof settings.WebUI_Settings.collection.poster, value: boolean) => {
    const tempSettings = cloneDeep(newSettings);
    tempSettings.WebUI_Settings.collection.poster[key] = value;
    setNewSettings(tempSettings);
  };

  const updateListViewSetting = (key: keyof typeof settings.WebUI_Settings.collection.list, value: boolean) => {
    const tempSettings = cloneDeep(newSettings);
    tempSettings.WebUI_Settings.collection.list[key] = value;
    setNewSettings(tempSettings);
  };

  const { list: listSettings, poster: posterSettings } = newSettings.WebUI_Settings.collection;

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
      title="Display Settings"
      size="sm"
    >
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-4">
          <div className="border-b border-panel-border pb-4 font-semibold">Poster View Options</div>
          <div className="flex flex-col gap-y-2">
            <Checkbox
              justify
              label="Total Episodes"
              id="total-episodes"
              isChecked={posterSettings.showEpisodeCount}
              onChange={event => updatePosterViewSetting('showEpisodeCount', event.target.checked)}
            />
            <Checkbox
              justify
              label="Group Indicator"
              id="group-indicator-grid"
              isChecked={posterSettings.showGroupIndicator}
              onChange={event => updatePosterViewSetting('showGroupIndicator', event.target.checked)}
            />
            <Checkbox
              justify
              label="Unwatched Epsiode Count"
              id="unwatched-count"
              isChecked={posterSettings.showUnwatchedCount}
              onChange={event => updatePosterViewSetting('showUnwatchedCount', event.target.checked)}
            />
            <Checkbox
              justify
              label="Random Posters on Load"
              id="random-posters-grid"
              isChecked={posterSettings.showRandomPoster}
              onChange={event => updatePosterViewSetting('showRandomPoster', event.target.checked)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <div className="border-b border-panel-border pb-4 font-semibold">List View Options</div>
          <div className="flex flex-col gap-2">
            <Checkbox
              justify
              label="Item Type"
              id="item-type"
              isChecked={listSettings.showItemType}
              onChange={event => updateListViewSetting('showItemType', event.target.checked)}
            />
            <Checkbox
              justify
              label="Group Indicator"
              id="group-indicator-list"
              isChecked={listSettings.showGroupIndicator}
              onChange={event => updateListViewSetting('showGroupIndicator', event.target.checked)}
            />
            <Checkbox
              justify
              label="Top Tags"
              id="top-tags"
              isChecked={listSettings.showTopTags}
              onChange={event => updateListViewSetting('showTopTags', event.target.checked)}
            />
            <Checkbox
              justify
              label="Custom Tags"
              id="custom-tags"
              isChecked={listSettings.showCustomTags}
              onChange={event => updateListViewSetting('showCustomTags', event.target.checked)}
            />
            <Checkbox
              justify
              label="Random Posters on Load"
              id="random-posters-list"
              isChecked={listSettings.showRandomPoster}
              onChange={event => updateListViewSetting('showRandomPoster', event.target.checked)}
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
