// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import store from '../../core/store';
import { setAutoupdate } from '../../core/legacy-actions';

class AutoRefreshSwitch extends React.Component {
  static propTypes = {
    autoUpdate: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const newState = !this.props.autoUpdate;
    store.dispatch(setAutoupdate(newState));
  }

  render() {
    const { autoUpdate } = this.props;
    return (
      <li className={cx('notification', autoUpdate ? 'enabled' : null)}>
        <a className="dropdown-toggle" onClick={this.handleClick}>
          <i className="fa fa-check-square" />
        </a>
      </li>
    );
  }
}

function mapStateToProps(state) {
  const { autoUpdate } = state;

  return {
    autoUpdate,
  };
}

export default connect(mapStateToProps)(AutoRefreshSwitch);
