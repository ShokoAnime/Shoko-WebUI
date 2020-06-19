import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';

import Events from '../../core/events';
import Footer from './Footer';
import Button from '../../components/Buttons/Button';
import AniDBTab from './CommunitySiteTabs/AniDBTab';
import TvDBTab from './CommunitySiteTabs/TvDBTab';
import MovieDBTab from './CommunitySiteTabs/MovieDBTab';
import TraktTab from './CommunitySiteTabs/TraktTab';
import PlexTab from './CommunitySiteTabs/PlexTab';

type State = {
  activeTab: string,
};

class CommunitySites extends React.Component<Props, State> {
  state = {
    activeTab: 'anidb',
  };

  componentDidMount() {
    const { getSettings } = this.props;
    getSettings();
  }

  changeTab = (tab: string) => {
    this.setState({
      activeTab: tab,
    });
  };

  renderTabButton = (title: string, key: string) => {
    const { activeTab } = this.state;
    return (
      <Button onClick={() => this.changeTab(key)} className={cx(['mr-6 font-bold', activeTab === key && 'color-accent'])}>
        {title}
      </Button>
    );
  };

  renderTabContent = () => {
    const { activeTab } = this.state;

    switch (activeTab) {
      case 'anidb':
        return (<AniDBTab />);
      case 'tvdb':
        return (<TvDBTab />);
      case 'moviedb':
        return (<MovieDBTab />);
      case 'trakt':
        return (<TraktTab />);
      case 'plex':
        return (<PlexTab />);
      default:
        return (<AniDBTab />);
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow px-10 pt-10 overflow-y-auto">
          <div className="font-bold text-lg">Community Sites</div>
          <div className="font-muli mt-5">
            Shoko supports multiple community sites that can be used to download additional
            metadata for the series in your collection. We highly recommend going through each
            sites settings and configuring them to your liking.
          </div>
          <div className="flex mt-6 border-b pb-4">
            {this.renderTabButton('AniDB', 'anidb')}
            {this.renderTabButton('The TvDB', 'tvdb')}
            {this.renderTabButton('The Movie DB', 'moviedb')}
            {this.renderTabButton('Trakt.TV', 'trakt')}
            {this.renderTabButton('Plex', 'plex')}
          </div>
          <div className="flex flex-col mt-4 overflow-y-auto flex-shrink">
            {this.renderTabContent()}
          </div>
        </div>
        <Footer prevTabKey="tab-anidb-account" nextTabKey="tab-import-folders" />
      </React.Fragment>
    );
  }
}

const mapDispatch = {
  getSettings: () => ({ type: Events.SETTINGS_GET_SERVER }),
};

const connector = connect(() => ({}), mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(CommunitySites);
