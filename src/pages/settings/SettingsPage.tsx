/* global globalThis */
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { Outlet } from 'react-router';
import { NavLink, useLocation, useOutletContext } from 'react-router-dom';
import { mdiInformationOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { isEqual } from 'lodash';
import semver from 'semver';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { setItem as setMiscItem } from '@/core/slices/misc';
import { uiVersion } from '@/core/util';

import type { SettingsType } from '@/core/types/api/settings';

const items = [
  { name: 'General', path: 'general' },
  { name: 'Import', path: 'import' },
  { name: 'AniDB', path: 'anidb' },
  { name: 'Metadata Sites', path: 'metadata-sites' },
  // { name: 'Display', path: 'display' },
  { name: 'User Management', path: 'user-management' },
  // { name: 'Themes', path: 'themes' },
];

const initialLayout = {
  dashboard: {
    lg: [
      {
        i: 'queueProcessor',
        x: 0,
        y: 0,
        w: 6,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'unrecognizedFiles',
        x: 6,
        y: 0,
        w: 6,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recentlyImported',
        x: 0,
        y: 16,
        w: 12,
        h: 18,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'collectionBreakdown',
        x: 0,
        y: 37,
        w: 3,
        h: 15,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'collectionTypeBreakdown',
        x: 3,
        y: 37,
        w: 3,
        h: 15,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'importFolders',
        x: 6,
        y: 37,
        w: 3,
        h: 15,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'shokoNews',
        x: 9,
        y: 37,
        w: 3,
        h: 15,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'continueWatching',
        x: 0,
        y: 53,
        w: 12,
        h: 18,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'nextUp',
        x: 0,
        y: 67,
        w: 12,
        h: 18,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'upcomingAnime',
        x: 0,
        y: 81,
        w: 12,
        h: 20,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recommendedAnime',
        x: 0,
        y: 103,
        w: 12,
        h: 18,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
    ],
    md: [
      {
        i: 'collectionBreakdown',
        x: 0,
        y: 0,
        w: 5,
        h: 16,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'collectionTypeBreakdown',
        x: 5,
        y: 0,
        w: 5,
        h: 16,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'queueProcessor',
        x: 0,
        y: 16,
        w: 10,
        h: 16,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recentlyImported',
        x: 0,
        y: 32,
        w: 10,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'shokoNews',
        x: 0,
        y: 51,
        w: 5,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'importFolders',
        x: 5,
        y: 51,
        w: 5,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'unrecognizedFiles',
        x: 0,
        y: 65,
        w: 10,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'continueWatching',
        x: 0,
        y: 79,
        w: 10,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'nextUp',
        x: 0,
        y: 98,
        w: 10,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'upcomingAnime',
        x: 0,
        y: 117,
        w: 10,
        h: 21,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recommendedAnime',
        x: 0,
        y: 138,
        w: 10,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
    ],
    sm: [
      {
        i: 'collectionBreakdown',
        x: 0,
        y: 0,
        w: 6,
        h: 16,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'collectionTypeBreakdown',
        x: 0,
        y: 16,
        w: 6,
        h: 16,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'queueProcessor',
        x: 0,
        y: 32,
        w: 6,
        h: 16,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recentlyImported',
        x: 0,
        y: 48,
        w: 6,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'shokoNews',
        x: 0,
        y: 67,
        w: 6,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'importFolders',
        x: 0,
        y: 81,
        w: 6,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'unrecognizedFiles',
        x: 0,
        y: 95,
        w: 6,
        h: 14,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'continueWatching',
        x: 0,
        y: 109,
        w: 6,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'nextUp',
        x: 0,
        y: 128,
        w: 6,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'upcomingAnime',
        x: 0,
        y: 147,
        w: 6,
        h: 21,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
      {
        i: 'recommendedAnime',
        x: 0,
        y: 168,
        w: 6,
        h: 19,
        minW: 2,
        minH: 2,
        moved: false,
        static: false,
      },
    ],
  },
};

export const initialSettings = {
  WebUI_Settings: {
    notifications: true,
    settingsRevision: 0,
    theme: 'theme-shoko-gray',
    toastPosition: 'bottom-right',
    updateChannel: semver.prerelease(uiVersion()) ? 'Dev' : 'Stable',
    layout: initialLayout,
    collection: {
      view: 'poster',
      poster: {
        showEpisodeCount: true,
        showGroupIndicator: true,
        showUnwatchedCount: true,
        showRandomPoster: false,
      },
      list: {
        showItemType: true,
        showGroupIndicator: true,
        showTopTags: true,
        showCustomTags: true,
        showRandomPoster: false,
      },
    },
    dashboard: {
      hideQueueProcessor: false,
      hideUnrecognizedFiles: false,
      hideRecentlyImported: false,
      hideCollectionStats: false,
      hideMediaType: false,
      hideImportFolders: false,
      hideShokoNews: false,
      hideContinueWatching: false,
      hideNextUp: false,
      hideUpcomingAnime: false,
      hideRecommendedAnime: false,
      combineContinueWatching: false,
      hideR18Content: true,
      shokoNewsPostsCount: 5,
      recentlyImportedEpisodesCount: 30,
      recentlyImportedSeriesCount: 20,
    },
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
  AutoGroupSeriesRelationExclusions: [],
  LanguageUseSynonyms: false,
  LanguagePreference: ['x-jat', 'en'],
  EpisodeLanguagePreference: ['en'],
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
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: string | boolean) => void;
};

function SettingsPage() {
  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const settingsQuery = useGetSettingsQuery();
  const settings = useMemo(() => settingsQuery?.data ?? initialSettings, [settingsQuery]);
  const [patchSettings] = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(initialSettings);
  const [showNav, setShowNav] = useState(false);

  const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  useEffect(() => {
    dispatch(setMiscItem({ webuiPreviewTheme: null }));
    setNewSettings(settings);
  }, [dispatch, settings]);

  const unsavedChanges = useMemo(() => {
    if (isEqual(settings, newSettings)) return false;
    return !isEqual(newSettings, initialSettings);
  }, [newSettings, settings]);

  const updateSetting = (type: string, key: string, value: string | boolean) => {
    if (key === 'theme' && typeof value === 'string') {
      globalThis.localStorage.setItem('theme', value);
    }

    const tempSettings = { ...(newSettings[type]), [key]: value };
    setNewSettings({ ...newSettings, [type]: tempSettings });

    if (type === 'WebUI_Settings' && key === 'theme') {
      dispatch(setMiscItem({ webuiPreviewTheme: value }));
    }
  };

  const saveSettings = async () => {
    try {
      await patchSettings({ oldSettings: settings, newSettings }).unwrap();
    } catch (error) { /* empty */ }
  };

  return (
    <div className="flex min-h-full grow justify-center gap-x-8" onClick={() => setShowNav(false)}>
      <TransitionDiv
        className="relative top-0 z-10 flex w-72 flex-col gap-y-4 rounded-md border border-panel-border bg-panel-background-transparent p-8 font-semibold"
        show={!(isSm && !showNav)}
        enter={cx(isSm ? 'transition-transform' : 'transition-none')}
        enterFrom="-translate-x-64"
        enterTo="translate-x-0"
      >
        <div className="sticky top-8">
          <div className="mb-8 text-xl opacity-100">Settings</div>
          <div className="flex flex-col gap-y-4">
            {items.map(item => (
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'text-panel-text-primary' : '')}
                key={item.path}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </TransitionDiv>
      {/* {isSm && ( */}
      {/*  <div className="flex justify-center mb-8 font-semibold"> */}
      {/*    Settings */}
      {/*    <Icon path={mdiChevronRight} size={1} className="mx-1" /> */}
      {/*    <div className="flex text-panel-text-primary rounded pl-2 border border-panel-text-primary items-center cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowNav(!showNav); }}> */}
      {/*      {find(items, item => item.path === pathname.split('/').pop())?.name} */}
      {/*      <Icon path={mdiChevronDown} size={1} /> */}
      {/*    </div> */}
      {/*  </div> */}
      {/* )} */}
      <div className="flex min-h-full w-[37.5rem] flex-col gap-y-8 overflow-y-visible rounded-md border border-panel-border bg-panel-background-transparent p-8">
        {settingsQuery.isLoading
          ? (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} spin size={5} />
            </div>
          )
          : (
            <>
              <Outlet
                context={{
                  newSettings,
                  setNewSettings,
                  updateSetting,
                }}
              />
              {pathname.split('/').pop() !== 'user-management' && (
                <div className="flex max-w-[34rem] justify-end font-semibold">
                  <Button onClick={() => setNewSettings(settings)} buttonType="secondary" className="px-3 py-2">
                    Cancel
                  </Button>
                  <Button onClick={() => saveSettings()} buttonType="primary" className="ml-3 px-3 py-2">Save</Button>
                </div>
              )}
            </>
          )}
      </div>
      <div
        className={cx(
          'flex w-96 bg-panel-background-transparent border border-panel-border rounded-md p-8 gap-x-2 font-semibold items-center sticky top-0 transition-opacity h-full',
          unsavedChanges ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Icon path={mdiInformationOutline} size={1} className="text-panel-text-primary" />
        Whoa! You Have Unsaved Changes!
      </div>
      <div
        className="fixed left-0 top-0 -z-10 h-full w-full opacity-5"
        style={{ background: 'center / cover no-repeat url(/api/v3/Image/Random/Fanart)' }}
      />
    </div>
  );
}

export function useSettingsContext() {
  return useOutletContext<ContextType>();
}

export default SettingsPage;
