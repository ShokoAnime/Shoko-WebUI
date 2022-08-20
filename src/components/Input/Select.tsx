import React from 'react';
import { Icon } from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';
import cx from 'classnames';

type Props = {
  id: string;
  value: string | number;
  onChange: (event: any) => void;
  className?: string;
  children: any;
  label?: string;
  inline?: boolean;
};

function Select(props:Props) {
  const {
    id, value, className, children, onChange,
    label, inline,
  } = props;

  return (
    <div className={`${className ?? ''}`}>
      <label className={cx('font-open-sans', { 'flex flex-row justify-center': inline })} htmlFor={id}>
        {label && (
          <div className={cx('font-semibold', { 'mb-1.5': !inline, 'flex items-center mr-3': inline })}>
            {label}
          </div>
        )}
        <div className="w-auto relative">
          <select id={id} value={value} onChange={onChange} className="w-full appearance-none rounded pl-2 py-2 pr-8 focus:shadow-none focus:outline-none bg-background-alt border border-background-border focus:border-highlight-1 transition duration-300 ease-in-out">
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
