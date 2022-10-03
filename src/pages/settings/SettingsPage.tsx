import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { Link, useOutletContext } from 'react-router-dom';
import cx from 'classnames';
import { isEqual } from 'lodash';

import { useGetSettingsQuery, usePatchSettingsMutation } from '../../core/rtkQuery/settingsApi';

import Button from '../../components/Input/Button';
import toast from '../../components/Toast';

import type { RootState } from '../../core/store';
import type { SettingsType } from '../../core/types/api/settings';

const items = [
  { name: 'General', path: 'general' },
  { name: 'Import', path: 'import' },
  { name: 'AniDB', path: 'anidb' },
  { name: 'Metadata Sites', path: 'metadata-sites' },
  { name: 'Display', path: 'display' },
  { name: 'User Management', path: 'user-management' },
  // { name: 'Themes', path: 'themes' },
];

export const initialSettings = {
  WebUI_Settings: {
    actions: [
      'remove-missing-files-mylist',
      'update-series-stats',
      'update-all-anidb-info',
      'update-all-tvdb-info',
      'plex-sync-all',
      'run-import',
    ],
    notifications: true,
    settingsRevision: 0,
    theme: '',
    toastPosition: 'bottom-right',
    updateChannel: 'stable',
  },
  FirstRun: false,
  Database: {
    MySqliteDirectory: '',
    DatabaseBackupDirectory: '',
    Type: 'SQLite',
    Username: '',
    Password: '',
    Schema: '',
    Hostname: '',
    SQLite_DatabaseFile: '',
  },
  AniDb: {
    Username: '',
    Password: '',
    AVDumpKey: '',
    ClientPort: 4556,
    AVDumpClientPort: 4557,
    DownloadCharacters: false,
    DownloadCreators: false,
    DownloadRelatedAnime: false,
    MaxRelationDepth: 0,
    MyList_AddFiles: false,
    MyList_DeleteType: 0,
    MyList_ReadUnwatched: false,
    MyList_ReadWatched: false,
    MyList_SetUnwatched: false,
    MyList_SetWatched: false,
    MyList_StorageState: 0,
    Calendar_UpdateFrequency: 1,
    Anime_UpdateFrequency: 1,
    MyList_UpdateFrequency: 1,
    MyListStats_UpdateFrequency: 1,
    File_UpdateFrequency: 1,
  },
  TvDB: {
    AutoLink: false,
    AutoFanart: false,
    AutoFanartAmount: 0,
    AutoWideBanners: false,
    AutoWideBannersAmount: 0,
    AutoPosters: false,
    AutoPostersAmount: 0,
    UpdateFrequency: 1,
    Language: 'en',
  },
  MovieDb: {
    AutoFanart: false,
    AutoFanartAmount: 0,
    AutoPosters: false,
    AutoPostersAmount: 0,
  },
  TraktTv: {
    Enabled: false,
    TokenExpirationDate: '',
    UpdateFrequency: 1,
    SyncFrequency: 1,
  },
  Plex: {
    Server: '',
    Libraries: [],
    Token: '',
  },
  LogRotator: {
    Enabled: false,
    Zip: false,
    Delete: false,
    Delete_Days: '0',
  },
  GA_OptOutPlzDont: false,
  AutoGroupSeries: false,
  AutoGroupSeriesUseScoreAlgorithm: false,
  AutoGroupSeriesRelationExclusions: '',
  LanguagePreference: ['x-jat', 'en'],
  LanguageUseSynonyms: false,
  Import: {
    MoveOnImport: false,
    RenameOnImport: false,
    RenameThenMove: false,
    RunOnStart: false,
    UseExistingFileWatchedStatus: false,
    VideoExtensions: [],
  },
} as SettingsType;

type ContextType = {
  fetching: boolean
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => {};
  updateSetting: (type: string, key: string, value: string) => {};
};

function SettingsPage() {
  const pathname = useSelector((state: RootState) => state.router.location.pathname);

  const settingsQuery = useGetSettingsQuery();
  const settings = settingsQuery?.data ?? initialSettings;
  const [patchSettings] = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(initialSettings);

  useEffect(() => {
    setNewSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (isEqual(settings, newSettings))
      toast.dismiss('unsaved');
    else if (!isEqual(newSettings, initialSettings)) {
      toast.info('', 'You have unsaved changes!', {
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        toastId: 'unsaved',
      });
    }
  }, [newSettings]);

  const updateSetting = (type: string, key: string, value: string) => {
    const tempSettings = { ...(newSettings[type]), [key]: value };
    setNewSettings({ ...newSettings, [type]: tempSettings });
  };

  const saveSettings = async () => {
    await patchSettings({ oldSettings: settings, newSettings });
    settingsQuery.refetch();
  };

  const renderItem = (name: string, path: string) => (
    <Link to={path} className={cx('font-semibold mb-2', pathname === `/webui/settings/${path}` && 'text-highlight-1')} key={path}>{name}</Link>
  );

  const getBgClassNames = () => {
    switch (pathname.split('/').pop()) {
      case 'general': return 'bg-general-settings bg-[center_right_-18rem]';
      case 'import': return 'bg-import-settings bg-right';
      case 'anidb': return 'bg-anidb-settings bg-[center_right_-26rem]';
      case 'metadata-sites': return 'bg-metadata-sites-settings bg-[center_right_-14rem]';
      default: return '';
    }
  };

  return (
    <div className="flex">
      <div className="flex flex-col w-72 bg-background-nav h-screen border-x-2 border-background-border p-9">
        {items.map(item => renderItem(item.name, item.path))}
      </div>
      <div className={`grow h-screen p-9 bg-cover overflow-y-auto ${getBgClassNames()}`}>
        <div className="flex flex-col w-2/5">
          <Outlet
            context={{
              fetching: settingsQuery.isLoading,
              newSettings,
              setNewSettings,
              updateSetting,
            }}
          />
        </div>
        <div className="flex w-2/5 mt-10 justify-end">
          <Button onClick={() => setNewSettings(settings)} className="bg-background-alt px-3 py-2 border border-background-border">Cancel</Button>
          <Button onClick={() => saveSettings()} className="bg-highlight-1 px-3 py-2 ml-3 border border-background-border">Save</Button>
        </div>
      </div>
    </div>
  );
}

export function useSettingsContext() {
  return useOutletContext<ContextType>();
}

export default SettingsPage;
