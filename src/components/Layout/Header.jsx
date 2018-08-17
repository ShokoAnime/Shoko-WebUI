// @flow
import React from 'react';
import { Navbar, Hero, Media, Image } from 'react-bulma-components';

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
        <Navbar>
          <Navbar.Brand>
            <Logo />
          </Navbar.Brand>
          <Navbar.Container position="end">
            <Navbar.Item>
              <Media>
                <Media.Item>
                  <p>Lorem Ipsum</p>
                </Media.Item>
                <Media.Item className="image is-64x64" position="right">
                  <img className="is-rounded" alt="64x64" src="http://bulma.io/images/placeholders/64x64.png" />
                </Media.Item>
              </Media>
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
