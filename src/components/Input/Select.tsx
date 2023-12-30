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
};

function Select(props: Props) {
  const {
    children,
    className,
    id,
    label,
    onChange,
    options,
    value,
  } = props;

  return (
    <div className={className ?? ''}>
      <label htmlFor={id}>
        {(label || options) && (
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
            className="w-full appearance-none rounded border border-panel-border bg-panel-input py-1.5 pl-2 pr-8 transition ease-in-out focus:shadow-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-panel-icon-action"
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 py-2 pr-2 text-panel-icon">
            <Icon path={mdiChevronDown} size={1} />
          </div>
        </div>
      </label>
    </div>
  );
}

export default Select;
