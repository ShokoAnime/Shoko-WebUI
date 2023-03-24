/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { ReduxRouter } from '@lagunovsky/redux-react-router';
import { useSelector } from 'react-redux';
import type { BrowserHistory } from 'history';

import { RootState } from '../store';
import LoginPage from '../../pages/login/LoginPage';
import ErrorPage from '../../pages/error/ErrorPage';
import MainPage from '../../pages/main/MainPage';
import FirstRunPage from '../../pages/firstrun/FirstRunPage';
import AuthenticatedRoute from './AuthenticatedRoute';

// Main page
import DashboardPage from '../../pages/dashboard/DashboardPage';
import LogsPage from '../../pages/logs/LogsPage';
import NoMatchPage from '../../pages/nomatch';
import UtilitiesPage from '../../pages/utilities/UtilitiesPage';

// First run
import Acknowledgement from '../../pages/firstrun/Acknowledgement';
import DatabaseSetup from '../../pages/firstrun/DatabaseSetup';
import LocalAccount from '../../pages/firstrun/LocalAccount';
import AniDBAccount from '../../pages/firstrun/AniDBAccount';
import MetadataSources from '../../pages/firstrun/MetadataSources';
import StartServer from '../../pages/firstrun/StartServer';
import ImportFolders from '../../pages/firstrun/ImportFolders';
import DataCollection from '../../pages/firstrun/DataCollection';

// Collection
import GroupList from '../../pages/collection/GroupList';
import Group from '../../pages/collection/Group';
import FilterGroupList from '../../pages/collection/FilterGroupList';
import Series from '../../pages/collection/Series';
import SeriesOverview from '../../pages/collection/series/SeriesOverview';
import SeriesEpisodes from '../../pages/collection/series/SeriesEpisodes';
import SeriesEpisodeDetails from '../../pages/collection/series/SeriesEpisodeDetails';
import SeriesCredits from '../../pages/collection/series/SeriesCredits';
import SeriesImages from '../../pages/collection/series/SeriesImages';
import SeriesFiles from '../../pages/collection/series/SeriesFiles';

// Utilities
import UnrecognizedUtility from '../../pages/utilities/UnrecognizedUtility';
import UnrecognizedTab from '../../pages/utilities/UnrecognizedUtilityTabs/UnrecognizedTab';
import ManuallyLinkedTab from '../../pages/utilities/UnrecognizedUtilityTabs/ManuallyLinkedTab';
import IgnoredFilesTab from '../../pages/utilities/UnrecognizedUtilityTabs/IgnoredFilesTab';
import MultipleFilesUtility from '../../pages/utilities/MultipleFilesUtility';
import SeriesWithoutFilesUtility from '../../pages/utilities/SeriesWithoutFilesUtility';

// Settings
import SettingsPage, { initialSettings } from '../../pages/settings/SettingsPage';
import GeneralSettings from '../../pages/settings/tabs/GeneralSettings';
import ImportSettings from '../../pages/settings/tabs/ImportSettings';
import AniDBSettings from '../../pages/settings/tabs/AniDBSettings';
import MetadataSitesSettings from '../../pages/settings/tabs/MetadataSitesSettings';
import UserManagementSettings from '../../pages/settings/tabs/UserManagementSettings';

import { useGetSettingsQuery } from '../rtkQuery/splitV3Api/settingsApi';

type Props = {
  history: BrowserHistory;
};

function Router(props: Props) {
  const apikey = useSelector((state: RootState) => state.apiSession.apikey);

  const settingsQuery = useGetSettingsQuery(undefined, { skip: apikey === '' });
  const { theme } = settingsQuery.data?.WebUI_Settings ?? initialSettings.WebUI_Settings;

  useEffect(() => {
    document.body.className = 'theme-shoko-blue';
  }, []);

  const { history } = props;

  return (
    <div id="app-container" className={`${theme} theme-shoko-blue flex h-screen`}>
      <ReduxRouter history={history}>
        <Routes>
          <Route index element={<Navigate to="/webui" replace />} />
          <Route path="/webui">
            <Route path="index.html" element={<Navigate to="/webui" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="error" element={<ErrorPage />} />
            <Route path="firstrun" element={<FirstRunPage />}>
              <Route index element={<Navigate to="acknowledgement" replace />} />
              <Route path="acknowledgement" element={<Acknowledgement />} />
              <Route path="db-setup" element={<DatabaseSetup />} />
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
                <Route path="utilities" element={<UtilitiesPage />}>
                  <Route index element={<Navigate to="unrecognized" replace />} />
                  <Route path="unrecognized" element={<UnrecognizedUtility />}>
                    <Route index element={<Navigate to="files" />} />
                    <Route path="files" element={<UnrecognizedTab />} />
                    <Route path="manually-linked-files" element={<ManuallyLinkedTab />} />
                    <Route path="ignored-files" element={<IgnoredFilesTab />} />
                  </Route>
                  <Route path="multiple-files" element={<MultipleFilesUtility />} />
                  <Route path="series-without-files" element={<SeriesWithoutFilesUtility />} />
                </Route>
                <Route path="log" element={<LogsPage />} />
                <Route path="collection">
                  <Route index element={<GroupList />}/>
                  <Route path="group/:groupId" element={<Group />}/>
                  <Route path="filter/:filterId" element={<FilterGroupList />}/>
                  <Route path="series/:seriesId" element={<Series />}>
                    <Route index element={<Navigate to="overview" replace />}/>
                    <Route path="overview" element={<SeriesOverview />}/>
                    <Route path="episodes" element={<SeriesEpisodes />}/>
                    <Route path="episodes/:episodeId" element={<SeriesEpisodeDetails />}/>
                    <Route path="credits" element={<SeriesCredits />}/>
                    <Route path="images" element={<SeriesImages />}/>
                    <Route path="files" element={<SeriesFiles />}/>
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
                <Route path="*" element={<NoMatchPage />} />
            </Route>
          </Route>
        </Routes>
      </ReduxRouter>
    </div>
  );
}

export default Router;
