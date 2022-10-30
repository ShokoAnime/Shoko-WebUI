/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { useDispatch } from 'react-redux';
import { remove } from 'lodash';
import cx from 'classnames';
import { DropResult } from 'react-beautiful-dnd';
import { Icon } from '@mdi/react';
import { mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';

import Button from '../../../components/Input/Button';
import Checkbox from '../../../components/Input/Checkbox';
import DnDList from '../../../components/DnDList/DnDList';
import InputSmall from '../../../components/Input/InputSmall';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import SelectSmall from '../../../components/Input/SelectSmall';
import { languageDescription } from '../../../components/Dialogs/LanguagesModal';
import toast from '../../../components/Toast';

import { setStatus as setLanguagesModalStatus } from '../../../core/slices/modals/languages';
import { useSettingsContext } from '../SettingsPage';
import { usePostAniDBTestLoginMutation } from '../../../core/rtkQuery/settingsApi';

function AniDBSettings() {
  const {
    fetching, newSettings, setNewSettings, updateSetting,
  } = useSettingsContext();

  const [testAniDbLoginTrigger, testAniDbLoginResult] = usePostAniDBTestLoginMutation();

  const dispatch = useDispatch();

  const {
    Anime_UpdateFrequency, AVDumpClientPort, AVDumpKey,
    Calendar_UpdateFrequency, ClientPort, DownloadCharacters,
    DownloadCreators, DownloadRelatedAnime, DownloadReviews,
    DownloadReleaseGroups, File_UpdateFrequency,
    MaxRelationDepth, MyList_AddFiles, MyList_DeleteType,
    MyList_ReadWatched, MyList_ReadUnwatched, MyList_SetWatched,
    MyList_SetUnwatched, MyList_StorageState, MyList_UpdateFrequency,
    MyListStats_UpdateFrequency, Password, Username,
  } = newSettings.AniDb;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const items = Array.from(newSettings.LanguagePreference);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    setNewSettings({ ...newSettings, LanguagePreference: items as Array<string> });
  };

  const removeLanguage = (language: string) => {
    const items = Array.from(newSettings.LanguagePreference);
    remove(items, item => item === language);
    setNewSettings({ ...newSettings, LanguagePreference: items as Array<string> });
  };

  const renderUpdateFrequencyValues = () => (
    <>
      <option value={1}>Never</option>
      <option value={2}>Every 6 Hours</option>
      <option value={3}>Every 12 Hours</option>
      <option value={4}>Every 24 Hours</option>
      <option value={5}>Once a Week</option>
      <option value={6}>Once a Month</option>
    </>
  );

  const testLogin = async () => {
    await testAniDbLoginTrigger({ Username, Password });
    if (testAniDbLoginResult.isError) {
      toast.error('Incorrect Username/Password!');
    } else {
      toast.success('AniDB Login Succesful!');
    }
  };

  const validateAndSaveRelationDepth = (depth: string) => {
    if (parseInt(depth) < 0 || parseInt(depth) > 5) toast.error('Max Relation Depth may only be between 0 and 5');
    else updateSetting('AniDb', 'MaxRelationDepth', depth);
  };

  return (
    <>
      <ShokoPanel
        title="Login Options"
        isFetching={fetching}
        options={<div className="cursor-pointer text-highlight-1 font-semibold" onClick={() => testLogin()}>Test</div>}
      >
        <div className="flex justify-between">
          Username
          <InputSmall id="username" value={Username} type="text" onChange={event => updateSetting('AniDb', 'Username', event.target.value)} className="w-32 px-2 py-0.5" />
        </div>
        <div className="flex justify-between mt-2">
          Password
          <InputSmall id="password" value={Password} type="password" onChange={event => updateSetting('AniDb', 'Password', event.target.value)} className="w-32 px-2 py-0.5" />
        </div>
        <div className="flex justify-between mt-2">
          Port
          <InputSmall id="port" value={ClientPort} type="number" onChange={event => updateSetting('AniDb', 'ClientPort', event.target.value)} className="w-32 px-2 py-0.5" />
        </div>
        <div className="flex justify-between mt-2">
          AVDump Key
          <InputSmall id="avdump-key" value={AVDumpKey} type="password" onChange={event => updateSetting('AniDb', 'AVDumpKey', event.target.value)} className="w-32 px-2 py-0.5" />
        </div>
        <div className="flex justify-between mt-2">
          AVDump Port
          <InputSmall id="avdump-port" value={AVDumpClientPort} type="number" onChange={event => updateSetting('AniDb', 'AVDumpClientPort', event.target.value)} className="w-32 px-2 py-0.5" />
        </div>
      </ShokoPanel>

      <ShokoPanel
        title="Download Options"
        isFetching={fetching}
        className="mt-8"
      >
        <Checkbox justify label="Character Images" id="character-images" isChecked={DownloadCharacters} onChange={event => updateSetting('AniDb', 'DownloadCharacters', event.target.checked)} />
        <Checkbox justify label="Creator Images" id="creator-images" isChecked={DownloadCreators} onChange={event => updateSetting('AniDb', 'DownloadCreators', event.target.checked)} className="mt-2" />
        <Checkbox justify label="Reviews" id="reviews" isChecked={DownloadReviews} onChange={event => updateSetting('AniDb', 'DownloadReviews', event.target.checked)} className="mt-2" />
        <Checkbox justify label="Release Groups" id="release-groups" isChecked={DownloadReleaseGroups} onChange={event => updateSetting('AniDb', 'DownloadReleaseGroups', event.target.checked)} className="mt-2" />
        <Checkbox justify label="Related Anime" id="related-anime" isChecked={DownloadRelatedAnime} onChange={event => updateSetting('AniDb', 'DownloadRelatedAnime', event.target.checked)} className="mt-2" />
        <div className={cx('flex justify-between mt-2 items-center transition-opacity', !DownloadRelatedAnime && 'pointer-events-none opacity-50')}>
          Related Depth
          <InputSmall id="max-relation-depth" value={MaxRelationDepth} type="number" onChange={event => validateAndSaveRelationDepth(event.target.value)} className="w-10 text-center px-2" />
        </div>
      </ShokoPanel>

      <ShokoPanel
        title="Mylist Options"
        isFetching={fetching}
        className="mt-8"
      >
        <Checkbox justify label="Add Files" id="add-files" isChecked={MyList_AddFiles} onChange={event => updateSetting('AniDb', 'MyList_AddFiles', event.target.checked)} />
        <Checkbox justify label="Read Watched" id="read-watched" isChecked={MyList_ReadWatched} onChange={event => updateSetting('AniDb', 'MyList_ReadWatched', event.target.checked)} className="mt-2" />
        <Checkbox justify label="Read Unwatched" id="read-unwatched" isChecked={MyList_ReadUnwatched} onChange={event => updateSetting('AniDb', 'MyList_ReadUnwatched', event.target.checked)} className="mt-2" />
        <Checkbox justify label="Set Watched" id="set-watched" isChecked={MyList_SetWatched} onChange={event => updateSetting('AniDb', 'MyList_SetWatched', event.target.checked)} className="mt-2" />
        <Checkbox justify label="Set Unwatched" id="set-unwatched" isChecked={MyList_SetUnwatched} onChange={event => updateSetting('AniDb', 'MyList_SetUnwatched', event.target.checked)} className="mt-2" />
        <div className="flex justify-between items-center mt-2">
          <span>Storage State</span>
          <SelectSmall id="storage-state" value={MyList_StorageState} onChange={event => updateSetting('AniDb', 'MyList_StorageState', event.target.value)}>
            <option value={0}>Unknown</option>
            <option value={1}>HDD</option>
            <option value={2}>Disk</option>
            <option value={3}>Deleted</option>
            <option value={4}>Remote</option>
          </SelectSmall>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Delete Action</span>
          <SelectSmall id="delete-action" value={MyList_DeleteType} onChange={event => updateSetting('AniDb', 'MyList_DeleteType', event.target.value)}>
            <option value={0}>Delete File (AniDB)</option>
            <option value={1}>Delete File (Local)</option>
            <option value={2}>Mark Deleted</option>
            <option value={3}>Mark External (CD/DVD)</option>
            <option value={4}>Mark Unknown</option>
            <option value={5}>DVD/BD</option>
          </SelectSmall>
        </div>
      </ShokoPanel>

      <ShokoPanel
        title="Update Options"
        isFetching={fetching}
        className="mt-8"
      >
        <div className="flex justify-between items-center mt-2">
          <span>Calendar</span>
          <SelectSmall id="calendar" value={Calendar_UpdateFrequency} onChange={event => updateSetting('AniDb', 'Calendar_UpdateFrequency', event.target.value)}>
            {renderUpdateFrequencyValues()}
          </SelectSmall>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Anime Information</span>
          <SelectSmall id="anime-information" value={Anime_UpdateFrequency} onChange={event => updateSetting('AniDb', 'Anime_UpdateFrequency', event.target.value)}>
            {renderUpdateFrequencyValues()}
          </SelectSmall>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Sync Mylist</span>
          <SelectSmall id="sync-mylist" value={MyList_UpdateFrequency} onChange={event => updateSetting('AniDb', 'MyList_UpdateFrequency', event.target.value)}>
            {renderUpdateFrequencyValues()}
          </SelectSmall>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Get Mylist Stats</span>
          <SelectSmall id="get-mylist-stats" value={MyListStats_UpdateFrequency} onChange={event => updateSetting('AniDb', 'MyListStats_UpdateFrequency', event.target.value)}>
            {renderUpdateFrequencyValues()}
          </SelectSmall>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Files With Missing Info</span>
          <SelectSmall id="files-missing-info" value={File_UpdateFrequency} onChange={event => updateSetting('AniDb', 'File_UpdateFrequency', event.target.value)}>
            {renderUpdateFrequencyValues()}
          </SelectSmall>
        </div>
      </ShokoPanel>

      <ShokoPanel
        title="Language Options"
        className="mt-8"
        isFetching={fetching}
        options={
          <div onClick={() => dispatch(setLanguagesModalStatus(true))} title="Add Language" className="cursor-pointer">
            <Icon className="text-highlight-1" path={mdiPlusCircleOutline} size={1} horizontal vertical rotate={180}/>
          </div>
        }
      >
        <Checkbox label="Also Use Synonyms" id="LanguageUseSynonyms" isChecked={newSettings.LanguageUseSynonyms} onChange={event => setNewSettings({ ...newSettings, LanguageUseSynonyms: event.target.checked })} justify />
        <div className="font-semibold mt-3">Priority (Drag to Reorder)</div>
        <div className="flex bg-background-alt border border-background-border rounded-md mt-2 px-3 py-2">
          <DnDList onDragEnd={onDragEnd}>
            {newSettings.LanguagePreference.map(language => (
              {
                key: language,
                item: (
                  <div className="flex justify-between items-center mt-2.5 group-first:mt-0">
                    {languageDescription[language]}
                    <Button onClick={() => removeLanguage(language)} tooltip="Remove">
                      <Icon className="text-highlight-1" path={mdiMinusCircleOutline} size={1} horizontal vertical rotate={180}/>
                    </Button>
                  </div>
                ),
              }
            ))}
          </DnDList>
        </div>
      </ShokoPanel>
    </>
  );
}

export default AniDBSettings;
