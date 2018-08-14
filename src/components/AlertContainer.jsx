// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import s from './AlertContainer.css';
import Notification from './Notification';

type AlertType = {
  type: 'success' | 'error',
  text: string,
}

type Props = {
  globalAlert: Array<AlertType>
}

class AlertContainer extends React.Component<Props> {
  static propTypes = {
    globalAlert: PropTypes.array.isRequired,
  };

  render() {
    const { globalAlert } = this.props;
    const alerts = [];
    let key = 0;

    forEach(globalAlert, (alert) => {
      alerts.push(<Notification key={key} type={alert.type} text={alert.text} />);
      key += 1;
    });

    return (
      <div className={s.alertContainer}>
        {alerts}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { globalAlert } = state;

  return {
    globalAlert,
  };
}

export default connect(mapStateToProps, () => ({}))(AlertContainer);
