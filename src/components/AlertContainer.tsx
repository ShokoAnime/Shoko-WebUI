import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import { RootState } from '../core/store';
import { GlobalAlertType } from '../core/types/api';

function AlertContainer() {
  const globalAlert = useSelector((state: RootState) => state.globalAlert);

  const [key, setKey] = useState(-1);

  const renderAlert = (alert: GlobalAlertType) => (
    <div className={cx(['flex px-4 py-3 rounded relative mt-2 w-1/2', alert.type === 'error' ? 'bg-color-danger' : 'bg-color-highlight-1'])} role="alert" key={key}>
      {alert.text}
    </div>
  );

  return (
    <div className="flex flex-col fixed z-50 top-0 w-full items-center">
      {globalAlert.map((alert) => {
        setKey(key + 1);
        return renderAlert(alert);
      })}
    </div>
  );
}

export default AlertContainer;
