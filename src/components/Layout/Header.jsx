import PropTypes from 'prop-types';
import React from 'react';
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
    sidebarToggle: PropTypes.bool,
    updateAvailable: PropTypes.bool,
    webuiVersionUpdate: PropTypes.object,
  };

  render() {
    const {
      countHasher, countGeneral, countImages, sidebarToggle, updateAvailable,
      webuiVersionUpdate,
    } = this.props;
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
            <AutoRefreshSwitch />
          </ul>
        </div>
        <UserDropdown />
      </header>
    );
  }
}

function mapStateToProps(state) {
  const {
    queueStatus, sidebarToggle, updateAvailable, webuiVersionUpdate, settings,
  } = state;
  const items = queueStatus.items || {};

  return {
    countHasher: items.hash ? items.hash.count : null,
    countGeneral: items.general ? items.general.count : null,
    countImages: items.image ? items.image.count : null,
    sidebarToggle,
    updateAvailable: updateAvailable.status,
    updateChannel: settings.other.updateChannel,
    webuiVersionUpdate,
  };
}

export default connect(mapStateToProps)(Header);
