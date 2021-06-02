import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

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
      <label className="flex justify-between items-center" htmlFor={id}>
        {label && (
          <div className="flex justify-center">
            {label}
          </div>
        )}
        <div className="w-auto relative">
          <select id={id} value={value} onChange={onChange} className="w-full appearance-none text-lg font-exo2 rounded-lg py-4 pl-4 pr-7 focus:shadow-none focus:outline-none bg-color-1 select-field transition duration-300 ease-in-out">
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 p-4">
            <FontAwesomeIcon icon={faCaretDown} />
          </div>
        </div>
      </label>
    </div>
  );
}

export default Select;
