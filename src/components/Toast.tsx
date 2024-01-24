import React from 'react';
import { toast } from 'react-toastify';
import type { ToastContentProps, ToastOptions } from 'react-toastify';
import {
  mdiAlertCircleOutline,
  mdiCheckboxMarkedCircleOutline,
  mdiCloseCircleOutline,
  mdiInformationOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';

type Props = Partial<ToastContentProps> & {
  header: string;
  message?: React.ReactNode;
  icon: string;
};

const colorClass = {
  success: 'text-panel-text-important',
  error: 'text-panel-text-danger',
  info: 'text-panel-text-primary',
  warning: 'text-panel-text-warning',
};

const isColorClass = (type: string): type is keyof typeof colorClass => type in colorClass;

// eslint-disable-next-line react-refresh/only-export-components
function Toast(props: Props) {
  const { closeToast, header, icon, message, toastProps } = props;
  const color = toastProps && 'type' in toastProps && isColorClass(toastProps.type) ? toastProps?.type : 'info';

  return (
    <div className="flex">
      <span>
        <Icon path={icon} size={1} className={colorClass[color]} />
      </span>
      <div className="ml-4 mr-8 flex grow flex-col">
        <div className="font-semibold">{header}</div>
        <div className="text-panel-text">{message}</div>
      </div>
      {toastProps?.autoClose && (
        <span onClick={closeToast}>
          <Icon path={mdiCloseCircleOutline} size={1} className="text-panel-text opacity-65" />
        </span>
      )}
    </div>
  );
}

const success = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.success(<Toast header={header} message={message} icon={mdiCheckboxMarkedCircleOutline} />, options);

const error = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.error(<Toast header={header} message={message} icon={mdiAlertCircleOutline} />, options);

const warning = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.warning(<Toast header={header} message={message} icon={mdiAlertCircleOutline} />, options);

const info = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.info(<Toast header={header} message={message} icon={mdiInformationOutline} />, options);

const dismiss = (id: number | string) => toast.dismiss(id);

const infoUpdate = (id: number | string, header: string, message?: React.ReactNode) =>
  toast.update(id, { render: <Toast header={header} message={message} icon={mdiInformationOutline} /> });

const isActive = (id: number | string) => toast.isActive(id);

export default {
  success,
  error,
  warning,
  info,
  dismiss,
  infoUpdate,
  isActive,
};
