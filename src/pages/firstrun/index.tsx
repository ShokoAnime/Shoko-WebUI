import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCircle as faCircleSolid, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

import { RootState } from '../../core/store';
import { uiVersion } from '../../core/util';
import Events from '../../core/events';
import AlertContainer from '../../components/AlertContainer';
import { activeTab as activeTabAction } from '../../core/actions/firstrun';
import Acknowledgement from './Acknowledgement';
import DatabaseSetup from './DatabaseSetup';
import LocalAccount from './LocalAccount';
import AniDBAccount from './AniDBAccount';
import CommunitySites from './CommunitySites';
import ImportFolders from './ImportFolders';
import DataCollection from './DataCollection';
import Button from '../../components/Buttons/Button';

const UI_VERSION = uiVersion();

const tabIndex = {
  'tab-acknowledgement': 0,
  'tab-db-setup': 1,
  'tab-local-account': 2,
  'tab-anidb-account': 3,
  'tab-community-sites': 4,
  'tab-import-folders': 5,
  'tab-data-collection': 6,
};

class FirstRunPage extends React.Component<Props> {
  componentDidMount() {
    const { serverVersion } = this.props;
    serverVersion();
  }

  handleTabChange = (key: string) => {
    const { setActiveTab } = this.props;
    setActiveTab(key);
  };

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
    const { activeTab, status } = this.props;

    return (
      <tr key={key}>
        <td className="py-4">
          <Button onClick={() => this.handleTabChange(key)} className="font-muli font-bold flex" disabled={status.server_started}>
            <FontAwesomeIcon
              icon={
                // eslint-disable-next-line no-nested-ternary
                activeTab === key ? faCircleSolid
                  : (tabIndex[key] < tabIndex[activeTab] ? faCheckCircle : faCircle)
                }
              className="mr-5 color-accent text-xl"
            />
            {text}
          </Button>
        </td>
      </tr>
    );
  };

  renderContent = () => {
    const { activeTab } = this.props;

    switch (activeTab) {
      case 'tab-acknowledgement':
        return (<Acknowledgement />);
      case 'tab-db-setup':
        return (<DatabaseSetup />);
      case 'tab-local-account':
        return (<LocalAccount />);
      case 'tab-anidb-account':
        return (<AniDBAccount />);
      case 'tab-community-sites':
        return (<CommunitySites />);
      case 'tab-import-folders':
        return (<ImportFolders />);
      case 'tab-data-collection':
        return (<DataCollection />);
      default:
        return (<Acknowledgement />);
    }
  };

  render() {
    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <AlertContainer />
        <div className="flex rounded-lg shadow-lg firstrun-panel">
          <div className="flex flex-grow firstrun-image rounded-l-lg">
            <div className="flex flex-col flex-grow firstrun-sidebar h-full rounded-l-lg py-5">
              <div>
                <div className="text-center text-3xl2 font-extrabold uppercase italic">Shoko <span className="color-accent">Server</span></div>
                {this.renderVersion()}
              </div>
              <div className="flex flex-col flex-grow mt-12 ml-16">
                <table>
                  <tbody>
                    {this.renderItem('Acknowledgement', 'tab-acknowledgement')}
                    {this.renderItem('Database Setup', 'tab-db-setup')}
                    {this.renderItem('Local Account', 'tab-local-account')}
                    {this.renderItem('AniDB Account', 'tab-anidb-account')}
                    {this.renderItem('Community Sites', 'tab-community-sites')}
                    {this.renderItem('Import Folders', 'tab-import-folders')}
                    {this.renderItem('Data Collection', 'tab-data-collection')}
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
  status: state.firstrun.status,
});

const mapDispatch = {
  setActiveTab: (value: string) => (activeTabAction(value)),
  serverVersion: () => ({ type: Events.SERVER_VERSION }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(FirstRunPage);
