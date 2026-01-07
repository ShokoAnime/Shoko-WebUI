/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import UpdateFrequencyValues from '@/components/Settings/UpdateFrequencyValues';
import toast from '@/components/Toast';
import { useAniDBTestLoginMutation } from '@/core/react-query/settings/mutations';
import useSettingsContext from '@/hooks/useSettingsContext';

function AniDBSettings() {
  const { t } = useTranslation('settings');
  const { newSettings, updateSetting } = useSettingsContext();
  const { isPending: isAnidbLoginPending, mutate: testAniDbLogin } = useAniDBTestLoginMutation();

  const {
    AVDumpKey,
    Anime_UpdateFrequency,
    Calendar_UpdateFrequency,
    DownloadCharacters,
    DownloadCreators,
    DownloadRelatedAnime,
    DownloadReleaseGroups,
    File_UpdateFrequency,
    HTTPServerUrl,
    MaxRelationDepth,
    MyList_AddFiles,
    MyList_DeleteType,
    MyList_ReadUnwatched,
    MyList_ReadWatched,
    MyList_SetUnwatched,
    MyList_SetWatched,
    MyList_StorageState,
    Notification_HandleMovedFiles,
    Notification_UpdateFrequency,
    Password,
    Username,
  } = newSettings.AniDb;

  const testLogin = () => {
    testAniDbLogin({ Username, Password }, {
      onSuccess: () => toast.success(t('anidb.login.success')),
      onError: () => toast.error(t('anidb.login.error')),
    });
  };

  const validateAndSaveRelationDepth = (depth: string) => {
    if (parseInt(depth, 10) < 0 || parseInt(depth, 10) > 5) {
      toast.error(t('anidb.maxRelationDepthError'));
    } else updateSetting('AniDb', 'MaxRelationDepth', depth);
  };

  return (
    <>
      <title>Settings &gt; AniDB | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">{t('anidb.title')}</div>
        <div>
          {t('anidb.description')}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="mt-0.5 flex flex-col gap-y-6">
        <div className="flex justify-between">
          <div className="items-center font-semibold">{t('anidb.login.title')}</div>
          <Button
            onClick={() => testLogin()}
            loading={isAnidbLoginPending}
            buttonType="primary"
            buttonSize="small"
          >
            {t('anidb.login.test')}
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between">
            {t('anidb.login.username')}
            <InputSmall
              id="username"
              value={Username}
              type="text"
              onChange={event => updateSetting('AniDb', 'Username', event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            {t('anidb.login.password')}
            <InputSmall
              id="password"
              value={Password}
              type="password"
              onChange={event => updateSetting('AniDb', 'Password', event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            {t('anidb.avdumpKey')}
            <InputSmall
              id="avdump-key"
              value={AVDumpKey ?? ''}
              type="password"
              onChange={event => updateSetting('AniDb', 'AVDumpKey', event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            {t('anidb.serverUrl')}
            <InputSmall
              id="http-server-url"
              value={HTTPServerUrl}
              type="text"
              onChange={event => updateSetting('AniDb', 'HTTPServerUrl', event.target.value)}
              className="w-60 px-3 py-1"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('anidb.download.title')}</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label={t('anidb.download.characterImages')}
            id="character-images"
            isChecked={DownloadCharacters}
            onChange={event => updateSetting('AniDb', 'DownloadCharacters', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('anidb.download.creatorImages')}
            id="creator-images"
            isChecked={DownloadCreators}
            onChange={event => updateSetting('AniDb', 'DownloadCreators', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('anidb.download.releaseGroups')}
            id="release-groups"
            isChecked={DownloadReleaseGroups}
            onChange={event => updateSetting('AniDb', 'DownloadReleaseGroups', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('anidb.download.alwaysDownloadRelatedAnime')}
            id="related-anime"
            isChecked={DownloadRelatedAnime}
            onChange={event => updateSetting('AniDb', 'DownloadRelatedAnime', event.target.checked)}
          />
          <div className="flex items-center justify-between transition-opacity">
            {t('anidb.download.relatedDepth')}
            <InputSmall
              id="max-relation-depth"
              value={MaxRelationDepth}
              type="number"
              onChange={event => validateAndSaveRelationDepth(event.target.value)}
              className="w-10 px-3 py-1 text-center"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('anidb.mylist.title')}</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label={t('anidb.mylist.addFiles')}
            id="add-files"
            isChecked={MyList_AddFiles}
            onChange={event => updateSetting('AniDb', 'MyList_AddFiles', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('anidb.mylist.readWatched')}
            id="read-watched"
            isChecked={MyList_ReadWatched}
            onChange={event => updateSetting('AniDb', 'MyList_ReadWatched', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('anidb.mylist.readUnwatched')}
            id="read-unwatched"
            isChecked={MyList_ReadUnwatched}
            onChange={event => updateSetting('AniDb', 'MyList_ReadUnwatched', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('anidb.mylist.setWatched')}
            id="set-watched"
            isChecked={MyList_SetWatched}
            onChange={event => updateSetting('AniDb', 'MyList_SetWatched', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('anidb.mylist.setUnwatched')}
            id="set-unwatched"
            isChecked={MyList_SetUnwatched}
            onChange={event => updateSetting('AniDb', 'MyList_SetUnwatched', event.target.checked)}
          />
          <div className="flex items-center justify-between">
            <span>{t('anidb.mylist.storageState')}</span>
            <SelectSmall
              id="storage-state"
              value={MyList_StorageState}
              onChange={event => updateSetting('AniDb', 'MyList_StorageState', event.target.value)}
            >
              <option value={0}>{t('anidb.mylist.storageOptions.0')}</option>
              <option value={1}>{t('anidb.mylist.storageOptions.1')}</option>
              <option value={2}>{t('anidb.mylist.storageOptions.2')}</option>
              <option value={3}>{t('anidb.mylist.storageOptions.3')}</option>
              <option value={4}>{t('anidb.mylist.storageOptions.4')}</option>
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('anidb.mylist.deleteType')}</span>
            <SelectSmall
              id="delete-action"
              value={MyList_DeleteType}
              onChange={event => updateSetting('AniDb', 'MyList_DeleteType', event.target.value)}
            >
              <option value={0}>{t('anidb.mylist.deleteOptions.0')}</option>
              <option value={1}>{t('anidb.mylist.deleteOptions.1')}</option>
              <option value={2}>{t('anidb.mylist.deleteOptions.2')}</option>
              <option value={3}>{t('anidb.mylist.deleteOptions.3')}</option>
              <option value={4}>{t('anidb.mylist.deleteOptions.4')}</option>
              <option value={5}>{t('anidb.mylist.deleteOptions.5')}</option>
            </SelectSmall>
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('anidb.update.title')}</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>{t('anidb.update.calendar')}</span>
            <SelectSmall
              id="calendar"
              value={Calendar_UpdateFrequency}
              onChange={event => updateSetting('AniDb', 'Calendar_UpdateFrequency', event.target.value)}
            >
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('anidb.update.animeInfo')}</span>
            <SelectSmall
              id="anime-information"
              value={Anime_UpdateFrequency}
              onChange={event => updateSetting('AniDb', 'Anime_UpdateFrequency', event.target.value)}
            >
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('anidb.update.missingFiles')}</span>
            <SelectSmall
              id="files-missing-info"
              value={File_UpdateFrequency}
              onChange={event => updateSetting('AniDb', 'File_UpdateFrequency', event.target.value)}
            >
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('anidb.update.notifications')}</span>
            <SelectSmall
              id="notifications"
              value={Notification_UpdateFrequency}
              onChange={event => updateSetting('AniDb', 'Notification_UpdateFrequency', event.target.value)}
            >
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <Checkbox
            justify
            label={t('anidb.update.handleMovedFiles')}
            id="handle-moved-files"
            isChecked={Notification_HandleMovedFiles}
            onChange={event => updateSetting('AniDb', 'Notification_HandleMovedFiles', event.target.checked)}
          />
        </div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
}

export default AniDBSettings;
