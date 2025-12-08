import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { produce } from 'immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

type Props = {
  show: boolean;
  onClose: () => void;
};

const DisplaySettingsModal = ({ onClose, show }: Props) => {
  const dispatch = useDispatch();

  const settings = useSettingsQuery().data;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(settings);

  useEffect(() => {
    setNewSettings(settings);
  }, [dispatch, settings]);

  const {
    anidb: anidbSettings,
    image: imageSettings,
    list: listSettings,
    poster: posterSettings,
  } = newSettings.WebUI_Settings.collection;

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [type, key] = event.target.id.split('-') as [type: 'poster' | 'list' | 'image', key: string];
    const tempSettings = produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection[type][key] = event.target.checked;
    });
    setNewSettings(tempSettings);
  };

  const handleSave = () => {
    patchSettings({ newSettings }, {
      onSuccess: () => onClose(),
    });
  };

  const handleCancel = () => {
    setNewSettings(settings);
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="Display Settings"
      size="sm"
      noPadding
      noGap
    >
      <div className="flex max-h-96 flex-col gap-y-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-y-4">
          <div className="font-semibold">Poster View Options</div>
          <div className="flex flex-col gap-y-1">
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
              label="Unwatched Episode Count"
              id="poster-showUnwatchedCount"
              isChecked={posterSettings.showUnwatchedCount}
              onChange={handleSettingChange}
            />
          </div>
        </div>

        <div className="border-b border-panel-border" />

        <div className="flex flex-col gap-y-4">
          <div className="font-semibold">List View Options</div>
          <div className="flex flex-col gap-1">
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
          </div>
        </div>

        <div className="border-b border-panel-border" />

        <div className="flex flex-col gap-y-4">
          <div className="font-semibold">Image Options</div>
          <div className="flex flex-col gap-1">
            <Checkbox
              justify
              label="Random Posters on Load"
              id="image-showRandomPoster"
              isChecked={imageSettings.showRandomPoster}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Random Backdrop on Load"
              id="image-showRandomBackdrop"
              isChecked={imageSettings.showRandomBackdrop}
              onChange={handleSettingChange}
            />
            <Checkbox
              justify
              label="Show Backdrop if Thumbnail is missing"
              id="image-useThumbnailFallback"
              isChecked={imageSettings.useThumbnailFallback}
              onChange={handleSettingChange}
            />
          </div>
        </div>

        <div className="border-b border-panel-border" />

        <div className="flex flex-col gap-y-4">
          <div className="font-semibold">AniDB Options</div>
          <div className="flex flex-col gap-1">
            <Checkbox
              justify
              label="Filter AniDB descriptions"
              id="anidb-filterDescription"
              isChecked={anidbSettings.filterDescription}
              onChange={handleSettingChange}
            />
          </div>
        </div>
      </div>

      <div className="rounded-b-lg border-t border-panel-border bg-panel-background-alt p-6">
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
