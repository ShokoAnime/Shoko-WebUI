import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { find, toInteger } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronUp, mdiChevronDown, mdiPlusCircleOutline } from '@mdi/js';
import { Listbox } from '@headlessui/react';
import Input from './Input';
import Button from './Button';
import ReactDOM from 'react-dom';

import type { EpisodeTypeEnum } from '../../core/types/api/episode';

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
  onAddLink: () => void;
  className?: string;
  emptyValue?: string;
};

const SelectOption = (option: Option & { divider: boolean }) => {
  return (
  <Listbox.Option value={option} key={`listbox-item-${option.value}`} className="text-font-main cursor-default hover:bg-highlight-1 hover:text-white select-none relative py-2 pl-3 pr-9">
    <div className="flex items-center justify-between">
      <span className="ml-3 block font-normal truncate grow"><span className="text-highlight-2">
        {option.number}</span> - {option.label}
      </span>
      {option.type !== 'Normal' && <span className="mx-2 px-2 py-1 rounded-lg text-font-main bg-background-alt text-sm border-highlight-2 border">{option.type}</span>}
      <span>{option.AirDate}</span>
    </div>
  </Listbox.Option>
  );
};

const SelectEpisodeList = ({ options, value, onChange, onAddLink, className, emptyValue = '' }: Props) => {
  const [epFilter, setEpFilter ] = useState(0);
  const [selected, setSelected] = useState(options[0]);
  const [portalEl, setPortalEl] = useState(null as any);
  const [displayNode, setDisplayNode] = React.useState(null as any);
  const displayRef = useRef(null);
  const buttonRef = useRef(null);
  
  useEffect(() => {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot === null) { return; }
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
  
  const handleAddLink = () => {
    onAddLink();
    if (buttonRef.current !== null) {
      const button = buttonRef.current as HTMLButtonElement;
      button.click();
    }
  };

  const selectOption = (selectedOption) => {
    setSelected(selectedOption);
    onChange(selectedOption?.value ?? 0, selectedOption?.label ?? emptyValue);
  };
  
  const renderSelected = () => {
    if (!selected || !selected.label) return emptyValue;
    return (
      <React.Fragment>
        <span className="text-highlight-2">{selected.number}</span> - {selected.label}
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
      <Listbox.Options static className="absolute mt-1 w-full z-10 rounded-md bg-background-alt shadow-lg">
            <div className="flex flex-row px-3 pt-3 justify-between">
                <Input inline label="Number" type="text" id="epFilter" value={epFilter === 0 ? '' : epFilter} onChange={handleEpFilter} className="w-30"/>
                <Button className="flex items-center mr-4 font-normal text-font-main" onClick={handleAddLink}>
                    <Icon path={mdiPlusCircleOutline} size={1} className="mr-1" />
                    Add New Row
                </Button>
            </div>
            <div className="bg-background-border mx-3 my-4 h-0.5 flex-shrink-0" />
            <div className="max-h-96 overflow-y-auto">
              {options.map((item, idx) => ((epFilter > 0 && item.number === epFilter || epFilter === 0) && <SelectOption key={`listbox-item-${item.value}`} {...item} divider={idx > 0 && item.type !== options[idx - 1].type} />))}
            </div>
        </Listbox.Options>,
      portalEl,
    );
  };

  return (
    <div className={className} ref={handleDisplayRef}>
      <Listbox value={selected} onChange={selectOption}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button ref={buttonRef} className="relative w-full bg-background-alt border border-background-border rounded-md shadow-lg pl-2 pr-10 py-2 text-left cursor-default focus:outline-none focus:border-highlight-1">
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