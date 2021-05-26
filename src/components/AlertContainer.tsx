import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import cx from 'classnames';

import { RootState } from '../core/store';
import { GlobalAlertType } from '../core/types/api';

class AlertContainer extends React.Component<Props> {
  renderAlert = (key: number, alert: GlobalAlertType) => (
    <div className={cx(['flex px-4 py-3 rounded relative mt-2 w-1/2', alert.type === 'error' ? 'bg-color-danger' : 'bg-color-highlight-1'])} role="alert" key={key}>
      {alert.text}
    </div>
  );

  render() {
    const { globalAlert } = this.props;
    const alerts: Array<React.ReactNode> = [];
    let key = 0;

    forEach(globalAlert, (alert) => {
      alerts.push(this.renderAlert(key, alert));
      key += 1;
    });

    return (
      <div className="flex flex-col fixed z-50 top-0 w-full items-center">
        {alerts}
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  globalAlert: state.globalAlert as Array<GlobalAlertType>,
});

const connector = connect(mapState);

type Props = ConnectedProps<typeof connector>;

export default connector(AlertContainer);
