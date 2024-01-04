import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiMagnify } from '@mdi/js';
import { createSelector } from '@reduxjs/toolkit';
import { useVirtualizer } from '@tanstack/react-virtual';
import { filter, map, pull } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useAniDBTagsQuery } from '@/core/react-query/tag/queries';
import { setFilterValues } from '@/core/slices/collection';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

const selectFilterValues = createSelector(
  [
    (state: RootState) => state.collection.filterValues,
    (state, expression: string) => expression,
  ],
  (values, expression) => values[expression] ?? [],
);

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
  const selectedValues = useSelector(state => selectFilterValues(state, criteria.Expression));
  const [unsavedValues, setUnsavedValues] = useState([] as string[]);
  const unusedValues = useMemo(
    () =>
      filter(
        tags,
        item => selectedValues.indexOf(String(item.ID)) === -1 && unsavedValues.indexOf(String(item.ID)) === -1,
      ),
    [tags, selectedValues, unsavedValues],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: unusedValues.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 20,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const selectValue = (value: string) => {
    setUnsavedValues([...unsavedValues, value]);
  };

  const removeValue = (value: string) => {
    if (unsavedValues.indexOf(value) !== -1) {
      setUnsavedValues(pull([...unsavedValues], value));
    }
    if (selectedValues.indexOf(value) !== -1) {
      dispatch(setFilterValues({ [criteria.Expression]: pull([...selectedValues], value) }));
    }
  };

  const handleCancel = () => {
    setUnsavedValues([]);
    onClose();
  };

  const handleSave = () => {
    dispatch(setFilterValues({ [criteria.Expression]: [...selectedValues, ...unsavedValues] }));
    setUnsavedValues([]);
    onClose();
  };

  const handleSelect = (id: string) => () => {
    selectValue(id);
  };

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      title={`Edit Condition - ${criteria.Name}`}
      titleLeft
      noGap
    >
      <div className="flex gap-2">
        <Input
          id="search"
          startIcon={mdiMagnify}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
      </div>
      <div
        ref={scrollRef}
        style={{ height: virtualizer.getTotalSize() }}
        className="shoko-scrollbar flex min-h-[15rem] grow flex-col gap-y-1 overflow-y-auto bg-panel-background-alt p-4"
      >
        {virtualItems.map((virtualRow) => {
          const value = unusedValues[virtualRow.index];
          return (
            <div
              onClick={handleSelect(String(value.ID))}
              className="leading-tight"
              key={value.ID}
            >
              {value.Name}
            </div>
          );
        })}
      </div>
      <div className="grow">
        <div className="shoko-scrollbar flex grow flex-col gap-x-2 overflow-auto bg-panel-background-alt">
          {map([...selectedValues, ...unsavedValues], value => (
            <div
              className="p-2"
              onClick={() => {
                removeValue(value);
              }}
              key={value}
            >
              {value}
            </div>
          ))}
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
