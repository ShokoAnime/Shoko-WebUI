import React, { useEffect, useRef, useState } from 'react';
import { find } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';
import cx from 'classnames';

type Props = {
  options: Array<{ label: string; value: string; }>;
  value: string;
  onChange: (optionValue: string, label: string) => void;
  className?: string;
  emptyValue?: string;
};

const SelectInput = ({ value, onClick, open }) => (
  <button onClick={onClick} type="button" className="relative w-full bg-background-alt border border-background-border rounded-md shadow-lg pl-2 pr-10 py-2 text-left cursor-default focus:outline-none focus:border-highlight-1">
    <span className="flex items-center">
        <span className="ml-3 block truncate">{value}</span>
    </span>
    <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <Icon className="cursor-pointer" path={open ? mdiChevronUp : mdiChevronDown} size={1} />
    </span>
  </button>
);

const SelectOption = ({ label, value, onClick }) => (
  <li onClick={() => { onClick(value, label); }} key={`listbox-item-${value}`} role="option" className="text-white cursor-default hover:bg-highlight-1 hover:text-white select-none relative py-2 pl-3 pr-9">
    <div className="flex items-center">
      <span className="ml-3 block font-normal truncate">{label}</span>
    </div>
  </li>
);

const ComboBox = ({ options, value, onChange, className, emptyValue = '' }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen ] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const option = find(options, ['value', value]);
    setInputValue(option?.label ?? emptyValue);
  }, [value]);
  
  const selectOption = (optionValue, label) => {
    onChange(optionValue, label);
    setInputValue(label);
    setOpen(false);
  };
  
  const toggleDropdown = () => {
    setOpen(!open); 
    const ref = listRef.current; 
    if (ref !== null) {
      ref.focus();
    }
  };

  return (
  <div className={className}>
    <div className="relative">
      <SelectInput value={inputValue} open={open} onClick={toggleDropdown}/>
      <div ref={listRef} onBlur={() => setOpen(false)} onFocus={e => e.persist()} className={cx('absolute mt-1 w-full z-10 rounded-md bg-background-alt shadow-lg', { hidden: !open })}>
        <ul tabIndex={-1} role="listbox" className="max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map(item => (<SelectOption {...item} onClick={selectOption} />))}
        </ul>
      </div>
    </div>
  </div>
  );
};


export default ComboBox;