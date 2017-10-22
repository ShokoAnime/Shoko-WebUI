import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import s from './AlertContainer.css';
import Notification from './Notification';

class AlertContainer extends React.Component {
  static propTypes = {
    globalAlert: PropTypes.array.isRequired,
  };

  render() {
    const { globalAlert } = this.props;
    const alerts = [];

    forEach(globalAlert, (alert) => {
      alerts.push(<Notification type={alert.type} text={alert.text} />);
    });

    return (
      <div className={s.alertContainer}>{alerts}</div>
    );
  }
}

function mapStateToProps(state) {
  const { globalAlert } = state;

  return {
    globalAlert,
  };
}

export default connect(mapStateToProps)(AlertContainer);
