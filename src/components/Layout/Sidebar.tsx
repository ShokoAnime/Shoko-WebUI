import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { push } from 'connected-react-router';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faFolderOpen, faListAlt, faSlidersH, faQuestionCircle, faFileAlt,
  faServer,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithubSquare } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setStatus } from '../../core/slices/modals/profile';

class Sidebar extends React.Component<Props> {
  componentDidMount() {
    const { showProfile } = this.props;
    showProfile(false);
  }

  handleShowProfile = () => {
    const { showProfile } = this.props;
    showProfile(true);
  };

  renderItem = (key: string, text: string, icon) => {
    const { pathname, changePage } = this.props;

    return (
      <div key={key} className={cx(['flex items-center sidebar-item mt-10 first:mt-16', pathname === `/${key}` && 'color-highlight-1'])} onClick={() => changePage(key)}>
        <FontAwesomeIcon icon={icon} className="text-xl2" title={text} />
      </div>
    );
  };

  renderLink = (url: string, text: string, icon) => (
    <a href={url} target="_blank" rel="noreferrer">
      <div key={url} className="flex items-center sidebar-item mt-10">
        <FontAwesomeIcon icon={icon} className="text-xl2" title={text} />
      </div>
    </a>
  );

  render() {
    const { items, username } = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow items-center p-4 h-screen bg-color-1">
          <div className="flex flex-col">
            <img src="logo.png" alt="logo" className="w-12" />
            <div className="flex cursor-pointer items-center justify-center user-icon w-12 h-12 text-xl rounded-full mt-12" onClick={() => this.handleShowProfile()}>
              {username.charAt(0)}
            </div>
            <div className="flex flex-col mt-10 items-center">
              <FontAwesomeIcon icon={faServer} className="text-xl2" title="Queue Count" />
              <span className="mt-2 color-highlight-1">{items.HasherQueueCount + items.GeneralQueueCount + items.ImageQueueCount}</span>
            </div>
          </div>
          <div className="flex flex-col flex-grow justify-between">
            <div className="flex flex-col">
              {this.renderItem('dashboard', 'Dashboard', faTachometerAlt)}
              {this.renderItem('import-folders', 'Import Folders', faFolderOpen)}
              {this.renderItem('actions', 'Actions', faListAlt)}
              {this.renderItem('logs', 'Log', faFileAlt)}
              {this.renderItem('settings', 'Settings', faSlidersH)}
            </div>
            <div className="flex flex-col">
              {this.renderLink('https://docs.shokoanime.com', 'Support', faQuestionCircle)}
              {this.renderLink('https://discord.gg/vpeHDsg', 'Discord', faDiscord)}
              {this.renderLink('https://github.com/ShokoAnime', 'Github', faGithubSquare)}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  pathname: state.router.location.pathname,
  items: state.mainpage.queueStatus,
  username: state.apiSession.username,
});

const mapDispatch = {
  changePage: (page: string) => (push(`${page}`)),
  logout: () => ({ type: Events.AUTH_LOGOUT, payload: { clearState: true } }),
  showProfile: (value: boolean) => (setStatus(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(Sidebar);
