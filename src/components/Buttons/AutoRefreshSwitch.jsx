// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Events from '../../core/events';
import type { State } from '../../core/store';

type Props = {
  autoUpdate: boolean,
  startPolling: () => void,
  stopPolling: () => void,
};

export class AutoRefreshSwitch extends React.Component<Props> {
  static propTypes = {
    autoUpdate: PropTypes.bool.isRequired,
    startPolling: PropTypes.func.isRequired,
    stopPolling: PropTypes.func.isRequired,
  };

  handleClick = () => {
    const { autoUpdate, startPolling, stopPolling } = this.props;
    if (autoUpdate) { stopPolling(); } else { startPolling(); }
  };

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

function mapStateToProps(state: State) {
  const { autoUpdate } = state;

  return {
    autoUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    startPolling: () => dispatch({ type: Events.START_API_POLLING, payload: { type: 'auto-refresh' } }),
    stopPolling: () => dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'auto-refresh' } }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoRefreshSwitch);
