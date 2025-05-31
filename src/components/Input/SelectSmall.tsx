import React from 'react';
import { mdiChevronDown, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

type Props = {
  id: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string;
  children: React.ReactNode;
  label?: string;
  isFetching?: boolean;
};

const SelectSmall = (props: Props) => {
  const {
    children,
    className,
    id,
    isFetching,
    label,
    onChange,
    value,
  } = props;

  return (
    <label className={`${className} flex h-8 items-center justify-between`} htmlFor={id}>
      {label && (
        <div className="flex justify-center">
          {label}
        </div>
      )}
      {isFetching
        ? <Icon path={mdiLoading} size={1} spin className="text-panel-text-primary" />
        : (
          <div className="relative w-auto">
            <select
              id={id}
              value={value}
              onChange={onChange}
              className="w-full appearance-none rounded-sm border border-panel-border bg-panel-input py-1 pl-3 pr-8 text-sm transition ease-in-out focus:border-panel-text-primary focus:shadow-none focus:outline-hidden"
            >
              {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 p-1">
              <Icon path={mdiChevronDown} size={1} />
            </div>
          </div>
        )}
    </label>
  );
};

export default SelectSmall;
