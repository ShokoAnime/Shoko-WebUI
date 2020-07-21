import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faFolderOpen, faListAlt, faSlidersH, faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithubSquare } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import { setActiveTab } from '../../core/slices/mainpage';

class Sidebar extends React.Component<Props> {
  renderItem = (key: string, text: string, icon) => {
    const { activeTab, changeTab } = this.props;

    return (
      <div key={key} className={cx(['sidebar-item mt-12', activeTab === key && 'color-accent'])} onClick={() => changeTab(key)}>
        <FontAwesomeIcon icon={icon} className="text-xl mr-8" />
        <span className="font-semibold uppercase text-lg sidebar-item-text">{text}</span>
      </div>
    );
  };

  renderLink = (url: string, text: string, icon) => (
    <div key={url} className="sidebar-item flex mt-12">
      <a href={url} className="flex no-underline" target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={icon} className="text-xl mr-4" />
        <span className="w-11/12 font-semibold uppercase text-lg ml-4 no-underline">{text}</span>
      </a>
    </div>
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
              {/* {this.renderItem('log', 'Log', faFileAlt)} */}
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
  activeTab: state.mainpage.activeTab,
});

const mapDispatch = {
  changeTab: (tab: string) => (setActiveTab(tab)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(Sidebar);
