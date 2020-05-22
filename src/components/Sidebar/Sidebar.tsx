
import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faFolderOpen, faListAlt, faFileAlt, faSlidersH, faThLarge, faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithubSquare } from '@fortawesome/free-brands-svg-icons';
import { uiVersion } from '../../core/util';

const UI_VERSION = uiVersion();

type StateProps = {
  pathname: string;
};

type Props = StateProps;

class Sidebar extends React.Component<Props> {
  renderItem = (url, text, icon, newTab = false) => {
    const { pathname } = this.props;

    return (
      <div key={url} className={cx(['sidebar-item flex mt-12', url === pathname && 'is-active'])}>
        <a href={url} className="flex w-full" target={newTab ? '_blank' : ''}>
          <div className="w-1/12">
            <FontAwesomeIcon icon={icon} size="lg" />
          </div>
          <span className="w-11/12 font-semibold uppercase text-lg ml-4 sidebar-item-text">{text}</span>
        </a>
      </div>
    );
  };

  render() {
    return (
      <React.Fragment>
        <nav className="flex flex-col p-10 fixed h-screen w-1/5 sidebar">
          <div className="h-auto italic text-3xl text-center uppercase sidebar-heading">
            <span>Shoko </span>
            <span className="color-accent">Server</span>
          </div>
          <div className="h-auto mt-4 text-center font-semibold uppercase">{UI_VERSION}</div>
          <div className="flex flex-col justify-between h-screen">
            <div className="flex flex-col">
              {this.renderItem('/dashboard', 'Dashboard', faTachometerAlt)}
              {this.renderItem('/import-folders', 'Import Folders', faFolderOpen)}
              {this.renderItem('/actions', 'Actions', faListAlt)}
              {this.renderItem('/log', 'Log', faFileAlt)}
              {this.renderItem('/settings', 'Settings', faSlidersH)}
              {this.renderItem('/manager', 'Manage', faThLarge)}
            </div>
            <div className="flex flex-col">
              {this.renderItem('https://docs.shokoanime.com', 'Support', faQuestionCircle, true)}
              {this.renderItem('https://discord.gg/vpeHDsg', 'Discord', faDiscord, true)}
              {this.renderItem('https://github.com/ShokoAnime', 'Github', faGithubSquare, true)}
            </div>
          </div>
        </nav>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): StateProps {
  const { router } = state;
  const { location } = router;

  return {
    pathname: location.pathname,
  };
}

export default connect(mapStateToProps, () => ({}))(Sidebar);
