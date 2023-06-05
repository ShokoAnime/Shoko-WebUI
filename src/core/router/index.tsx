import React, { useEffect } from 'react';

import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { Navigate, Route } from 'react-router';
import { useSelector } from 'react-redux';

import { RootState } from '@/core/store';

import AuthenticatedRoute from './AuthenticatedRoute';
import FirstRunPage from '@/pages/firstrun/FirstRunPage';
import LoginPage from '@/pages/login/LoginPage';
import MainPage from '@/pages/main/MainPage';
import NoMatchPage from '@/pages/nomatch';

// Main page
import DashboardPage from '@/pages/dashboard/DashboardPage';
import LogsPage from '@/pages/logs/LogsPage';

// First run
import Acknowledgement from '@/pages/firstrun/Acknowledgement';
import AniDBAccount from '@/pages/firstrun/AniDBAccount';
import DataCollection from '@/pages/firstrun/DataCollection';
import ImportFolders from '@/pages/firstrun/ImportFolders';
import LocalAccount from '@/pages/firstrun/LocalAccount';
import MetadataSources from '@/pages/firstrun/MetadataSources';
import StartServer from '@/pages/firstrun/StartServer';

// Collection
import Collection from '@/pages/collection/Collection';
import Group from '@/pages/collection/Group';
import Series from '@/pages/collection/Series';
import SeriesCredits from '@/pages/collection/series/SeriesCredits';
import SeriesEpisodes from '@/pages/collection/series/SeriesEpisodes';
import SeriesFileSummary from '@/pages/collection/series/SeriesFileSummary';
import SeriesImages from '@/pages/collection/series/SeriesImages';
import SeriesOverview from '@/pages/collection/series/SeriesOverview';
import SeriesTags from '@/pages/collection/series/SeriesTags';

// Utilities
import IgnoredFilesTab from '@/pages/utilities/UnrecognizedUtilityTabs/IgnoredFilesTab';
import LinkFilesTab from '@/pages/utilities/UnrecognizedUtilityTabs/LinkFilesTab';
import ManuallyLinkedTab from '@/pages/utilities/UnrecognizedUtilityTabs/ManuallyLinkedTab';
import MultipleFilesUtility from '@/pages/utilities/MultipleFilesUtility';
import SeriesWithoutFilesUtility from '@/pages/utilities/SeriesWithoutFilesUtility';
import UnrecognizedTab from '@/pages/utilities/UnrecognizedUtilityTabs/UnrecognizedTab';
import UnrecognizedUtility from '@/pages/utilities/UnrecognizedUtility';

// Settings
import AniDBSettings from '@/pages/settings/tabs/AniDBSettings';
import GeneralSettings from '@/pages/settings/tabs/GeneralSettings';
import ImportSettings from '@/pages/settings/tabs/ImportSettings';
import MetadataSitesSettings from '@/pages/settings/tabs/MetadataSitesSettings';
import SettingsPage, { initialSettings } from '@/pages/settings/SettingsPage';
import UserManagementSettings from '@/pages/settings/tabs/UserManagementSettings';

import { useGetSettingsQuery } from '../rtkQuery/splitV3Api/settingsApi';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<NoMatchPage />}>
      <Route index element={<Navigate to="/webui" replace />} />
      <Route path="index.html" element={<Navigate to="/webui" replace />} />
      <Route path="webui">
        <Route path="index.html" element={<Navigate to="/webui" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="firstrun" element={<FirstRunPage />}>
          <Route index element={<Navigate to="acknowledgement" replace />} />
          <Route path="acknowledgement" element={<Acknowledgement />} />
          <Route path="local-account" element={<LocalAccount />} />
          <Route path="anidb-account" element={<AniDBAccount />} />
          <Route path="metadata-sources" element={<MetadataSources />} />
          <Route path="start-server" element={<StartServer />} />
          <Route path="import-folders" element={<ImportFolders />} />
          <Route path="data-collection" element={<DataCollection />} />
        </Route>
        <Route element={<AuthenticatedRoute><MainPage /></AuthenticatedRoute>}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="utilities">
            <Route index element={<Navigate to="unrecognized" replace />} />
            <Route path="unrecognized" element={<UnrecognizedUtility />}>
              <Route index element={<Navigate to="files" />} />
              <Route path="files" element={<UnrecognizedTab />} />
              <Route path="files/link" element={<LinkFilesTab />} />
              <Route path="manually-linked-files" element={<ManuallyLinkedTab />} />
              <Route path="ignored-files" element={<IgnoredFilesTab />} />
            </Route>
            <Route path="multiple-files" element={<MultipleFilesUtility />} />
            <Route path="series-without-files" element={<SeriesWithoutFilesUtility />} />
          </Route>
          <Route path="log" element={<LogsPage />} />
          <Route path="collection">
            <Route index element={<Collection />}/>
            <Route path="filter/:filterId" element={<Collection />}/>
            <Route path="group/:groupId" element={<Group />}/>
            <Route path="series/:seriesId" element={<Series />}>
              <Route index element={<Navigate to="overview" replace />}/>
              <Route path="overview" element={<SeriesOverview />}/>
              <Route path="episodes" element={<SeriesEpisodes />}/>
              <Route path="credits" element={<SeriesCredits />}/>
              <Route path="images" element={<SeriesImages />}/>
              <Route path="files" element={<SeriesFileSummary />}/>
              <Route path="tags" element={<SeriesTags />}/>
            </Route>
          </Route>
          <Route path="settings" element={<SettingsPage />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="import" element={<ImportSettings />} />
            <Route path="anidb" element={<AniDBSettings />} />
            <Route path="metadata-sites" element={<MetadataSitesSettings />} />
            <Route path="user-management" element={<UserManagementSettings />} />
          </Route>
        </Route>
      </Route>
    </Route>,
  ),
);

const Router = () => {
  const apikey = useSelector((state: RootState) => state.apiSession.apikey);
  const webuiPreviewTheme = useSelector((state: RootState) => state.misc.webuiPreviewTheme) as string;

  const settingsQuery = useGetSettingsQuery(undefined, { skip: apikey === '' });
  const { theme } = settingsQuery.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  useEffect(() => {
    document.body.className = `${webuiPreviewTheme ?? theme} theme-shoko-gray`;
  }, [theme, webuiPreviewTheme]);

  return (
    <div id="app-container" className="flex h-screen">
      <RouterProvider router={router} />
    </div>
  );
};

export default Router;
