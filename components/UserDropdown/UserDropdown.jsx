import React, { PropTypes } from 'react';
import cx from 'classnames';
import { Dropdown, MenuItem } from 'react-bootstrap';
import store from '../../core/store';
import history from '../../core/history';
import { Logout } from '../../core/actions';
import s from './UserDropdown.css';

class UserDropdown extends React.Component {
  static propTypes = {
    user: PropTypes.string,
  };

  // TODO: Move this to saga
  static handleLogout() {
    store.dispatch(Logout());
    history.push({ pathname: '/' });
  }

  render() {
    const { user } = this.props;
    return (
      <div className={cx('nav notifications pull-right', s['user-dropdown'])}>
        <Dropdown bsStyle="white" title="User" className="pull-right" id="user">
          <Dropdown.Toggle className={s['user-toggle']} useAnchor>{user}</Dropdown.Toggle>
          <Dropdown.Menu className={cx('dropdown-menu', s.menu)} bsRole="menu">
            <MenuItem eventKey="1"><i className="fa fa-user" />Profile</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="2"><i className="fa fa-key" />Change password</MenuItem>
            <MenuItem onClick={UserDropdown.handleLogout} eventKey="3"><i className="fa fa-sign-out" />Logout</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}

export default UserDropdown;
