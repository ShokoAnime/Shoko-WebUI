import React, { useCallback, useEffect, useRef, useState } from 'react';
import { find } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronUp, mdiChevronDown, mdiPlusCircleOutline } from '@mdi/js';
import { Listbox } from '@headlessui/react';
import Input from './Input';
import Button from './Button';
import { useGetEpisodeAnidbQuery } from '../../core/rtkQuery/episodeApi';
import ReactDOM from 'react-dom';

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
};

type Props = {
  options: Array<Option>;
  value: number;
  onChange: (optionValue: number, label: string) => void;
  className?: string;
  emptyValue?: string;
};

const SelectOption = (option) => {
  const anidbQuery = useGetEpisodeAnidbQuery(option.value);
  const anidbData = anidbQuery?.data ?? { EpisodeNumber: '??', AirDate: '??' };
  return (
  <Listbox.Option value={option} key={`listbox-item-${option.value}`} className="text-white cursor-default hover:bg-highlight-1 hover:text-white select-none relative py-2 pl-3 pr-9">
    <div className="flex items-center justify-between">
      <span className="ml-3 block font-normal truncate">{anidbData.EpisodeNumber} - {option.label}</span>
      <span>{anidbData.AirDate}</span>
    </div>
  </Listbox.Option>
  );
};

const SelectEpisodeList = ({ options, value, onChange, className, emptyValue = '' }: Props) => {
  const [open, setOpen ] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const [portalEl, setPortalEl] = useState(null as any);
  const [displayNode, setDisplayNode] = React.useState(null as any);
  const displayRef = useRef(null);
  
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
    if (displayNode === null || portalEl === null) { return; }
    const rect = displayNode.getBoundingClientRect();
    const top = rect.top + getOffsetTop(rect, 'bottom');
    const left = rect.left + getOffsetLeft(rect, 0);
    portalEl.style.top = `${top}px`;
    portalEl.style.left = `${left}px`;
    portalEl.style.position = 'absolute';
    portalEl.style.width = `${displayNode.offsetWidth}px`;
  }, [displayNode, portalEl]);

  useEffect(() => {
    setSelected(find(options, ['value', value]) ?? {} as Option);
  }, [value, options]);

  const selectOption = (selectedOption) => {
    setOpen(false);
    setSelected(selectedOption);
    onChange(selectedOption?.value ?? 0, selectedOption?.label ?? emptyValue);
  };

  return (
    <div className={className} ref={handleDisplayRef}>
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
          {portalEl !== null && ReactDOM.createPortal(
            <Listbox.Options className="absolute mt-1 w-full z-10 rounded-md bg-background-alt shadow-lg">
              <div className="flex flex-row px-3 pt-3 justify-between">
                <Input inline label="Number" type="text" id="range" value="" onChange={() => {}} className="w-30"/>
                <Button className="flex items-center mr-4 font-normal text-font-main" onClick={() => {}}>
                  <Icon path={mdiPlusCircleOutline} size={1} className="mr-1" />
                  Add New Row
                </Button>
              </div>
              <div className="bg-background-border mx-3 my-4 h-0.5 flex-shrink-0" />
              {options.map(item => (<SelectOption key={`listbox-item-${item.value}`} {...item} />))}
            </Listbox.Options>,
            portalEl,
          )}
        </div>
      </Listbox>
    </div>
  );
};


export default SelectEpisodeList;