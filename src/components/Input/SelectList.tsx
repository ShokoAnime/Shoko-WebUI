import React, { useEffect, useState } from 'react';
import { find } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';
import { Listbox } from '@headlessui/react';

type Props = {
  options: Array<{ label: string; value: string; }>;
  value: string;
  onChange: (optionValue: string, label: string) => void;
  className?: string;
  emptyValue?: string;
};

const SelectOption = ({ label, value }) => (
  <Listbox.Option value={value} key={`listbox-item-${value}`} className="text-white cursor-default hover:bg-highlight-1 hover:text-white select-none relative py-2 pl-3 pr-9">
    <div className="flex items-center">
      <span className="ml-3 block font-normal truncate">{label}</span>
    </div>
  </Listbox.Option>
);

const SelectList = ({ options, value, onChange, className, emptyValue = '' }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen ] = useState(false);

  useEffect(() => {
    const option = find(options, ['value', value]);
    setInputValue(option?.label ?? emptyValue);
  }, [value]);

  const selectOption = (option) => {
    onChange(option.value, option.label);
    setInputValue(option.label);
    setOpen(false);
  };

  return (
    <div className={className}>
      <Listbox value={inputValue} onChange={selectOption}>
        <Listbox.Button className="bg-background-alt border border-background-border rounded-md shadow-lg pl-2 pr-10 py-2 text-left cursor-default focus:outline-none focus:border-highlight-1">
          <span className="flex items-center">
            <span className="ml-3 block truncate">{inputValue}</span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <Icon className="cursor-pointer" path={open ? mdiChevronUp : mdiChevronDown} size={1} />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 w-full z-10 rounded-md bg-background-alt shadow-lg">
          {options.map(item => (<SelectOption {...item} />))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};


export default SelectList;