
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';

import { GlobalAlertType } from '../core/types/api';

type Props = {
  globalAlert: Array<GlobalAlertType>;
};

class AlertContainer extends React.Component<Props> {
  static propTypes = {
    globalAlert: PropTypes.array.isRequired,
  };

  render() {
    const {
      globalAlert,
    } = this.props;
    const alerts: Array<any> = [];
    let key = 0;

    forEach(globalAlert, (alert) => {
      // alerts.push(<Notification key={key}
      // color={alert.type === 'error' ? 'danger' : 'success'}>{alert.text}</Notification>);
      alerts.push(<div key={key}>{alert.text}</div>);
      key += 1;
    });

    return (
      <div className="alert-container">
        {alerts}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const {
    globalAlert,
  } = state;

  return {
    globalAlert,
  };
}

export default connect(mapStateToProps, () => ({}))(AlertContainer);
