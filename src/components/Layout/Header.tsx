// import cx from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faChartBar, faFolderOpen, faListAlt, faSlidersH,
// } from '@fortawesome/free-solid-svg-icons';
// import { Link } from 'react-router-dom';

// import Logo from './Logo';
// import RefreshSwitch from '../Buttons/AutoRefreshSwitch';
// import UpdateButton from '../Buttons/UpdateButton';
// import UserDropdown from '../UserDropdown/UserDropdown';

type StateProps = {
  pathname: string;
};

type Props = StateProps;

class Header extends React.Component<Props> {
  render() {
    return (
      <React.Fragment>
        <div className="header w-full h-20">
          Header
        </div>
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

export default connect(mapStateToProps, () => ({}))(Header);
