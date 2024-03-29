import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';
import { cloneDeep, toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setLayoutEditMode } from '@/core/slices/mainpage';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  onClose: () => void;
  show: boolean;
};

const Title = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch();

  const handleEdit = useEventCallback(() => {
    dispatch(setLayoutEditMode(true));
    onClose();
  });

  return (
    <div className="flex items-center justify-between text-xl font-semibold">
      Display Settings
      <Button
        onClick={handleEdit}
        buttonType="primary"
        buttonSize="normal"
      >
        Enable Edit Mode
      </Button>
    </div>
  );
};

const DashboardSettingsModal = ({ onClose, show }: Props) => {
  const dispatch = useDispatch();

  const settings = useSettingsQuery().data;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('widgets');

  useEffect(() => {
    setNewSettings(settings);
  }, [dispatch, settings]);

  const {
    combineContinueWatching,
    hideCollectionStats,
    hideContinueWatching,
    hideImportFolders,
    hideMediaType,
    hideNextUp,
    hideQueueProcessor,
    hideR18Content,
    hideRecentlyImported,
    hideRecommendedAnime,
    hideShokoNews,
    hideUnrecognizedFiles,
    hideUpcomingAnime,
    recentlyImportedEpisodesCount,
    recentlyImportedSeriesCount,
    shokoNewsPostsCount,
  } = newSettings.WebUI_Settings.dashboard;

  const updateSetting = (key: keyof typeof settings.WebUI_Settings.dashboard, value: boolean | number) => {
    const tempSettings = cloneDeep(newSettings);
    if (
      key === 'recentlyImportedEpisodesCount' || key === 'recentlyImportedSeriesCount' || key === 'shokoNewsPostsCount'
    ) {
      tempSettings.WebUI_Settings.dashboard[key] = value as number;
    } else {
      tempSettings.WebUI_Settings.dashboard[key] = value as boolean;
    }
    setNewSettings(tempSettings);
  };

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
      header={<Title onClose={onClose} />}
      size="md"
      noPadding
      noGap
    >
      <div className="flex h-[22rem] flex-row gap-x-6 p-6">
        <div className="flex shrink-0 flex-col gap-y-6 font-semibold">
          <div className="flex flex-col gap-y-1">
            <div
              className={cx(
                activeTab === 'widgets'
                  ? 'w-[12rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                  : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer',
              )}
              key="widgets"
              onClick={() => setActiveTab('widgets')}
            >
              Available Widgets
            </div>
            <div
              className={cx(
                activeTab === 'options'
                  ? 'w-[12rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                  : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer',
              )}
              key="options"
              onClick={() => setActiveTab('options')}
            >
              Display Options
            </div>
          </div>
        </div>
        <div className="border-r border-panel-border" />
        <div className="flex w-full flex-col gap-y-6">
          {activeTab === 'widgets' && (
            <div className="overflow-y-scroll pr-4">
              <div className="flex flex-col gap-y-2 ">
                <Checkbox
                  justify
                  label="Hide Queue Processor"
                  id="hide-queue-processor"
                  isChecked={hideQueueProcessor}
                  onChange={event => updateSetting('hideQueueProcessor', event.target.checked)}
                />
                <Checkbox
                  justify
                  label="Hide Unrecognized Files"
                  id="hide-unrecognized-files"
                  isChecked={hideUnrecognizedFiles}
                  onChange={event => updateSetting('hideUnrecognizedFiles', event.target.checked)}
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
                  label="Hide Collection Statistics"
                  id="hide-collection-stats"
                  isChecked={hideCollectionStats}
                  onChange={event => updateSetting('hideCollectionStats', event.target.checked)}
                />
                <Checkbox
                  justify
                  label="Hide Media Type"
                  id="hide-media-type"
                  isChecked={hideMediaType}
                  onChange={event => updateSetting('hideMediaType', event.target.checked)}
                />
                <Checkbox
                  justify
                  label="Hide Import Folders"
                  id="hide-import-folders"
                  isChecked={hideImportFolders}
                  onChange={event => updateSetting('hideImportFolders', event.target.checked)}
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
                  label="Hide Continue Watching"
                  id="hide-continue-watching"
                  isChecked={hideContinueWatching}
                  disabled={combineContinueWatching && true}
                  onChange={event => updateSetting('hideContinueWatching', event.target.checked)}
                />
                <Checkbox
                  justify
                  label="Hide Next Up"
                  id="hide-next-up"
                  isChecked={hideNextUp}
                  disabled={combineContinueWatching && true}
                  onChange={event => updateSetting('hideNextUp', event.target.checked)}
                />
                <Checkbox
                  justify
                  label="Hide Upcoming Anime"
                  id="hide-upcoming-anime"
                  isChecked={hideUpcomingAnime}
                  onChange={event => updateSetting('hideUpcomingAnime', event.target.checked)}
                />
                <Checkbox
                  justify
                  label="Hide Recommended Anime"
                  id="hide-recommended-anime"
                  isChecked={hideRecommendedAnime}
                  onChange={event => updateSetting('hideRecommendedAnime', event.target.checked)}
                />
              </div>
            </div>
          )}

          {activeTab === 'options' && (
            <div className="flex flex-col gap-y-2">
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
                  className="w-14 px-2 py-0.5 text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                Recently Imported Episodes
                <InputSmall
                  id="recently-imported-files"
                  type="number"
                  value={Math.min(Number(recentlyImportedEpisodesCount), 100)}
                  onChange={event =>
                    updateSetting('recentlyImportedEpisodesCount', Math.min(Number(event.target.value), 100))}
                  className="w-14 px-2 py-0.5 text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                Recently Imported Series
                <InputSmall
                  id="recently-imported-series"
                  type="number"
                  value={Math.min(Number(recentlyImportedSeriesCount), 100)}
                  onChange={event =>
                    updateSetting('recentlyImportedSeriesCount', Math.min(Number(event.target.value), 100))}
                  className="w-14 px-2 py-0.5 text-center"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-x-3 rounded-b-lg border-t border-panel-border bg-panel-background-alt p-6 font-semibold">
        <Button onClick={handleCancel} buttonType="secondary" buttonSize="normal">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          buttonSize="normal"
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default DashboardSettingsModal;
