import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiChevronRight, mdiMagnify, mdiMinusCircleOutline, mdiTagOffOutline, mdiTagOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { filter, findIndex, map } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useAniDBTagsQuery, useUserTagsQuery } from '@/core/react-query/tag/queries';
import { selectFilterTags, setFilterTag } from '@/core/slices/collection';

import type { FilterExpression, FilterTag } from '@/core/types/api/filter';
import type { TagType } from '@/core/types/api/tags';

type Props = {
  criteria: FilterExpression;
  show: boolean;
  onClose: () => void;
  removeCriteria: () => void;
};

const TagList = (
  { selectTag, unusedValues }: { selectTag: (name: string, select: boolean) => () => void, unusedValues: TagType[] },
) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: unusedValues.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
    overscan: 5,
  });
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="grow rounded-lg bg-panel-input p-4">
      <div
        className="relative h-full overflow-y-auto bg-panel-input"
        ref={scrollRef}
      >
        <div className="absolute top-0 w-full" style={{ height: virtualizer.getTotalSize() }}>
          <div
            className="absolute left-0 top-0 w-full"
            style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
          >
            {virtualItems.map((virtualRow) => {
              const item = unusedValues[virtualRow.index];
              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="flex items-center justify-between pb-1 leading-tight"
                >
                  {item.Name}
                  <div className="flex gap-x-2 pr-4">
                    <div onClick={selectTag(item.Name, false)}>
                      <Icon
                        className="cursor-pointer text-panel-icon-important"
                        path={mdiTagOutline}
                        size={1}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Include Tag"
                        data-tooltip-delay-show={500}
                      />
                    </div>
                    <div onClick={selectTag(item.Name, true)}>
                      <Icon
                        className="cursor-pointer text-panel-icon-danger"
                        path={mdiTagOffOutline}
                        size={1}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Exclude Tag"
                        data-tooltip-delay-show={500}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const TagCriteriaModal = ({ criteria, onClose, removeCriteria, show }: Props) => {
  const dispatch = useDispatch();
  const anidbTagsQuery = useAniDBTagsQuery(
    { pageSize: 0, excludeDescriptions: true },
    show && criteria.Expression === 'HasTag',
  );
  const userTagsQuery = useUserTagsQuery(
    { pageSize: 0, excludeDescriptions: true },
    show && criteria.Expression === 'HasCustomTag',
  );
  const tags = criteria.Expression === 'HasTag' ? anidbTagsQuery.data : userTagsQuery.data;
  const [search, setSearch] = useState('');
  // selectMode: included - true, excluded - false
  const [selectMode, setSelectMode] = useState<boolean>(true);
  const selectedValues = useSelector(state => selectFilterTags(state, criteria));
  const [unsavedValues, setUnsavedValues] = useState<FilterTag[]>([]);
  const unusedValues = useMemo(
    () =>
      filter(
        tags,
        (item: TagType) =>
          findIndex(selectedValues, { Name: item.Name }) === -1 && findIndex(unsavedValues, { Name: item.Name }) === -1
          && (search === '' ? true : item.Name.includes(search)),
      ),
    [tags, search, selectedValues, unsavedValues],
  );
  const combinedSelectedValues = useMemo(
    () => filter([...selectedValues, ...unsavedValues], tag => tag.isExcluded === !selectMode),
    [selectMode, selectedValues, unsavedValues],
  );

  const removeValue = (tagName: string) => () => {
    if (findIndex(unsavedValues, { Name: tagName }) !== -1) {
      setUnsavedValues(filter([...unsavedValues], item => item.Name !== tagName));
    }
    if (findIndex(selectedValues, { Name: tagName }) !== -1) {
      dispatch(setFilterTag({ [criteria.Expression]: filter([...selectedValues], item => item.Name !== tagName) }));
    }
  };

  const handleCancel = () => {
    setUnsavedValues([]);
    if (selectedValues.length === 0) removeCriteria();
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
      onRequestClose={handleCancel}
      header={`Edit Condition - ${criteria.Name}`}
      subHeader={criteria.Description}
      fullHeight
    >
      <div className="flex grow basis-0 flex-col gap-y-4">
        <Input
          id="search"
          startIcon={mdiMagnify}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
        <TagList unusedValues={unusedValues} selectTag={selectTag} />
      </div>
      <div className="flex grow basis-0 flex-col gap-y-4">
        <div className="flex items-center gap-x-2 font-semibold">
          <span>Selected Tags</span>
          <Icon path={mdiChevronRight} size={1} />
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
        <div className="flex grow basis-0 overflow-y-auto rounded-lg bg-panel-input p-4">
          <div className="flex w-full flex-col gap-y-1 overflow-y-auto bg-panel-input">
            {map(
              combinedSelectedValues,
              tag => (
                <div className="flex justify-between pr-4 leading-tight" key={tag.Name}>
                  {tag.Name}
                  <div onClick={removeValue(tag.Name)}>
                    <Icon
                      className="cursor-pointer text-panel-icon-danger"
                      path={mdiMinusCircleOutline}
                      size={1}
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Remove Tag"
                      data-tooltip-delay-show={500}
                    />
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
