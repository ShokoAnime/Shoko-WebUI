import { useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import cx from 'classnames';

import type { ReleaseGroupType } from '@/core/types/api/file';

type Props = {
  options: ReleaseGroupType[];
  value?: ReleaseGroupType;
  onChange: (group?: ReleaseGroupType) => void;
  disabled?: boolean;
  hasDifferent?: boolean;
};

const SelectReleaseGroup = ({
  disabled = false,
  hasDifferent = false,
  onChange,
  options,
  value,
}: Props) => {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery === ''
    ? []
    : options.filter(option =>
      option.Name.toLowerCase().includes(normalizedQuery)
      || option.ShortName.toLowerCase().includes(normalizedQuery)
    );

  const hasExactMatch = normalizedQuery !== '' && options.some(option => option.Name.toLowerCase() === normalizedQuery);

  const handleChange = (group: ReleaseGroupType | null) => {
    setQuery('');
    if (group) onChange(group);
  };

  return (
    <Combobox
      as="div"
      value={value ?? null}
      onChange={handleChange}
      by={(left, right) => left?.ID === right?.ID && left?.Source === right?.Source}
      disabled={disabled}
      immediate
    >
      <ComboboxInput
        displayValue={(group: ReleaseGroupType | null) => {
          if (group) return group.Name;
          return hasDifferent ? 'Multiple groups selected' : '';
        }}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.target.select()}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          if (event.target.value.trim() === '' && (value || hasDifferent)) {
            onChange(undefined);
          }
          setQuery('');
        }}
        placeholder="Select release group"
        className={cx(
          'w-full rounded-lg border border-panel-border bg-panel-input px-4 py-2 text-left text-panel-text transition-colors focus:border-panel-text-primary focus:outline-hidden data-open:border-panel-text-primary',
          disabled && 'opacity-65',
        )}
      />
      {normalizedQuery !== '' && (
        <ComboboxOptions
          anchor={{ to: 'bottom', padding: '1rem', gap: '0.25rem' }}
          transition
          className="z-110 w-(--input-width) origin-top rounded-lg bg-panel-background transition [--anchor-max-height:16rem] focus:outline-hidden data-closed:opacity-0"
        >
          <div className="max-h-(--anchor-max-height) overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-4">
            {!hasExactMatch && (
              <ComboboxOption
                value={{ ID: query.trim(), Name: query.trim(), ShortName: query.trim(), Source: 'User' }}
                className="cursor-pointer px-2 py-0.5 text-panel-text transition-colors select-none data-focus:text-panel-text-primary"
              >
                <div className="grow truncate">
                  Create &quot;{query.trim()}&quot;
                </div>
              </ComboboxOption>
            )}
            {filteredOptions.map(option => (
              <ComboboxOption
                key={`${option.Source}-${option.ID}`}
                value={option}
                className="cursor-pointer px-2 py-0.5 text-panel-text transition-colors select-none data-focus:text-panel-text-primary data-selected:text-panel-text-primary"
              >
                <div className="flex items-center justify-between">
                  <div className="grow truncate">{option.Name}</div>
                  {option.ShortName && option.ShortName !== option.Name && (
                    <div className="ml-2 text-panel-text-important">{option.ShortName}</div>
                  )}
                </div>
              </ComboboxOption>
            ))}
          </div>
        </ComboboxOptions>
      )}
    </Combobox>
  );
};

export default SelectReleaseGroup;
