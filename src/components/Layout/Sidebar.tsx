import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { push } from 'connected-react-router';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faFolderOpen, faListAlt, faSlidersH, faQuestionCircle, faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithubSquare } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';

class Sidebar extends React.Component<Props> {
  renderItem = (key: string, text: string, icon) => {
    const { pathname, changePage } = this.props;

    return (
      <div key={key} className={cx(['flex items-center sidebar-item mt-12', pathname === `/${key}` && 'color-accent'])} onClick={() => changePage(key)}>
        <span className="flex w-8"><FontAwesomeIcon icon={icon} className="text-xl" /></span>
        <span className="ml-6 font-semibold uppercase text-lg">{text}</span>
      </div>
    );
  };

  renderLink = (url: string, text: string, icon) => (
    <a href={url} target="_blank" rel="noreferrer">
      <div key={url} className="flex items-center sidebar-item mt-12">
        <span className="flex w-8"><FontAwesomeIcon icon={icon} className="text-xl" /></span>
        <span className="ml-6 font-semibold uppercase text-lg no-underline">{text}</span>
      </div>
    </a>
  );

  render() {
    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10 h-screen fixed sidebar">
          <div className="h-auto italic font-extrabold text-4xl text-center uppercase">
            Shoko <span className="color-accent">Server</span>
          </div>
          <div className="flex flex-col flex-grow justify-between">
            <div className="flex flex-col">
              {this.renderItem('dashboard', 'Dashboard', faTachometerAlt)}
              {this.renderItem('import-folders', 'Import Folders', faFolderOpen)}
              {this.renderItem('actions', 'Actions', faListAlt)}
              {this.renderItem('logs', 'Log', faFileAlt)}
              {this.renderItem('settings', 'Settings', faSlidersH)}
              {/* {this.renderItem('manager', 'Manage', faThLarge)} */}
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
});

const mapDispatch = {
  changePage: (page: string) => (push(`${page}`)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(Sidebar);
