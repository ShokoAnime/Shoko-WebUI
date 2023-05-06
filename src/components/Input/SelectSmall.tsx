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

function SelectSmall(props: Props) {
  const {
    id, value, className, children,
    label, onChange,
  } = props;

  return (
    <label className={`${className} flex justify-between items-center font-main`} htmlFor={id}>
      {label && (
        <div className="flex justify-center">
          {label}
        </div>
      )}
      <div className="w-auto relative">
        <select id={id} value={value} onChange={onChange} className="w-full appearance-none rounded py-0.5 pl-2 pr-7 focus:shadow-none focus:outline-none bg-background-alt border border-background-border focus:border-highlight-1 text-sm transition ease-in-out">
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 px-1 py-0.5">
          <Icon path={mdiChevronDown} size={1} />
        </div>
      </div>
    </label>
  );
}

export default SelectSmall;
