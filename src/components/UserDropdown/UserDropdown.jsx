// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import s from './UserDropdown.css';
import Events from '../../core/events';

type Props = {
  user: string,
  logout: () => void,
}

class UserDropdown extends React.Component<Props> {
  static propTypes = {
    user: PropTypes.string,
    logout: PropTypes.func,
  };

  render() {
    const { user, logout } = this.props;
    return (
      <div className={cx('nav notifications pull-right', s['user-dropdown'])}>
        <Dropdown bsStyle="white" title="User" className="pull-right" id="user">
          <Dropdown.Toggle className={s['user-toggle']} useAnchor>{user}</Dropdown.Toggle>
          <Dropdown.Menu className={cx('dropdown-menu', s.menu)} bsRole="menu">
            <MenuItem eventKey="1"><i className="fa fa-user" />Profile</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="2"><i className="fa fa-key" />Change password</MenuItem>
            <MenuItem onClick={logout} eventKey="3"><i className="fa fa-sign-out" />Logout</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { apiSession } = state;

  return {
    username: apiSession.username,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    logout: () => { dispatch(Events.LOGOUT); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDropdown);
