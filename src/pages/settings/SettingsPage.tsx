import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { Link, useOutletContext } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import cx from 'classnames';
import { find, isEqual } from 'lodash';
import semver from 'semver';
import { Icon } from '@mdi/react';
import { mdiChevronDown, mdiChevronRight } from '@mdi/js';

import { useGetSettingsQuery, usePatchSettingsMutation } from '../../core/rtkQuery/settingsApi';

import Button from '../../components/Input/Button';
import toast from '../../components/Toast';
import TransitionDiv from '../../components/TransitionDiv';
import { uiVersion } from '../../core/util';

import type { RootState } from '../../core/store';
import type { SettingsType } from '../../core/types/api/settings';

const items = [
  { name: 'General', path: 'general' },
  { name: 'Import', path: 'import' },
  { name: 'AniDB', path: 'anidb' },
  { name: 'Metadata Sites', path: 'metadata-sites' },
  // { name: 'Display', path: 'display' },
  // { name: 'User Management', path: 'user-management' },
  // { name: 'Themes', path: 'themes' },
];

const initialLayout = {
  dashboard: {
    lg: [
      { i: 'collectionBreakdown', x: 0, y: 0, w: 3, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'collectionTypeBreakdown', x: 3, y: 0, w: 2, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'queueProcessor', x: 5, y: 0, w: 7, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'recentlyImported', x: 0, y: 16, w: 12, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'shokoNews', x: 0, y: 35, w: 3, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'importFolders', x: 3, y: 35, w: 3, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'importBreakdown', x: 6, y: 35, w: 6, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'continueWatching', x: 0, y: 49, w: 12, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'nextUp', x: 0, y: 61, w: 12, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'upcomingAnime', x: 0, y: 73, w: 12, h: 21, minW: 2, minH: 2, moved: false, static: false },
      { i: 'recommendedAnime', x: 0, y: 94, w: 12, h: 19, minW: 2, minH: 2, moved: false, static: false },
    ],
    md: [
      { i: 'collectionBreakdown', x: 0, y: 0, w: 5, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'collectionTypeBreakdown', x: 5, y: 0, w: 5, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'queueProcessor', x: 0, y: 16, w: 10, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'recentlyImported', x: 0, y: 32, w: 10, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'shokoNews', x: 0, y: 51, w: 5, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'importFolders', x: 5, y: 51, w: 5, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'importBreakdown', x: 0, y: 65, w: 10, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'continueWatching', x: 0, y: 79, w: 10, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'nextUp', x: 0, y: 98, w: 10, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'upcomingAnime', x: 0, y: 117, w: 10, h: 21, minW: 2, minH: 2, moved: false, static: false },
      { i: 'recommendedAnime', x: 0, y: 138, w: 10, h: 19, minW: 2, minH: 2, moved: false, static: false },
    ],
    sm: [
      { i: 'collectionBreakdown', x: 0, y: 0, w: 6, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'collectionTypeBreakdown', x: 0, y: 16, w: 6, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'queueProcessor', x: 0, y: 32, w: 6, h: 16, minW: 2, minH: 2, moved: false, static: false },
      { i: 'recentlyImported', x: 0, y: 48, w: 6, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'shokoNews', x: 0, y: 67, w: 6, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'importFolders', x: 0, y: 81, w: 6, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'importBreakdown', x: 0, y: 95, w: 6, h: 14, minW: 2, minH: 2, moved: false, static: false },
      { i: 'continueWatching', x: 0, y: 109, w: 6, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'nextUp', x: 0, y: 128, w: 6, h: 19, minW: 2, minH: 2, moved: false, static: false },
      { i: 'upcomingAnime', x: 0, y: 147, w: 6, h: 21, minW: 2, minH: 2, moved: false, static: false },
      { i: 'recommendedAnime', x: 0, y: 168, w: 6, h: 19, minW: 2, minH: 2, moved: false, static: false },
    ],
  },
};

export const initialSettings = {
  WebUI_Settings: {
    notifications: true,
    settingsRevision: 0,
    theme: '',
    toastPosition: 'bottom-right',
    updateChannel: semver.prerelease(uiVersion()) ? 'unstable' : 'stable',
    layout: initialLayout,
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
    DownloadReleaseGroups: false,
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
  TraceLog: false,
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
  const [showNav, setShowNav] = useState(false);

  const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

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
    settingsQuery.refetch().catch(() => {});
  };

  const renderItem = (name: string, path: string) => (
    <Link to={path} className={cx('font-semibold mb-2', pathname === `/webui/settings/${path}` && 'text-highlight-1')} key={path} onClick={() => setShowNav(false)}>{name}</Link>
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
    <div className="flex h-full">
      <TransitionDiv
        className="flex flex-col w-64 bg-background-nav h-full border-x-2 border-background-border p-9 absolute z-10 md:static"
        show={!(isSm && !showNav)}
        enter="transition-transform"
        enterFrom="-translate-x-64"
        enterTo="translate-x-0"
      >
        {items.map(item => renderItem(item.name, item.path))}
      </TransitionDiv>
      <div className={`grow h-full p-9 bg-cover overflow-y-auto ${getBgClassNames()}`} onClick={() => setShowNav(false)}>
        {isSm && (
          <div className="flex justify-center mb-8 font-semibold">
            Settings
            <Icon path={mdiChevronRight} size={1} className="mx-1" />
            <div className="flex text-highlight-1 rounded pl-2 border border-highlight-1 items-center cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowNav(!showNav); }}>
              {find(items, item => item.path === pathname.split('/').pop())?.name}
              <Icon path={mdiChevronDown} size={1} />
            </div>
          </div>
        )}
        <div className="flex flex-col max-w-full md:max-w-[34rem]">
          <Outlet
            context={{
              fetching: settingsQuery.isLoading,
              newSettings,
              setNewSettings,
              updateSetting,
            }}
          />
        </div>
        <div className="flex max-w-[34rem] mt-10 justify-end">
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
