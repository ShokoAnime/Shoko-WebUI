/* global globalThis */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router';
import * as Sentry from '@sentry/react';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { BodyVisibleContext } from '@/hooks/useBodyVisibleContext';
import SentryErrorBoundaryWrapper from '@/pages/SentryErrorBoundaryWrapper';
import Collection from '@/pages/collection/Collection';
import Series from '@/pages/collection/Series';
import SeriesCredits from '@/pages/collection/series/SeriesCredits';
import SeriesEpisodes from '@/pages/collection/series/SeriesEpisodes';
import SeriesFileSummary from '@/pages/collection/series/SeriesFileSummary';
import SeriesImages from '@/pages/collection/series/SeriesImages';
import SeriesOverview from '@/pages/collection/series/SeriesOverview';
import SeriesTags from '@/pages/collection/series/SeriesTags';
import TmdbLinking from '@/pages/collection/series/TmdbLinking';
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
import SettingsPage from '@/pages/settings/SettingsPage';
import AniDBSettings from '@/pages/settings/tabs/AniDBSettings';
import ApiKeys from '@/pages/settings/tabs/ApiKeys';
import CollectionSettings from '@/pages/settings/tabs/CollectionSettings';
import GeneralSettings from '@/pages/settings/tabs/GeneralSettings';
import ImportSettings from '@/pages/settings/tabs/ImportSettings';
import IntegrationsSettings from '@/pages/settings/tabs/IntegrationsSettings';
import MetadataSitesSettings from '@/pages/settings/tabs/MetadataSitesSettings';
import UserManagementSettings from '@/pages/settings/tabs/UserManagementSettings';
import UnsupportedPage from '@/pages/unsupported/UnsupportedPage';
import FileSearch from '@/pages/utilities/FileSearch';
import ReleaseManagement from '@/pages/utilities/ReleaseManagement';
import Renamer from '@/pages/utilities/Renamer';
import SeriesWithoutFilesUtility from '@/pages/utilities/SeriesWithoutFilesUtility';
import IgnoredFilesTab from '@/pages/utilities/UnrecognizedUtilityTabs/IgnoredFilesTab';
import LinkFilesTab from '@/pages/utilities/UnrecognizedUtilityTabs/LinkFilesTab';
import ManuallyLinkedTab from '@/pages/utilities/UnrecognizedUtilityTabs/ManuallyLinkedTab';
import UnrecognizedTab from '@/pages/utilities/UnrecognizedUtilityTabs/UnrecognizedTab';

import AuthenticatedRoute from './AuthenticatedRoute';

import type { RootState } from '@/core/store';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter);

const router = sentryCreateBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorBoundary />}>
      <Route index element={<Navigate to="/webui" replace />} />
      <Route path="index.html" element={<Navigate to="/webui" replace />} />
      <Route path="webui" element={<SentryErrorBoundaryWrapper />}>
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
        <Route path="unsupported" element={<UnsupportedPage />} />
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
            <Route path="unrecognized" element={<Navigate to="files" replace />} />
            <Route path="unrecognized/files" element={<UnrecognizedTab />} />
            <Route path="unrecognized/files/link" element={<LinkFilesTab />} />
            <Route path="unrecognized/manually-linked-files" element={<ManuallyLinkedTab />} />
            <Route path="unrecognized/ignored-files" element={<IgnoredFilesTab />} />
            <Route path="release-management" element={<Navigate to="multiples" replace />} />
            <Route path="release-management/:itemType" element={<ReleaseManagement />} />
            <Route path="series-without-files" element={<SeriesWithoutFilesUtility />} />
            <Route path="file-search" element={<FileSearch />} />
            <Route path="renamer" element={<Renamer />} />
          </Route>
          <Route path="log" element={<LogsPage />} />
          <Route path="collection">
            <Route index element={<Collection />} />
            <Route path="filter/:filterId" element={<Collection />} />
            <Route path="group/:groupId" element={<Collection />} />
            <Route path="group/:groupId/filter/:filterId" element={<Collection />} />
            <Route path="series/:seriesId" element={<Series />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<SeriesOverview />} />
              <Route path="episodes" element={<SeriesEpisodes />} />
              <Route path="credits" element={<SeriesCredits />} />
              <Route path="images" element={<Navigate to="posters" replace />} />
              <Route path="images/:imageType" element={<SeriesImages />} />
              <Route path="files" element={<SeriesFileSummary />} />
              <Route path="tags" element={<SeriesTags />} />
            </Route>
            <Route path="series/:seriesId/tmdb-linking" element={<TmdbLinking />} />
          </Route>
          <Route path="settings" element={<SettingsPage />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="import" element={<ImportSettings />} />
            <Route path="anidb" element={<AniDBSettings />} />
            <Route path="metadata-sites" element={<MetadataSitesSettings />} />
            <Route path="collection" element={<CollectionSettings />} />
            <Route path="integrations" element={<IntegrationsSettings />} />
            <Route path="user-management" element={<UserManagementSettings />} />
            <Route path="api-keys" element={<ApiKeys />} />
          </Route>
        </Route>
      </Route>
    </Route>,
  ),
);

const Router = () => {
  const apikey = useSelector((state: RootState) => state.apiSession.apikey);
  const webuiPreviewTheme = useSelector((state: RootState) => state.misc.webuiPreviewTheme);

  const settingsQuery = useSettingsQuery(!!apikey);
  const { theme } = settingsQuery.data.WebUI_Settings;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyVisible, setBodyVisible] = useState(false);

  useEffect(() => {
    document.body.className = `${
      apikey === '' ? globalThis.localStorage.getItem('theme') : (webuiPreviewTheme || theme)
    } theme-shoko-gray`;
    const timeoutId = setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.style.visibility = 'initial';
        setBodyVisible(true);
      }
    }, 125);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [apikey, theme, webuiPreviewTheme]);

  return (
    <div id="app-container" className="flex h-screen" ref={bodyRef}>
      <BodyVisibleContext.Provider value={bodyVisible}>
        <RouterProvider router={router} />
      </BodyVisibleContext.Provider>
    </div>
  );
};

export default Router;
