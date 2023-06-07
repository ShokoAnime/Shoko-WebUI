import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { find, toInteger } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronDown, mdiChevronUp, mdiMagnify } from '@mdi/js';
import { Listbox } from '@headlessui/react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import { EpisodeTypeEnum } from '@/core/types/api/episode';
import Input from './Input';

function getOffsetTop(rect, vertical) {
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

function getOffsetLeft(rect, horizontal) {
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
  options: Array<Option>;
  value: number;
  onChange: (optionValue: number, label: string) => void;
  className?: string;
  emptyValue?: string;
  rowIdx: number;
};

const getPrefix = (type: EpisodeTypeEnum) => {
  switch (type) {
    case EpisodeTypeEnum.Normal: return '';
    case EpisodeTypeEnum.Special: return 'S';
    case EpisodeTypeEnum.ThemeSong: return 'C';
    case EpisodeTypeEnum.Trailer: return 'T';
    default: return '';
  }
};

const SelectOption = (option: Option & { divider: boolean }) => (
  <Listbox.Option value={option} key={`listbox-item-${option.value}`} className="text-font-main cursor-default hover:bg-highlight-1 hover:text-font-alt select-none relative px-2 py-0.5 group">
    <div className="flex items-center justify-between">
      <span className="flex font-normal truncate grow">
        <div className="text-highlight-2 w-10 group-hover:text-font-main">{getPrefix(option.type) + option.number}</div>
        |
        <div className="ml-2">{option.label}</div>
      </span>
      <span>{option.AirDate}</span>
    </div>
  </Listbox.Option>
);
/* eslint-disable-next-line object-curly-newline */
const SelectEpisodeList = ({ options, value, onChange, className, emptyValue = '', rowIdx }: Props) => {
  const [epFilter, setEpFilter] = useState(0);
  const [selected, setSelected] = useState(options[0]);
  const [portalEl, setPortalEl] = useState(null as any);
  const [displayNode, setDisplayNode] = React.useState(null as any);
  const displayRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot === null) { return undefined; }
    const el = document.createElement('div');
    modalRoot.appendChild(el);
    setPortalEl(el);
    return () => {
      modalRoot.removeChild(el);
    };
  }, []);

  const handleDisplayRef = useCallback((node) => {
    displayRef.current = node;

    if (node) {
      setDisplayNode(node);
    }
  }, []);

  useEffect(() => {
    setSelected(find(options, ['value', value]) ?? {} as Option);
  }, [value, options]);

  useMemo(() => {

  }, [options, epFilter]);

  const handleEpFilter = (event) => {
    setEpFilter(toInteger(event.target.value));
  };

  const selectOption = (selectedOption) => {
    setSelected(selectedOption);
    onChange(selectedOption?.value ?? 0, selectedOption?.label ?? emptyValue);
  };

  const renderSelected = () => {
    if (!selected || !selected.label) return emptyValue;
    return (
      <React.Fragment>
        <span className="text-highlight-2 font-semibold">{selected.number}</span> - {selected.label}
        {selected.type && selected.type !== 'Normal' && <span className="mx-2 px-1 py-0.5 rounded-md text-font-main bg-background-alt text-sm border-highlight-2 border">{selected.type}</span>}
      </React.Fragment>
    );
  };

  const renderPortal = (open) => {
    if (displayNode === null || portalEl === null || open !== true) { return null; }
    const rect = displayNode.getBoundingClientRect();
    const top = rect.top + getOffsetTop(rect, 'bottom') + window.scrollY;
    const left = rect.left + getOffsetLeft(rect, 0);
    portalEl.style.top = `${top}px`;
    portalEl.style.left = `${left}px`;
    portalEl.style.position = 'absolute';
    portalEl.style.width = `${displayNode.offsetWidth}px`;

    return ReactDOM.createPortal(
      <Listbox.Options static className="absolute mt-1 w-full z-10 bg-background-alt">
        <div className="flex gap-x-2">
          <Input className="grow" id="epFilter" type="text" value={epFilter === 0 ? '' : epFilter} onChange={handleEpFilter} inputClassName="py-4 px-3" startIcon={mdiMagnify} placeholder="Input Episode Name or Number..." />
        </div>
        <div className="rounded-md bg-background-border mt-1 overflow-y-auto max-h-96 p-4">
          {options.map((item, idx) => (
            <>
              {idx !== 0 && item.type !== options[idx - 1].type && (<div className="bg-background-alt h-0.5 my-3" />)}
              {(epFilter > 0 && (item.number === epFilter || epFilter === 0)) && (<SelectOption key={`listbox-item-${item.value}`} {...item} divider={idx > 0 && item.type !== options[idx - 1].type} />)}
            </>
          ))}
        </div>
      </Listbox.Options>,
      portalEl,
    );
  };

  return (
    <div className={`${className} h-full`} ref={handleDisplayRef}>
      <Listbox value={selected} onChange={selectOption}>
        {({ open }) => (
          <div className="relative h-full">
            <Listbox.Button ref={buttonRef} className={cx('relative w-full h-full border border-background-border rounded-md shadow-lg pl-2 pr-10 py-2 text-left cursor-default focus:outline-none focus:border-highlight-1', rowIdx % 2 === 0 ? 'bg-background-alt' : 'bg-background')}>
              <span className="flex items-center">
                <span className="ml-3 block truncate h-7">{renderSelected()}</span>
              </span>
              <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Icon className="cursor-pointer" path={open ? mdiChevronUp : mdiChevronDown} size={1} />
              </span>
            </Listbox.Button>
            {renderPortal(open)}
          </div>
        )}
      </Listbox>
    </div>
  );
};

export default React.memo(SelectEpisodeList);
