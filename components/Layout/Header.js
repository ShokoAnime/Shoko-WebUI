import React from 'react';
import { connect } from 'react-redux';
import Logo from './Logo';
import GeneralQueue from './GeneralQueue';
import HasherQueue from './HasherQueue';
import ImageQueue from './ImageQueue';
import AutoRefreshSwitch from './AutoRefreshSwitch';
import SidebarToggle from './SidebarToggle';

class Header extends React.Component {
  render() {
    const { countHasher, countGeneral, countImages, autoUpdate, sidebarToggle } = this.props;
      return (
        <header className="header white-bg">
          <SidebarToggle enabled={sidebarToggle}/>
          <Logo/>
          <div className="nav notifications">
            <ul className="nav">
              <HasherQueue count={countHasher}/>
              <GeneralQueue count={countGeneral}/>
              <ImageQueue count={countImages}/>
            </ul>
          </div>
          <div className="nav notifications pull-right">
            <ul className="nav">
              <AutoRefreshSwitch enabled={autoUpdate}/>
            </ul>
          </div>
        </header>
    );
  }
}

function mapStateToProps(state) {
    const { queueStatus, autoUpdate, sidebarToggle } = state;
    const items = queueStatus.items || {};

    return {
        countHasher: items.hash?items.hash.count:null,
        countGeneral: items.general?items.general.count:null,
        countImages: items.image?items.image.count:null,
        autoUpdate: autoUpdate.status,
        sidebarToggle: sidebarToggle
    }
}

export default connect(mapStateToProps)(Header)