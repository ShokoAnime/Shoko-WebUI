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
      case 'success': return 'highlight-2';
      case 'error': return 'highlight-3';
      case 'info': return 'highlight-1';
      default: return 'highlight-1';
    }
  };

  return (
    <div className="flex">
      <span><Icon path={icon} size={1} className={`text-${colorClass()}`} /></span>
      <div className="flex flex-col grow ml-4 mr-8">
        <div className="font-semibold">{header}</div>
        <div className="text-font-main">{message}</div>
      </div>
      {toastProps?.autoClose && <span onClick={closeToast}><Icon path={mdiCloseCircleOutline} size={1} className="text-font-main opacity-65" /></span>}
    </div>
  );
}

const success = (header: string, message?: React.ReactNode, options?: ToastOptions) => {
  toast.success(<Toast header={header} message={message} icon={mdiCheckboxMarkedCircleOutline} />, options);
};

const error = (header: string, message?: React.ReactNode, options?: ToastOptions) => {
  toast.error(<Toast header={header} message={message} icon={mdiAlertCircleOutline} />, options);
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
  info,
  dismiss,
  infoUpdate,
  isActive,
};
