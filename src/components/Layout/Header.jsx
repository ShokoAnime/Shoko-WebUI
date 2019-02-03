// @flow
import cx from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import {
  Navbar, Icon,
} from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faFolderOpen, faListAlt, faSlidersH,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import Logo from './Logo';
import QueueStatus from './QueueStatus';
// import RefreshSwitch from '../Buttons/AutoRefreshSwitch';
import UpdateButton from '../Buttons/UpdateButton';
import UserDropdown from '../UserDropdown/UserDropdown';

type Props = {
  pathname: string,
}

class Header extends React.Component<Props> {
  renderLink = (url, text, icon) => {
    const { pathname } = this.props;
    return (
      <Link key={url} className={cx(['navbar-item', url === pathname && 'is-active'])} to={url}>
        <Icon><FontAwesomeIcon icon={icon} /></Icon>
        <span>{text}</span>
      </Link>
    );
  };

  render() {
    return (
      <React.Fragment>
        <Navbar className="primary-navbar">
          <Navbar.Brand>
            <Logo />
          </Navbar.Brand>
          <Navbar.Container position="end">
            <UserDropdown />
          </Navbar.Container>
        </Navbar>
        <Navbar className="secondary-navbar">
          <Navbar.Container position="start">
            {this.renderLink('/dashboard', 'Dashboard', faChartBar)}
            {this.renderLink('/import-folders', 'Import Folders', faFolderOpen)}
            {this.renderLink('/actions', 'Actions', faListAlt)}
            {this.renderLink('/settings', 'Settings', faSlidersH)}
          </Navbar.Container>
          <Navbar.Item className="update-button">
            <UpdateButton />
          </Navbar.Item>
          <Navbar.Container position="end">
            <QueueStatus />
          </Navbar.Container>
        </Navbar>
      </React.Fragment>
    );
  }
}


function mapStateToProps(state): Props {
  const { router } = state;
  const { location } = router;

  return {
    pathname: location.pathname,
  };
}

export default connect(mapStateToProps, () => ({}))(Header);
