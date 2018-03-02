// @flow
import React from 'react';
import Logo from './Logo';
import GeneralQueue from './GeneralQueue';
import HasherQueue from './HasherQueue';
import ImageQueue from './ImageQueue';
import AutoRefreshSwitch from '../Buttons/AutoRefreshSwitch';
import SidebarToggle from '../Buttons/SidebarToggle';
import UpdateButton from '../Buttons/UpdateButton';
import Notifications from './Notifications';
import UserDropdown from '../UserDropdown/UserDropdown';

export default class Header extends React.Component<{}> {
  render() {
    return (
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
            <AutoRefreshSwitch />
          </ul>
        </div>
        <UserDropdown />
      </header>
    );
  }
}
