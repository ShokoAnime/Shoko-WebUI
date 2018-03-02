// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { setAutoupdate } from '../../core/legacy-actions';

type Props = {
  autoUpdate: bool,
  setAutoUpdate: (value: bool) => void
};

class AutoRefreshSwitch extends React.Component<Props> {
  static propTypes = {
    autoUpdate: PropTypes.bool.isRequired,
  };

  handleClick = () => {
    this.props.setAutoUpdate(!this.props.autoUpdate);
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

function mapStateToProps(state) {
  const { autoUpdate } = state;

  return {
    autoUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAutoUpdate: value => dispatch(setAutoupdate(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoRefreshSwitch);
