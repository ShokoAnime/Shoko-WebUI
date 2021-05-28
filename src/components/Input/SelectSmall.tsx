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

function SelectSmall(props: Props) {
  const {
    id, value, className, children,
    label, onChange,
  } = props;

  return (
    <label className={`${className} flex justify-between items-center font-mulish`} htmlFor={id}>
      {label && (
        <div className="flex justify-center">
          {label}
        </div>
      )}
      <div className="w-auto relative">
        <select id={id} value={value} onChange={onChange} className="w-full appearance-none font-exo2 rounded-md py-0.5 pl-2 pr-5 focus:shadow-none focus:outline-none bg-color-2 text-sm select-field transition duration-300 ease-in-out">
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 px-2 py-0.5">
          <FontAwesomeIcon icon={faCaretDown} />
        </div>
      </div>
    </label>
  );
}

export default SelectSmall;
