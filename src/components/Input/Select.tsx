import React from 'react';
import { Icon } from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';

type Props = {
  id: string;
  value: string | number;
  onChange: (event: any) => void;
  className?: string;
  children: any;
  label?: string;
};

function Select(props:Props) {
  const {
    id, value, className, children, onChange,
    label,
  } = props;

  return (
    <div className={`${className ?? ''}`}>
      <label className="font-open-sans" htmlFor={id}>
        {label && (
          <div className="mb-1.5 font-semibold">
            {label}
          </div>
        )}
        <div className="w-auto relative">
          <select id={id} value={value} onChange={onChange} className="w-full appearance-none rounded pl-2 py-1.5 pr-8 focus:shadow-none focus:outline-none bg-background-alt border border-background-border focus:ring-2 focus:ring-highlight-1 focus:ring-inset transition ease-in-out">
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 pr-2 py-2">
            <Icon path={mdiChevronDown} size={1} />
          </div>
        </div>
      </label>
    </div>
  );
}

export default Select;
