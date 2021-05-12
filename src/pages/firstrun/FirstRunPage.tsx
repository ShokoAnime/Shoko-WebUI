import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCircle as faCircleSolid, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { replace } from 'connected-react-router';

import { RootState } from '../../core/store';
import { uiVersion } from '../../core/util';
import Events from '../../core/events';
import Acknowledgement from './Acknowledgement';
import DatabaseSetup from './DatabaseSetup';
import LocalAccount from './LocalAccount';
import AniDBAccount from './AniDBAccount';
import CommunitySites from './CommunitySites';
import StartServer from './StartServer';
import ImportFolders from './ImportFolders';
import DataCollection from './DataCollection';

const UI_VERSION = uiVersion();

class FirstRunPage extends React.Component<Props> {
  componentDidMount() {
    const {
      status, redirectToLogin, serverVersion, getSettings,
    } = this.props;
    if (status.State !== 4) {
      redirectToLogin();
      return;
    }
    serverVersion();
    getSettings();
  }

  renderVersion() {
    const {
      version,
      isFetching,
    } = this.props;

    return (
      <div className="text-center text-base mt-3 font-semibold">{isFetching ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
        {version} (WebUI {UI_VERSION})
      </div>
    );
  }

  renderItem = (text: string, key: string) => {
    const { activeTab, saved } = this.props;

    return (
      <tr key={key}>
        <td className="py-4">
          <div className="font-mulish font-bold flex cursor-default">
            <FontAwesomeIcon
              icon={
                // eslint-disable-next-line no-nested-ternary
                activeTab === key ? faCircleSolid
                  : (saved[key] ? faCheckCircle : faCircle)
                }
              className="mr-5 color-accent text-xl"
            />
            {text}
          </div>
        </td>
      </tr>
    );
  };

  renderContent = () => {
    const { activeTab } = this.props;

    switch (activeTab) {
      case 'acknowledgement':
        return (<Acknowledgement />);
      case 'db-setup':
        return (<DatabaseSetup />);
      case 'local-account':
        return (<LocalAccount />);
      case 'anidb-account':
        return (<AniDBAccount />);
      case 'community-sites':
        return (<CommunitySites />);
      case 'start-server':
        return (<StartServer />);
      case 'import-folders':
        return (<ImportFolders />);
      case 'data-collection':
        return (<DataCollection />);
      default:
        return (<Acknowledgement />);
    }
  };

  render() {
    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <div className="flex rounded-lg shadow-lg firstrun-panel">
          <div className="flex flex-grow firstrun-image rounded-l-lg">
            <div className="flex flex-col flex-grow firstrun-sidebar h-full rounded-l-lg py-5">
              <div>
                <div className="text-center text-4xl2 font-extrabold uppercase italic">Shoko <span className="color-accent">Server</span></div>
                {this.renderVersion()}
              </div>
              <div className="flex flex-col flex-grow justify-center ml-16">
                <table>
                  <tbody>
                    {this.renderItem('Acknowledgement', 'acknowledgement')}
                    {this.renderItem('Database Setup', 'db-setup')}
                    {this.renderItem('Local Account', 'local-account')}
                    {this.renderItem('AniDB Account', 'anidb-account')}
                    {this.renderItem('Community Sites', 'community-sites')}
                    {this.renderItem('Start Server', 'start-server')}
                    {this.renderItem('Import Folders', 'import-folders')}
                    {this.renderItem('Data Collection', 'data-collection')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex flex-col firstrun-content justify-between leading-normal">
            {this.renderContent()}
          </div>
        </div>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  version: state.jmmVersion,
  isFetching: state.fetching.serverVersion,
  activeTab: state.firstrun.activeTab,
  saved: state.firstrun.saved,
  status: state.firstrun.status,
});

const mapDispatch = {
  serverVersion: () => ({ type: Events.SERVER_VERSION }),
  getSettings: () => ({ type: Events.SETTINGS_GET_SERVER }),
  redirectToLogin: () => (replace('/')),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(FirstRunPage);
