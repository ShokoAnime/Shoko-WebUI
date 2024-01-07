import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiMagnify, mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { filter, map } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useAniDBTagsQuery } from '@/core/react-query/tag/queries';
import { selectFilterTags, setFilterTag } from '@/core/slices/collection';

import type { FilterExpression, FilterTag } from '@/core/types/api/filter';

type Props = {
  criteria: FilterExpression;
  show: boolean;
  onClose: () => void;
};
const TagCriteriaModal = ({ criteria, onClose, show }: Props) => {
  const dispatch = useDispatch();
  const tagsQuery = useAniDBTagsQuery({ pageSize: 0, excludeDescriptions: true }, show);
  const tags = tagsQuery.data;
  const [search, setSearch] = useState('');
  // selectMode: included - true, excluded - false
  const [selectMode, setSelectMode] = useState<boolean>(true);
  const selectedValues = useSelector(state => selectFilterTags(state, criteria));
  const [unsavedValues, setUnsavedValues] = useState<FilterTag[]>([]);
  const unusedValues = useMemo(
    () =>
      filter(
        tags,
        item =>
          selectedValues[item.ID] === undefined && unsavedValues[item.ID] === undefined
          && (search === '' ? true : item.Name.indexOf(search) !== -1),
      ),
    [tags, search, selectedValues, unsavedValues],
  );
  const combinedSelectedValues = useMemo(
    () => filter([...selectedValues, ...unsavedValues], tag => tag.isExcluded === !selectMode),
    [selectMode, selectedValues, unsavedValues],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: unusedValues.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 24,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const removeValue = (tagName: string) => () => {
    if (unsavedValues[tagName] !== undefined) {
      setUnsavedValues(filter([...unsavedValues], item => item.Name !== tagName));
    }
    if (selectedValues[tagName] !== undefined) {
      dispatch(setFilterTag({ [criteria.Expression]: filter([...selectedValues], item => item.Name !== tagName) }));
    }
  };

  const handleCancel = () => {
    setUnsavedValues([]);
    onClose();
  };

  const handleSave = () => {
    dispatch(setFilterTag({ [criteria.Expression]: [...selectedValues, ...unsavedValues] }));
    setUnsavedValues([]);
    onClose();
  };

  const selectTag = (name: string, isExcluded: boolean) => () => {
    const tag = { Name: name, isExcluded };
    setUnsavedValues([...unsavedValues, tag]);
  };

  const handleSetSelectMode = (mode: boolean) => () => {
    setSelectMode(mode);
  };

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      title={`Edit Condition - ${criteria.Name}`}
      titleLeft
    >
      <div className="flex flex-col gap-y-4 overflow-y-auto">
        <Input
          id="search"
          startIcon={mdiMagnify}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
        {/* FIXME: this prevents list from disappearing but breaks the closing animation, find a better way to do this */}
        {show && (
          <div className="shoko-scrollbar overflow-y-auto bg-panel-background-alt p-4">
            <div
              ref={scrollRef}
              style={{ height: virtualizer.getTotalSize() }}
              className="relative min-h-[15rem]"
            >
              {virtualItems.map((virtualRow) => {
                const value = unusedValues[virtualRow.index];
                return (
                  <div
                    className="absolute left-0 top-0 flex w-full justify-between leading-tight"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                    key={value.ID}
                    ref={virtualizer.measureElement}
                    data-index={virtualRow.index}
                  >
                    {value.Name}
                    <div className="flex gap-x-2">
                      <div onClick={selectTag(value.Name, false)}>
                        <Icon
                          className="cursor-pointer text-panel-icon-important"
                          path={mdiPlusCircleOutline}
                          size={1}
                        />
                      </div>
                      <div onClick={selectTag(value.Name, true)}>
                        <Icon className="cursor-pointer text-panel-icon-danger" path={mdiPlusCircleOutline} size={1} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-4">
        <div className="flex gap-x-2">
          <span>Selected Tags</span>
          <span className="px-2">{'>'}</span>
          <span
            className={cx('cursor-pointer', { 'text-panel-text-primary': selectMode })}
            onClick={handleSetSelectMode(true)}
          >
            Included
          </span>
          <span>|</span>
          <span
            className={cx('cursor-pointer', { 'text-panel-text-primary': !selectMode })}
            onClick={handleSetSelectMode(false)}
          >
            Excluded
          </span>
        </div>
        <div className="shoko-scrollbar h-[15rem] max-h-[15rem] grow overflow-auto bg-panel-background-alt p-4">
          <div className=" flex grow flex-col gap-x-2 bg-panel-background-alt">
            {map(
              combinedSelectedValues,
              tag => (
                <div className="flex justify-between leading-tight" key={tag.Name}>
                  {tag.Name}
                  <div onClick={removeValue(tag.Name)}>
                    <Icon className="cursor-pointer text-panel-icon-danger" path={mdiMinusCircleOutline} size={1} />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-6 py-2"
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default TagCriteriaModal;
