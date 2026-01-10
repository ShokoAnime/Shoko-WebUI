import React from 'react';
import { mdiChevronDown } from '@mdi/js';
import { Icon } from '@mdi/react';

type Props = {
  id: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string;
  children: React.ReactNode;
  label?: string;
  options?: React.ReactNode;
  disabled?: boolean;
};

const Select = React.memo((props: Props) => {
  const {
    children,
    className,
    disabled,
    id,
    label,
    onChange,
    options,
    value,
  } = props;

  const showTitle = label ?? options ?? false;

  return (
    <div className={className ?? ''}>
      <label htmlFor={id}>
        {showTitle && (
          <div className="mb-3 flex items-center justify-between">
            {label && (
              <div className="font-semibold">
                {label}
              </div>
            )}
            {options}
          </div>
        )}
        <div className="relative w-auto">
          <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full appearance-none rounded-lg border border-panel-border bg-panel-input px-4 py-3 transition ease-in-out focus:shadow-none focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-panel-icon-action"
            disabled={disabled}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center py-2 pr-2 text-panel-icon">
            <Icon path={mdiChevronDown} size={1} />
          </div>
        </div>
      </label>
    </div>
  );
});

export default Select;
