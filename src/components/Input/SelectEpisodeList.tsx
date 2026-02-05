import React, { useEffect, useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { mdiChevronDown, mdiChevronUp, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, toInteger } from 'lodash';

import { EpisodeTypeEnum } from '@/core/types/api/episode';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';

import Input from './Input';

type Option = {
  label: string;
  value: number;
  type: EpisodeTypeEnum;
  number: number;
  AirDate: string;
};

type Props = {
  options: Option[];
  value: number;
  onChange: (optionValue: number) => void;
  disabled?: boolean;
  rowIdx: number;
};

const SelectOption = ({ option }: { option: Option }) => (
  <ListboxOption
    value={option}
    className="group relative cursor-pointer select-none px-2 py-0.5 text-panel-text transition-colors data-[focus]:text-panel-text-primary"
  >
    <div className="flex items-center justify-between">
      <div className="flex grow truncate">
        <div className="w-10 shrink-0 text-panel-text-important">
          {getEpisodePrefix(option.type) + option.number}
        </div>
        |
        <div className="ml-2">{option.label}</div>
      </div>
      <div>{option.AirDate}</div>
    </div>
  </ListboxOption>
);

const SelectButton = ({ open, rowIdx, selected }: { open: boolean, rowIdx: number, selected: Option }) => (
  <ListboxButton
    className={cx(
      'relative w-full h-full border border-panel-border rounded-lg px-4 py-2 text-left focus:outline-hidden focus:border-panel-text-primary data-[open]:border-panel-text-primary transition-colors',
      rowIdx % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
    )}
  >
    <div className="flex items-center truncate">
      {!selected?.label ? 'Select episode' : (
        <>
          <span className="font-semibold text-panel-text-important">{selected.number}</span>
          &nbsp;-&nbsp;
          {selected.label}
          {selected?.type !== EpisodeTypeEnum.Episode && (
            <span className="mx-2 rounded-lg border border-panel-border bg-panel-background px-1 py-0.5 text-sm text-panel-text">
              {selected.type}
            </span>
          )}
        </>
      )}
    </div>
    <div className="absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
      <Icon path={open ? mdiChevronUp : mdiChevronDown} size={1} />
    </div>
  </ListboxButton>
);

const SelectEpisodeList = React.memo((
  { disabled = false, onChange, options, rowIdx, value }: Props,
) => {
  const [epFilter, setEpFilter] = useState(0);
  const [selected, setSelected] = useState<Option>(options[0]);

  useEffect(() => {
    setSelected(find(options, ['value', value]) ?? {} as Option);
  }, [value, options]);

  const handleEpFilter = (event: React.ChangeEvent<HTMLInputElement>) => setEpFilter(toInteger(event.target.value));

  const selectOption = (selectedOption: Option) => {
    setSelected(selectedOption);
    onChange(selectedOption?.value ?? 0);
  };

  return (
    <Listbox disabled={disabled} value={selected} onChange={selectOption}>
      {({ open }) => (
        <>
          <SelectButton open={open} rowIdx={rowIdx} selected={selected} />

          <Transition
            enter="transition-opacity"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              anchor={{
                to: 'bottom',
                padding: '1rem',
                gap: '0.25rem',
              }}
              className="z-[110] w-[--button-width] origin-top rounded-lg bg-panel-background transition [--anchor-max-height:24rem] focus:outline-hidden"
            >
              <Input
                autoFocus
                className="grow"
                id="epFilter"
                type="text"
                value={epFilter === 0 ? '' : epFilter}
                onChange={handleEpFilter}
                inputClassName="py-4 px-3"
                startIcon={mdiMagnify}
                placeholder="Input Episode Number..."
              />

              {/* 4rem below is to account for height of the input component */}
              <div className="mt-1 h-[calc(var(--anchor-max-height)-4rem)] overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-4">
                {options.map((item, idx) => (
                  <React.Fragment key={`listbox-item-${item.value}`}>
                    {idx !== 0 && item.type !== options[idx - 1].type && (
                      <div className="my-3 h-0.5 border border-panel-border bg-panel-background-alt" />
                    )}
                    {((epFilter > 0 && item.number === epFilter) || epFilter === 0) && <SelectOption option={item} />}
                  </React.Fragment>
                ))}
              </div>
            </ListboxOptions>
          </Transition>
        </>
      )}
    </Listbox>
  );
});

export default SelectEpisodeList;
