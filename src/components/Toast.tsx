import React from 'react';
import { toast, ToastContentProps, ToastOptions } from 'react-toastify';
import { Icon } from '@mdi/react';
import { mdiCheckCircle, mdiCloseCircleOutline } from '@mdi/js';

type Props = Partial<ToastContentProps> & {
  header: string;
  message?: string;
};

function Toast(props: Props) {
  const { closeToast, toastProps, header, message } = props;

  const autoClose = toastProps?.autoClose ? toastProps.autoClose + 500 : false;

  const colorClass = () => {
    switch (toastProps?.type) {
      case 'success': return 'highlight-2';
      case 'error': return 'highlight-3';
      case 'info': return 'highlight-1';
      default: return 'highlight-1';
    }
  };

  return (
    <>
    <div className="flex">
      <span><Icon path={mdiCheckCircle} size={1} className={`text-${colorClass()}`} /></span>
      <div className="flex flex-col grow ml-4 mr-2">
        <div>{header}</div>
        <div className="text-font-main">{message}</div>
      </div>
      <span onClick={closeToast}><Icon path={mdiCloseCircleOutline} size={1} className="text-font-main opacity-50" /></span>
    </div>
      <div className={`Toastify__progress-bar Toastify__progress-bar--animated Toastify__progress-bar--${toastProps?.type} !opacity-10 !h-full`}
           style={{ animationPlayState: 'running', animationDuration: `${autoClose}ms` }}></div>
    </>
  );
}

const success = (header: string, message?: string, options?: ToastOptions) => {
  toast.success(<Toast header={header} message={message} />, options);
};

const error = (header: string, message?: string, options?: ToastOptions) => {
  toast.error(<Toast header={header} message={message} />, options);
};

const info = (header: string, message?: string, options?: ToastOptions) => {
  toast.info(<Toast header={header} message={message} />, options);
};

export default {
  success,
  error,
  info,
};
