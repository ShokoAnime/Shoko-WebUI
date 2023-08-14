import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route } from 'react-router';
import { RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import Collection from '@/pages/collection/Collection';
import GroupView from '@/pages/collection/GroupView';
import Series from '@/pages/collection/Series';
import SeriesCredits from '@/pages/collection/series/SeriesCredits';
import SeriesEpisodes from '@/pages/collection/series/SeriesEpisodes';
import SeriesFileSummary from '@/pages/collection/series/SeriesFileSummary';
import SeriesImages from '@/pages/collection/series/SeriesImages';
import SeriesOverview from '@/pages/collection/series/SeriesOverview';
import SeriesTags from '@/pages/collection/series/SeriesTags';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import Acknowledgement from '@/pages/firstrun/Acknowledgement';
import AniDBAccount from '@/pages/firstrun/AniDBAccount';
import DataCollection from '@/pages/firstrun/DataCollection';
import FirstRunPage from '@/pages/firstrun/FirstRunPage';
import ImportFolders from '@/pages/firstrun/ImportFolders';
import LocalAccount from '@/pages/firstrun/LocalAccount';
import MetadataSources from '@/pages/firstrun/MetadataSources';
import StartServer from '@/pages/firstrun/StartServer';
import LoginPage from '@/pages/login/LoginPage';
import LogsPage from '@/pages/logs/LogsPage';
import MainPage from '@/pages/main/MainPage';
import NoMatchPage from '@/pages/nomatch';
import SettingsPage, { initialSettings } from '@/pages/settings/SettingsPage';
import AniDBSettings from '@/pages/settings/tabs/AniDBSettings';
import GeneralSettings from '@/pages/settings/tabs/GeneralSettings';
import ImportSettings from '@/pages/settings/tabs/ImportSettings';
import MetadataSitesSettings from '@/pages/settings/tabs/MetadataSitesSettings';
import UserManagementSettings from '@/pages/settings/tabs/UserManagementSettings';
import MultipleFilesUtility from '@/pages/utilities/MultipleFilesUtility';
import SeriesWithoutFilesUtility from '@/pages/utilities/SeriesWithoutFilesUtility';
import UnrecognizedUtility from '@/pages/utilities/UnrecognizedUtility';
import IgnoredFilesTab from '@/pages/utilities/UnrecognizedUtilityTabs/IgnoredFilesTab';
import LinkFilesTab from '@/pages/utilities/UnrecognizedUtilityTabs/LinkFilesTab';
import ManuallyLinkedTab from '@/pages/utilities/UnrecognizedUtilityTabs/ManuallyLinkedTab';
import UnrecognizedTab from '@/pages/utilities/UnrecognizedUtilityTabs/UnrecognizedTab';

import AuthenticatedRoute from './AuthenticatedRoute';

import type { RootState } from '@/core/store';

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
        <Route
          element={
            <AuthenticatedRoute>
              <MainPage />
            </AuthenticatedRoute>
          }
        >
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
            <Route index element={<Collection />} />
            <Route path="filter/:filterId" element={<Collection />} />
            <Route path="group/:groupId" element={<GroupView />} />
            <Route path="series/:seriesId" element={<Series />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<SeriesOverview />} />
              <Route path="episodes" element={<SeriesEpisodes />} />
              <Route path="credits" element={<SeriesCredits />} />
              <Route path="images" element={<SeriesImages />} />
              <Route path="files" element={<SeriesFileSummary />} />
              <Route path="tags" element={<SeriesTags />} />
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
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.className = `${
      apikey === '' ? globalThis.localStorage.getItem('theme') : (webuiPreviewTheme ?? theme)
    } theme-shoko-gray`;
    const timeoutId = setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.style.visibility = 'initial';
      }
    }, 125);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [apikey, theme, webuiPreviewTheme]);

  return (
    <div id="app-container" className="flex h-screen" ref={bodyRef}>
      <RouterProvider router={router} />
    </div>
  );
};

export default Router;
