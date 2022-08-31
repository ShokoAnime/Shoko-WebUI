import React, { useEffect, useState } from 'react';
import { find } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronUp, mdiChevronDown } from '@mdi/js';
import { Listbox } from '@headlessui/react';

type Option = {
  label: string;
  value: number; 
};

type Props = {
  options: Array<Option>;
  value: number;
  onChange: (optionValue: number, label: string) => void;
  className?: string;
  emptyValue?: string;
};

const SelectOption = option => (
  <Listbox.Option value={option} key={`listbox-item-${option.value}`} className="text-white cursor-default hover:bg-highlight-1 hover:text-white select-none relative py-2 pl-3 pr-9">
    <div className="flex items-center">
      <span className="ml-3 block font-normal truncate">{option.label}</span>
    </div>
  </Listbox.Option>
);

const SelectList = ({ options, value, onChange, className, emptyValue = '' }: Props) => {
  const [open, setOpen ] = useState(false);
  const [selected, setSelected] = useState(options[0]);

  useEffect(() => {
    setSelected(find(options, ['value', value]) ?? {} as Option);
  }, [value, options]);

  const selectOption = (selectedOption) => {
    setOpen(false);
    setSelected(selectedOption);
    onChange(selectedOption?.value ?? 0, selectedOption?.label ?? emptyValue);
  };

  return (
    <div className={className}>
      <Listbox value={selected} onChange={selectOption}>
        <div className="relative">
          <Listbox.Button className="relative w-full bg-background-alt border border-background-border rounded-md shadow-lg pl-2 pr-10 py-2 text-left cursor-default focus:outline-none focus:border-highlight-1">
            <span className="flex items-center">
              <span className="ml-3 block truncate">{selected?.label ?? emptyValue}</span>
            </span>
            <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Icon className="cursor-pointer" path={open ? mdiChevronUp : mdiChevronDown} size={1} />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full z-10 rounded-md bg-background-alt shadow-lg">
            {options.map(item => (<SelectOption key={`listbox-item-${item.value}`} {...item} />))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};


export default SelectList;