/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import UpdateFrequencyValues from '@/components/Settings/UpdateFrequencyValues';
import toast from '@/components/Toast';
import { useAniDBTestLoginMutation } from '@/core/react-query/settings/mutations';
import useSettingsContext from '@/hooks/useSettingsContext';

const AniDBSettings = () => {
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
      onSuccess: () => toast.success('AniDB Login Successful!'),
      onError: () => toast.error('Incorrect Username/Password!'),
    });
  };

  const validateAndSaveRelationDepth = (depth: string) => {
    if (parseInt(depth, 10) < 0 || parseInt(depth, 10) > 5) {
      toast.error('Max Relation Depth may only be between 0 and 5');
    } else updateSetting('AniDb', 'MaxRelationDepth', depth);
  };

  return (
    <>
      <title>Settings &gt; AniDB | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">AniDB</div>
        <div>
          Configure the information Shoko retrieves from AniDB for the series in your collection, and set your
          preferences for MyList options and the general updating of AniDB data.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="mt-0.5 flex flex-col gap-y-6">
        <div className="flex justify-between">
          <div className="items-center font-semibold">Login Options</div>
          <Button
            onClick={() => testLogin()}
            loading={isAnidbLoginPending}
            buttonType="primary"
            buttonSize="small"
          >
            Test
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between">
            Username
            <InputSmall
              id="username"
              value={Username}
              type="text"
              onChange={event => updateSetting('AniDb', 'Username', event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            Password
            <InputSmall
              id="password"
              value={Password}
              type="password"
              onChange={event => updateSetting('AniDb', 'Password', event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            AVDump Key
            <InputSmall
              id="avdump-key"
              value={AVDumpKey ?? ''}
              type="password"
              onChange={event => updateSetting('AniDb', 'AVDumpKey', event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            HTTP Server URL
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
        <div className="flex items-center font-semibold">Download Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label="Character Images"
            id="character-images"
            isChecked={DownloadCharacters}
            onChange={event => updateSetting('AniDb', 'DownloadCharacters', event.target.checked)}
          />
          <Checkbox
            justify
            label="Creator Images"
            id="creator-images"
            isChecked={DownloadCreators}
            onChange={event => updateSetting('AniDb', 'DownloadCreators', event.target.checked)}
          />
          <Checkbox
            justify
            label="Release Groups"
            id="release-groups"
            isChecked={DownloadReleaseGroups}
            onChange={event => updateSetting('AniDb', 'DownloadReleaseGroups', event.target.checked)}
          />
          <Checkbox
            justify
            label="Always Download Related Anime"
            id="related-anime"
            isChecked={DownloadRelatedAnime}
            onChange={event => updateSetting('AniDb', 'DownloadRelatedAnime', event.target.checked)}
          />
          <div className="flex items-center justify-between transition-opacity">
            Related Depth
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
        <div className="flex items-center font-semibold">Mylist Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label="Add Files"
            id="add-files"
            isChecked={MyList_AddFiles}
            onChange={event => updateSetting('AniDb', 'MyList_AddFiles', event.target.checked)}
          />
          <Checkbox
            justify
            label="Read Watched"
            id="read-watched"
            isChecked={MyList_ReadWatched}
            onChange={event => updateSetting('AniDb', 'MyList_ReadWatched', event.target.checked)}
          />
          <Checkbox
            justify
            label="Read Unwatched"
            id="read-unwatched"
            isChecked={MyList_ReadUnwatched}
            onChange={event => updateSetting('AniDb', 'MyList_ReadUnwatched', event.target.checked)}
          />
          <Checkbox
            justify
            label="Set Watched"
            id="set-watched"
            isChecked={MyList_SetWatched}
            onChange={event => updateSetting('AniDb', 'MyList_SetWatched', event.target.checked)}
          />
          <Checkbox
            justify
            label="Set Unwatched"
            id="set-unwatched"
            isChecked={MyList_SetUnwatched}
            onChange={event => updateSetting('AniDb', 'MyList_SetUnwatched', event.target.checked)}
          />
          <div className="flex items-center justify-between">
            <span>Storage State</span>
            <SelectSmall
              id="storage-state"
              value={MyList_StorageState}
              onChange={event => updateSetting('AniDb', 'MyList_StorageState', event.target.value)}
            >
              <option value={0}>Unknown</option>
              <option value={1}>HDD</option>
              <option value={2}>Disk</option>
              <option value={3}>Deleted</option>
              <option value={4}>Remote</option>
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>Delete Action</span>
            <SelectSmall
              id="delete-action"
              value={MyList_DeleteType}
              onChange={event => updateSetting('AniDb', 'MyList_DeleteType', event.target.value)}
            >
              <option value={0}>Delete File (AniDB)</option>
              <option value={1}>Delete File (Local)</option>
              <option value={2}>Mark Deleted</option>
              <option value={3}>Mark External (CD/DVD)</option>
              <option value={4}>Mark Unknown</option>
              <option value={5}>DVD/BD</option>
            </SelectSmall>
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Update Options</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>Calendar</span>
            <SelectSmall
              id="calendar"
              value={Calendar_UpdateFrequency}
              onChange={event => updateSetting('AniDb', 'Calendar_UpdateFrequency', event.target.value)}
            >
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>Anime Information</span>
            <SelectSmall
              id="anime-information"
              value={Anime_UpdateFrequency}
              onChange={event => updateSetting('AniDb', 'Anime_UpdateFrequency', event.target.value)}
            >
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>Files With Missing Info</span>
            <SelectSmall
              id="files-missing-info"
              value={File_UpdateFrequency}
              onChange={event => updateSetting('AniDb', 'File_UpdateFrequency', event.target.value)}
            >
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>Notifications</span>
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
            label="Handle Moved Files"
            id="handle-moved-files"
            isChecked={Notification_HandleMovedFiles}
            onChange={event => updateSetting('AniDb', 'Notification_HandleMovedFiles', event.target.checked)}
          />
        </div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
};

export default AniDBSettings;
