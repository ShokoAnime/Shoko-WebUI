// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { Media } from 'react-bulma-components';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faKey, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import Events from '../../core/events';
import ChangePasswordModal from '../Dialogs/ChangePasswordModal';
import { setStatus } from '../../core/actions/modals/ChangePassword';

type Props = {
  username: string,
  logout: () => void,
  updateStatus: (boolean) => void,
}

type State = {
  open: boolean,
}

class UserDropdown extends React.Component<Props, State> {
  static propTypes = {
    username: PropTypes.string,
    logout: PropTypes.func,
    updateStatus: PropTypes.func.isRequired,
  };

  state = {
    open: false,
  };

  handleActionChangePassword = () => {
    const { updateStatus } = this.props;
    updateStatus(true);
  };

  toggle = (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState(({ open }) => ({ open: !open }));
  };

  render() {
    const { username, logout } = this.props;
    const { open } = this.state;
    return (
      <React.Fragment>
        <nav className="navbar primary-navbar user-dropdown" role="navigation" aria-label="dropdown navigation">
          <div className={cx('navbar-item has-dropdown', { 'is-active': open })}>
            <div className="navbar-link" onClick={this.toggle}>
              <Media>
                <Media.Item>
                  <p className="username">{username}</p>
                </Media.Item>
                <Media.Item renderAs="figure" className="image is-48x48" position="right">
                  <div className="avatar">{username.substr(0, 1)}</div>
                </Media.Item>
              </Media>
            </div>
            <div className="navbar-dropdown">
              <div className="navbar-item">
                <FontAwesomeIcon className="icon" icon={faUser} />Profile
              </div>
              <div onClick={this.handleActionChangePassword} className="navbar-item">
                <FontAwesomeIcon className="icon" icon={faKey} />Change password
              </div>
              <hr className="navbar-divider" />
              <div onClick={logout} className="navbar-item">
                <FontAwesomeIcon className="icon" icon={faSignOutAlt} />Logout
              </div>
            </div>
          </div>
        </nav>
        <ChangePasswordModal />
      </React.Fragment>
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
    logout: () => { dispatch({ type: Events.LOGOUT, payload: null }); },
    updateStatus: value => dispatch(setStatus(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDropdown);
