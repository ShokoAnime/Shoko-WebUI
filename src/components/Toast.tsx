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
  success: 'text-toast-important',
  error: 'text-toast-danger',
  info: 'text-toast-primary',
  warning: 'text-toast-warning',
};

function Toast(props: Props) {
  const { closeToast, header, icon, message, toastProps } = props;

  return (
    <div className="flex">
      <span>
        <Icon path={icon} size={1} className={colorClass[toastProps?.type ?? 'info']} />
      </span>
      <div className="ml-4 mr-8 flex grow flex-col">
        <div className="font-semibold">{header}</div>
        <div className="text-toast-text">{message}</div>
      </div>
      {toastProps?.autoClose && (
        <span onClick={closeToast}>
          <Icon path={mdiCloseCircleOutline} size={1} className="text-toast-text opacity-65" />
        </span>
      )}
    </div>
  );
}

const success = (header: string, message?: React.ReactNode, options?: ToastOptions) => {
  toast.success(<Toast header={header} message={message} icon={mdiCheckboxMarkedCircleOutline} />, options);
};

const error = (header: string, message?: React.ReactNode, options?: ToastOptions) => {
  toast.error(<Toast header={header} message={message} icon={mdiAlertCircleOutline} />, options);
};

const warning = (header: string, message?: React.ReactNode, options?: ToastOptions) => {
  toast.warning(<Toast header={header} message={message} icon={mdiAlertCircleOutline} />, options);
};

const info = (header: string, message?: React.ReactNode, options?: ToastOptions) => {
  toast.info(<Toast header={header} message={message} icon={mdiInformationOutline} />, options);
};

const dismiss = (id: string) => toast.dismiss(id);

const infoUpdate = (id: string, header: string, message?: React.ReactNode) =>
  toast.update(id, { render: <Toast header={header} message={message} icon={mdiInformationOutline} /> });

const isActive = (id: string) => toast.isActive(id);

export default {
  success,
  error,
  warning,
  info,
  dismiss,
  infoUpdate,
  isActive,
};
