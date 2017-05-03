import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Logo from './Logo';
import GeneralQueue from './GeneralQueue';
import HasherQueue from './HasherQueue';
import ImageQueue from './ImageQueue';
import AutoRefreshSwitch from '../Buttons/AutoRefreshSwitch';
import SidebarToggle from '../Buttons/SidebarToggle';
import UpdateButton from '../Buttons/UpdateButton';
import Notifications from './Notifications';
import UserDropdown from '../UserDropdown/UserDropdown';

class Header extends React.Component {
  static propTypes = {
    countHasher: PropTypes.number,
    countGeneral: PropTypes.number,
    countImages: PropTypes.number,
    autoUpdate: PropTypes.bool,
    sidebarToggle: PropTypes.bool,
    updateAvailable: PropTypes.bool,
    webuiVersionUpdate: PropTypes.object,
    username: PropTypes.string,
  };

  render() {
    const { countHasher, countGeneral, countImages, autoUpdate, sidebarToggle, updateAvailable,
      webuiVersionUpdate, username } = this.props;
    return (
      <header className="header white-bg">
        <SidebarToggle enabled={sidebarToggle} />
        <Logo />
        <div className="nav notifications">
          <ul className="nav">
            <HasherQueue count={countHasher} />
            <GeneralQueue count={countGeneral} />
            <ImageQueue count={countImages} />
            <UpdateButton enabled={updateAvailable} updateStatus={webuiVersionUpdate} />
          </ul>
        </div>
        <div className="nav notifications pull-right">
          <ul className="nav">
            <Notifications />
            <AutoRefreshSwitch enabled={autoUpdate} />
          </ul>
        </div>
        <UserDropdown user={username} />
      </header>
    );
  }
}

function mapStateToProps(state) {
  const { queueStatus, autoUpdate, sidebarToggle, updateAvailable,
    webuiVersionUpdate, apiSession, settings } = state;
  const items = queueStatus.items || {};

  return {
    countHasher: items.hash ? items.hash.count : null,
    countGeneral: items.general ? items.general.count : null,
    countImages: items.image ? items.image.count : null,
    autoUpdate,
    sidebarToggle,
    updateAvailable: updateAvailable.status,
    updateChannel: settings.other.updateChannel,
    webuiVersionUpdate,
    username: apiSession.username,
  };
}

export default connect(mapStateToProps)(Header);
