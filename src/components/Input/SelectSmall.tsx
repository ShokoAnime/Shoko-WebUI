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
};

function SelectSmall(props: Props) {
  const {
    children,
    className,
    id,
    label,
    onChange,
    value,
  } = props;

  return (
    <label className={`${className} flex items-center justify-between`} htmlFor={id}>
      {label && (
        <div className="flex justify-center">
          {label}
        </div>
      )}
      <div className="relative w-auto">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded border border-panel-border bg-panel-input py-1 pl-3 pr-8 text-sm transition ease-in-out focus:border-panel-text-primary focus:shadow-none focus:outline-none"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 p-1">
          <Icon path={mdiChevronDown} size={1} />
        </div>
      </div>
    </label>
  );
}

export default SelectSmall;
