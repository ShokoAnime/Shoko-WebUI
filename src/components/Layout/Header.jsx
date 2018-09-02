// @flow
import React from 'react';
import {
  Navbar, Media, Icon,
} from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faFolderOpen, faListAlt, faSlidersH,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import Logo from './Logo';
import QueueStatus from './QueueStatus';
import RefreshSwitch from '../Buttons/AutoRefreshSwitch';
import UpdateButton from '../Buttons/UpdateButton';
import Notifications from './Notifications';
import UserDropdown from '../UserDropdown/UserDropdown';

export default class Header extends React.Component<{}> {
  render() {
    return ([
      <Navbar className="primary-navbar">
        <Navbar.Brand>
          <Logo />
        </Navbar.Brand>
        <Navbar.Container position="end">
          <Media>
            <Media.Item>
              <p>Lorem Ipsum</p>
            </Media.Item>
            <Media.Item renderAs="figure" className="image is-48x48" position="right">
              <img className="is-rounded" alt="64x64" src="http://bulma.io/images/placeholders/48x48.png" />
            </Media.Item>
          </Media>
        </Navbar.Container>
      </Navbar>,
      <Navbar className="secondary-navbar">
        <Navbar.Container position="start">
          <Link className="navbar-item" to="/dashboard">
            <Icon><FontAwesomeIcon icon={faChartBar} /></Icon>
            <span>Dashboard</span>
          </Link>
          <Link className="navbar-item" to="/import">
            <Icon><FontAwesomeIcon icon={faFolderOpen} /></Icon>
            <span>Import Folders</span>
          </Link>
          <Link className="navbar-item" to="/actions">
            <Icon><FontAwesomeIcon icon={faListAlt} /></Icon>
            <span>Actions</span>
          </Link>
          <Link className="navbar-item" to="/settings">
            <Icon><FontAwesomeIcon icon={faSlidersH} /></Icon>
            <span>Settings</span>
          </Link>
        </Navbar.Container>
        <Navbar.Container position="end">
          <QueueStatus />
        </Navbar.Container>
      </Navbar>,
    ]);
  }
}
