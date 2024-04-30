import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Listbox } from '@headlessui/react';
import { mdiChevronDown, mdiChevronUp, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, toInteger } from 'lodash';

import { EpisodeTypeEnum } from '@/core/types/api/episode';
import getEpisodePrefix from '@/core/utilities/getEpisodePrefix';

import Input from './Input';

function getOffsetTop(rect: DOMRect, vertical: string | number) {
  let offset = 0;

  if (typeof vertical === 'number') {
    offset = vertical;
  } else if (vertical === 'center') {
    offset = rect.height / 2;
  } else if (vertical === 'bottom') {
    offset = rect.height;
  }

  return offset;
}

function getOffsetLeft(rect: DOMRect, horizontal: string | number) {
  let offset = 0;

  if (typeof horizontal === 'number') {
    offset = horizontal;
  } else if (horizontal === 'center') {
    offset = rect.width / 2;
  } else if (horizontal === 'right') {
    offset = rect.width;
  }

  return offset;
}

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
  onChange: (optionValue: number, label: string) => void;
  className?: string;
  emptyValue?: string;
  disabled?: boolean;
  rowIdx: number;
};

const SelectOption = (option: Option & { divider: boolean }) => (
  <Listbox.Option
    value={option}
    key={`listbox-item-${option.value}`}
    className="group relative cursor-pointer select-none px-2 py-0.5 text-panel-text"
  >
    <div className="flex items-center justify-between">
      <span className="flex grow truncate font-normal">
        <div className="w-10 shrink-0 text-panel-text-important">
          {getEpisodePrefix(option.type) + option.number}
        </div>
        |
        <div className="ml-2">{option.label}</div>
      </span>
      <span>{option.AirDate}</span>
    </div>
  </Listbox.Option>
);

const SelectEpisodeList = React.memo((
  { className, disabled = false, emptyValue = '', onChange, options, rowIdx, value }: Props,
) => {
  const [epFilter, setEpFilter] = useState(0);
  const [selected, setSelected] = useState<Option>(options[0]);
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const [displayNode, setDisplayNode] = React.useState<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot === null) return undefined;
    const el = document.createElement('div');
    modalRoot.appendChild(el);
    setPortalEl(el);
    return () => {
      modalRoot.removeChild(el);
    };
  }, []);

  // Not entirely sure if should be change to useEventCallback as it's not an event handler, so leaving it.
  const handleDisplayRef = useCallback((node: HTMLDivElement | null) => {
    displayRef.current = node;

    if (node) {
      setDisplayNode(node);
    }
  }, []);

  useEffect(() => {
    setSelected(find(options, ['value', value]) ?? {} as Option);
  }, [value, options]);

  const handleEpFilter: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setEpFilter(toInteger(event.target.value));
  };

  const selectOption = (selectedOption: Option) => {
    setSelected(selectedOption);
    onChange(selectedOption?.value ?? 0, selectedOption?.label ?? emptyValue);
  };

  const renderSelected = () => {
    if (!selected?.label) return emptyValue;
    return (
      <>
        <span className="font-semibold text-panel-text-important">{selected.number}</span>
        &nbsp;-&nbsp;
        {selected.label}
        {selected.type && selected.type !== EpisodeTypeEnum.Normal && (
          <span className="mx-2 rounded-lg border border-panel-border bg-panel-background px-1 py-0.5 text-sm text-panel-text">
            {selected.type}
          </span>
        )}
      </>
    );
  };

  const renderPortal = (open) => {
    if (displayNode === null || portalEl === null || open !== true) return null;
    const rect = displayNode.getBoundingClientRect();
    const top = rect.top + getOffsetTop(rect, 'bottom') + window.scrollY;
    const left = rect.left + getOffsetLeft(rect, 0);
    portalEl.style.top = `${top}px`;
    portalEl.style.left = `${left}px`;
    portalEl.style.position = 'absolute';
    portalEl.style.width = `${displayNode.offsetWidth}px`;

    return ReactDOM.createPortal(
      <Listbox.Options static className="absolute z-10 mt-1 w-full bg-panel-background">
        <div className="flex gap-x-2">
          <Input
            className="grow"
            id="epFilter"
            type="text"
            value={epFilter === 0 ? '' : epFilter}
            onChange={handleEpFilter}
            inputClassName="py-4 px-3"
            startIcon={mdiMagnify}
            placeholder="Input Episode Number..."
          />
        </div>
        <div className="mt-1 max-h-96 overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-4">
          {options.map((item, idx) => (
            <React.Fragment key={`listbox-item-${item.value}`}>
              {idx !== 0 && item.type !== options[idx - 1].type && (
                <div className="my-3 h-0.5 border border-panel-border bg-panel-background-alt" />
              )}
              {((epFilter > 0 && item.number === epFilter) || epFilter === 0) && (
                <SelectOption
                  {...item}
                  divider={idx > 0 && item.type !== options[idx - 1].type}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </Listbox.Options>,
      portalEl,
    );
  };

  return (
    <div className={cx(className, 'h-full')} ref={handleDisplayRef}>
      <Listbox disabled={disabled} value={selected} onChange={selectOption}>
        {({ open }) => (
          <div className="relative h-full">
            <Listbox.Button
              ref={buttonRef}
              className={cx(
                'relative w-full h-full border border-panel-border rounded-lg pl-2 pr-10 py-2 text-left cursor-default focus:outline-none focus:border-panel-text-primary',
                rowIdx % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
              )}
            >
              <span className="flex items-center">
                <span className="ml-3 block h-7 truncate">{renderSelected()}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <Icon className="cursor-pointer" path={open ? mdiChevronUp : mdiChevronDown} size={1} />
              </span>
            </Listbox.Button>
            {renderPortal(open)}
          </div>
        )}
      </Listbox>
    </div>
  );
});

export default SelectEpisodeList;
