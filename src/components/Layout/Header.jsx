// @flow
import React from 'react';
import { Navbar, Hero, Media, Image, Level, Icon } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faFolderOpen, faListAlt, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import s from './Header.css';

import Logo from './Logo';
import GeneralQueue from './GeneralQueue';
import HasherQueue from './HasherQueue';
import ImageQueue from './ImageQueue';
import RefreshSwitch from '../Buttons/AutoRefreshSwitch';
import SidebarToggle from '../Buttons/SidebarToggle';
import UpdateButton from '../Buttons/UpdateButton';
import Notifications from './Notifications';
import UserDropdown from '../UserDropdown/UserDropdown';

export default class Header extends React.Component<{}> {
  render() {
    return (
      <Hero.Head>
        <Navbar className={s['primary-navbar']}>
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
        </Navbar>
        <Navbar className={s['secondary-navbar']}>
          <Navbar.Container position="start">
            <Navbar.Item>
              <Link to="/dashboard"><FontAwesomeIcon icon={faChartBar} />Dashboard</Link>
            </Navbar.Item>
            <Navbar.Item>
              <Link to="/import"><FontAwesomeIcon icon={faFolderOpen} />Import Folders</Link>
            </Navbar.Item>
            <Navbar.Item>
              <Link to="/actions"><FontAwesomeIcon icon={faListAlt} />Actions</Link>
            </Navbar.Item>
            <Navbar.Item>
              <Link to="/settings"><FontAwesomeIcon icon={faSlidersH} />Settings</Link>
            </Navbar.Item>
          </Navbar.Container>
        </Navbar>
      </Hero.Head>
    );

    /*return (
      <header className="header white-bg">
        <SidebarToggle />
        <Logo />
        <div className="nav notifications">
          <ul className="nav">
            <HasherQueue />
            <GeneralQueue />
            <ImageQueue />
            <UpdateButton />
          </ul>
        </div>
        <div className="nav notifications pull-right">
          <ul className="nav">
            <Notifications />
            <RefreshSwitch />
          </ul>
        </div>
        <UserDropdown />
      </header>
    );*/
  }
}
