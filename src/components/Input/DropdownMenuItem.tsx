import React from 'react';
import { MenuItem } from '@headlessui/react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  disabled?: boolean;
  icon: string;
  loading?: boolean;
  onClick: () => void;
  text: string;
  type?: 'primary' | 'danger';
};

const typeColorClassMap = {
  primary: 'text-panel-text-primary',
  danger: 'text-panel-text-danger',
} as const;

const DropdownMenuItem = ({ disabled, icon, loading, onClick, text, type = 'primary' }: Props) => (
  <MenuItem disabled={disabled || loading}>
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-x-2 px-4 py-3 text-sm font-semibold transition-colors hover:bg-panel-background data-disabled:opacity-65"
      disabled={disabled || loading}
    >
      <Icon path={loading ? mdiLoading : icon} size={1} spin={loading} className={typeColorClassMap[type]} />
      <div className={cx(type === 'danger' && 'text-panel-text-danger')}>
        {text}
      </div>
    </button>
  </MenuItem>
);

export default DropdownMenuItem;
