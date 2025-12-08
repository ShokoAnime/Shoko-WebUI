import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';
import { produce } from 'immer';
import { toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setLayoutEditMode } from '@/core/slices/mainpage';

type Props = {
  onClose: () => void;
  show: boolean;
};

const Title = React.memo(({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch();

  const handleEdit = () => {
    dispatch(setLayoutEditMode(true));
    onClose();
  };

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
});

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
    useThumbnailsForEpisodes,
  } = newSettings.WebUI_Settings.dashboard;

  const updateSetting = (key: string, value: boolean | number) => {
    const tempSettings = produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.dashboard[key] = value;
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

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSetting(
      event.target.id,
      event.target.type === 'checkbox' ? event.target.checked : Math.min(toNumber(event.target.value), 100),
    );
  };

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
                  : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer transition-colors',
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
                  : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer transition-colors',
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
                  id="hideQueueProcessor"
                  isChecked={hideQueueProcessor}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Unrecognized Files"
                  id="hideUnrecognizedFiles"
                  isChecked={hideUnrecognizedFiles}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Recently Imported"
                  id="hideRecentlyImported"
                  isChecked={hideRecentlyImported}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Collection Statistics"
                  id="hideCollectionStats"
                  isChecked={hideCollectionStats}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Media Type"
                  id="hideMediaType"
                  isChecked={hideMediaType}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Import Folders"
                  id="hideImportFolders"
                  isChecked={hideImportFolders}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Shoko News"
                  id="hideShokoNews"
                  isChecked={hideShokoNews}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Next Up"
                  id="hideNextUp"
                  isChecked={hideNextUp}
                  onChange={handleUpdate}
                />
                {!combineContinueWatching && (
                  <Checkbox
                    justify
                    label="Hide Continue Watching"
                    id="hideContinueWatching"
                    isChecked={hideContinueWatching}
                    onChange={handleUpdate}
                  />
                )}
                <Checkbox
                  justify
                  label="Hide Upcoming Anime"
                  id="hideUpcomingAnime"
                  isChecked={hideUpcomingAnime}
                  onChange={handleUpdate}
                />
                <Checkbox
                  justify
                  label="Hide Recommended Anime"
                  id="hideRecommendedAnime"
                  isChecked={hideRecommendedAnime}
                  onChange={handleUpdate}
                />
              </div>
            </div>
          )}

          {activeTab === 'options' && (
            <div className="flex flex-col gap-y-2">
              <Checkbox
                justify
                label="Combine Continue Watching & Next Up"
                id="combineContinueWatching"
                isChecked={combineContinueWatching}
                onChange={handleUpdate}
              />
              <Checkbox
                justify
                label="Use Thumbnails for Episodes"
                id="useThumbnailsForEpisodes"
                isChecked={useThumbnailsForEpisodes}
                onChange={handleUpdate}
              />
              <Checkbox
                justify
                label="Hide R18 Content"
                id="hideR18Content"
                isChecked={hideR18Content}
                onChange={handleUpdate}
              />
              <div className="flex items-center justify-between">
                Shoko News Posts
                <InputSmall
                  id="shokoNewsPostsCount"
                  type="number"
                  value={shokoNewsPostsCount}
                  onChange={handleUpdate}
                  className="w-14 px-2 py-0.5 text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                Recently Imported Episodes
                <InputSmall
                  id="recentlyImportedEpisodesCount"
                  type="number"
                  value={recentlyImportedEpisodesCount}
                  onChange={handleUpdate}
                  className="w-14 px-2 py-0.5 text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                Recently Imported Series
                <InputSmall
                  id="recentlyImportedSeriesCount"
                  type="number"
                  value={recentlyImportedSeriesCount}
                  onChange={handleUpdate}
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
