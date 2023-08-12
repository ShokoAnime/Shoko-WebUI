import React from 'react';
import { toast, ToastContentProps, ToastOptions } from 'react-toastify';
import { Icon } from '@mdi/react';
import {
  mdiAlertCircleOutline,
  mdiCheckboxMarkedCircleOutline,
  mdiCloseCircleOutline,
  mdiInformationOutline,
} from '@mdi/js';

type Props = Partial<ToastContentProps> & {
  header: string;
  message?: React.ReactNode;
  icon: string;
};

function Toast(props: Props) {
  const { closeToast, toastProps, header, message, icon } = props;

  const colorClass = () => {
    switch (toastProps?.type) {
      case 'success': return 'toast-important';
      case 'error': return 'toast-danger';
      case 'info': return 'toast-primary';
      case 'warning': return 'toast-warning';
      default: return 'toast-primary';
    }
  };

  return (
    <div className="flex">
      <span><Icon path={icon} size={1} className={`text-${colorClass()}`} /></span>
      <div className="flex flex-col grow ml-4 mr-8">
        <div className="font-semibold">{header}</div>
        <div className="text-toast-text">{message}</div>
      </div>
      {toastProps?.autoClose && <span onClick={closeToast}><Icon path={mdiCloseCircleOutline} size={1} className="text-toast-text opacity-65" /></span>}
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

const infoUpdate = (id: string, header: string, message?: React.ReactNode) => toast.update(id, { render: <Toast header={header} message={message} icon={mdiInformationOutline} /> });

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
