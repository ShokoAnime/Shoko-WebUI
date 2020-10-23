import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';

import DasboardTab from './Tabs/DashboardTab';
import ImportFoldersTab from './Tabs/ImportFoldersTab';
import ActionsTab from './Tabs/ActionsTab';
import SettingsTab from './Tabs/SettingsTab';
import LogsTab from './Tabs/LogsTab';

import ImportFolderModal from '../../components/Dialogs/ImportFolderModal';
import LanguagesModal from '../../components/Dialogs/LanguagesModal';
import ProfileModal from '../../components/Dialogs/ProfileModal';

class MainPage extends React.Component<Props> {
  componentDidMount() {
    const {
      load, getSettings, getQueueStatus,
    } = this.props;
    getSettings();
    load();
    getQueueStatus();
  }

  renderContent = () => {
    const { activeTab } = this.props;

    switch (activeTab) {
      case 'dashboard':
        return (<DasboardTab />);
      case 'import-folders':
        return (<ImportFoldersTab />);
      case 'actions':
        return (<ActionsTab />);
      case 'settings':
        return (<SettingsTab />);
      case 'logs':
        return (<LogsTab />);
      default:
        return (<DasboardTab />);
    }
  };

  render() {
    const { notifications, toastPosition } = this.props;

    return (
      <React.Fragment>
        {notifications && (
          <ToastContainer
            position={toastPosition}
            autoClose={4000}
            transition={Slide}
            bodyClassName="font-bold font-exo2"
            className="mt-20"
          />
        )}
        <div className="flex flex-grow h-full">
          <ImportFolderModal />
          <LanguagesModal />
          <ProfileModal />
          <div className="flex h-screen sidebar-container">
            <Sidebar />
          </div>
          <div className="flex flex-col flex-grow h-full">
            <Header />
            <div className="overflow-y-auto flex-grow">
              {this.renderContent()}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  activeTab: state.mainpage.activeTab,
  toastPosition: state.webuiSettings.v3.toastPosition,
  notifications: state.webuiSettings.v3.notifications,
});

const mapDispatch = {
  getQueueStatus: () => ({ type: Events.MAINPAGE_QUEUE_STATUS }),
  getSettings: () => ({ type: Events.SETTINGS_GET_SERVER }),
  load: () => ({ type: Events.MAINPAGE_LOAD }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(MainPage);
