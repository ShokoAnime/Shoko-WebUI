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

class Header extends React.Component {
  render() {
    const { countHasher, countGeneral, countImages, autoUpdate, sidebarToggle, updateAvailable } = this.props;
      return (
        <header className="header white-bg">
          <SidebarToggle enabled={sidebarToggle}/>
          <Logo/>
          <div className="nav notifications">
            <ul className="nav">
              <HasherQueue count={countHasher}/>
              <GeneralQueue count={countGeneral}/>
              <ImageQueue count={countImages}/>
              <UpdateButton enabled={updateAvailable} />
            </ul>
          </div>

          <div className="nav notifications pull-right">
            <ul className="nav">
              <Notifications/>
              <AutoRefreshSwitch enabled={autoUpdate}/>
            </ul>
          </div>
        </header>
    );
  }
}

function mapStateToProps(state) {
    const { queueStatus, autoUpdate, sidebarToggle, updateAvailable } = state;
    const items = queueStatus.items || {};

    return {
        countHasher: items.hash?items.hash.count:null,
        countGeneral: items.general?items.general.count:null,
        countImages: items.image?items.image.count:null,
        autoUpdate: autoUpdate.status,
        sidebarToggle: sidebarToggle,
        updateAvailable: updateAvailable.status
    }
}

export default connect(mapStateToProps)(Header)