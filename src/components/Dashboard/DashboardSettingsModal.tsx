import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { cloneDeep, toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { setLayoutEditMode } from '@/core/slices/mainpage';
import { initialSettings } from '@/pages/settings/SettingsPage';

type Props = {
  onClose: () => void;
  show: boolean;
};

const Title = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between text-xl font-semibold">
      Display Settings
      <Button
        onClick={() => {
          dispatch(setLayoutEditMode(true));
          onClose();
        }}
        buttonType="primary"
        className="px-2 py-1 text-sm"
      >
        Enable Edit Mode
      </Button>
    </div>
  );
};

const DashboardSettingsModal = ({ onClose, show }: Props) => {
  const dispatch = useDispatch();

  const settingsQuery = useGetSettingsQuery();
  const settings = useMemo(() => settingsQuery?.data ?? initialSettings, [settingsQuery]);
  const [patchSettings] = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(initialSettings);

  useEffect(() => {
    setNewSettings(settings);
  }, [dispatch, settings]);

  const {
    combineContinueWatching,
    hideCollectionBreakdown,
    hideImportFolders,
    hideQueueProcessor,
    hideR18Content,
    hideRecentlyImported,
    hideShokoNews,
    recentlyImportedFilesCount,
    recentlyImportedSeriesCount,
    shokoNewsPostsCount,
  } = newSettings.WebUI_Settings.dashboard;

  const updateSetting = (key: keyof typeof settings.WebUI_Settings.dashboard, value: boolean | number) => {
    const tempSettings = cloneDeep(newSettings);
    if (
      key === 'recentlyImportedFilesCount' || key === 'recentlyImportedSeriesCount' || key === 'shokoNewsPostsCount'
    ) {
      tempSettings.WebUI_Settings.dashboard[key] = value as number;
    } else {
      tempSettings.WebUI_Settings.dashboard[key] = value as boolean;
    }
    setNewSettings(tempSettings);
  };

  const handleSave = async () => {
    try {
      await patchSettings({ oldSettings: settings, newSettings }).unwrap();
      onClose();
    } catch (error) { /* empty */ }
  };

  const handleCancel = () => {
    setNewSettings(initialSettings);
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      title={<Title onClose={onClose} />}
      size="sm"
    >
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-2">
          <div className="mb-2 border-b-2 border-panel-border pb-4 font-semibold">
            Available Widgets
          </div>
          <Checkbox
            justify
            label="Hide Collection Breakdown"
            id="hide-collection-breakdown"
            isChecked={hideCollectionBreakdown}
            onChange={event => updateSetting('hideCollectionBreakdown', event.target.checked)}
          />
          <Checkbox
            justify
            label="Hide Queue Processor"
            id="hide-queue-processor"
            isChecked={hideQueueProcessor}
            onChange={event => updateSetting('hideQueueProcessor', event.target.checked)}
          />
          <Checkbox
            justify
            label="Hide Recently Imported"
            id="hide-recently-imported"
            isChecked={hideRecentlyImported}
            onChange={event => updateSetting('hideRecentlyImported', event.target.checked)}
          />
          <Checkbox
            justify
            label="Hide Shoko News"
            id="hide-shoko-news"
            isChecked={hideShokoNews}
            onChange={event => updateSetting('hideShokoNews', event.target.checked)}
          />
          <Checkbox
            justify
            label="Hide Import Folders"
            id="hide-import-folders"
            isChecked={hideImportFolders}
            onChange={event => updateSetting('hideImportFolders', event.target.checked)}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <div className="mb-2 border-b-2 border-panel-border pb-4 font-semibold">
            Display Options
          </div>
          <Checkbox
            justify
            label="Combine Continue Watching & Next Up"
            id="combine-continue-watching"
            isChecked={combineContinueWatching}
            onChange={event => updateSetting('combineContinueWatching', event.target.checked)}
          />
          <Checkbox
            justify
            label="Hide R18 Content"
            id="hide-r18-content"
            isChecked={hideR18Content}
            onChange={event => updateSetting('hideR18Content', event.target.checked)}
          />
          <div className="flex items-center justify-between">
            Shoko News Posts
            <InputSmall
              id="shoko-news-posts"
              type="number"
              value={shokoNewsPostsCount}
              onChange={event => updateSetting('shokoNewsPostsCount', toNumber(event.target.value))}
              className="w-12 px-2 py-0.5 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            Recently Imported Files
            <InputSmall
              id="recently-imported-files"
              type="number"
              value={recentlyImportedFilesCount}
              onChange={event => updateSetting('recentlyImportedFilesCount', toNumber(event.target.value))}
              className="w-12 px-2 py-0.5 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            Recently Imported Series
            <InputSmall
              id="recently-imported-series"
              type="number"
              value={recentlyImportedSeriesCount}
              onChange={event => updateSetting('recentlyImportedSeriesCount', toNumber(event.target.value))}
              className="w-12 px-2 py-0.5 text-center"
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

export default DashboardSettingsModal;
