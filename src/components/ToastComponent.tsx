import React from 'react';
import type { ToastContentProps } from 'react-toastify';
import { mdiCloseCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

type Props = ToastContentProps<{
  header: string;
  message?: React.ReactNode;
  icon: string;
}>;

const colorClass = {
  success: 'text-panel-text-important',
  error: 'text-panel-text-danger',
  info: 'text-panel-text-primary',
  warning: 'text-panel-text-warning',
};

const isColorClass = (type: string): type is keyof typeof colorClass => type in colorClass;

const ToastComponent = (props: Props) => {
  'use no memo';

  const { closeToast, data, toastProps } = props;
  const color = isColorClass(toastProps.type) ? toastProps?.type : 'info';

  return (
    <div className="flex w-full bg-panel-background">
      <span>
        <Icon path={data.icon} size={1} className={colorClass[color]} />
      </span>
      <div className="mr-8 ml-4 flex grow flex-col">
        <div className="font-semibold">{data.header}</div>
        <div className="text-panel-text">{data.message}</div>
      </div>
      {toastProps.autoClose && (
        <span onClick={closeToast} className="cursor-pointer text-panel-text opacity-65">
          <Icon path={mdiCloseCircleOutline} size={1} />
        </span>
      )}
    </div>
  );
};

export default ToastComponent;
