import React from 'react';
import { connect } from 'react-redux';
import Logo from './Logo';
import GeneralQueue from './GeneralQueue';
import HasherQueue from './HasherQueue';
import ImageQueue from './ImageQueue';
import AutoRefreshSwitch from './AutoRefreshSwitch';

class Header extends React.Component {
  render() {
    const { countHasher, countGeneral, countImages, autoUpdate } = this.props;
      return (
        <header className="header white-bg">
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
    const { queueStatus, autoUpdate } = state;
    const items = queueStatus.items || {};

    return {
        countHasher: items[0]?items[0].count:null,
        countGeneral: items[1]?items[1].count:null,
        countImages: items[2]?items[2].count:null,
        autoUpdate: autoUpdate.status
    }
}

export default connect(mapStateToProps)(Header)