import type React from 'react';
import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import { mdiAlertCircleOutline, mdiCheckboxMarkedCircleOutline, mdiInformationOutline } from '@mdi/js';

import ToastComponent from '@/components/ToastComponent';

const success = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.success(ToastComponent, {
    data: {
      header,
      message,
      icon: mdiCheckboxMarkedCircleOutline,
    },
    ...options,
  });

const error = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.error(ToastComponent, {
    data: {
      header,
      message,
      icon: mdiAlertCircleOutline,
    },
    ...options,
  });

const warning = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.warning(ToastComponent, {
    data: {
      header,
      message,
      icon: mdiAlertCircleOutline,
    },
    ...options,
  });

const info = (header: string, message?: React.ReactNode, options?: ToastOptions) =>
  toast.info(ToastComponent, {
    data: {
      header,
      message,
      icon: mdiInformationOutline,
    },
    ...options,
  });

const dismiss = (id: number | string) => toast.dismiss(id);

const isActive = (id: number | string) => toast.isActive(id);

export default {
  success,
  error,
  warning,
  info,
  dismiss,
  isActive,
};
