import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { createSelector } from '@reduxjs/toolkit';
import { filter, keys, map, values } from 'lodash';

import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { addFilterCriteria, resetActiveFilter, setActiveFilter } from '@/core/slices/collection';
import store from '@/core/store';
import { useFilterExpressionMain } from '@/hooks/filters';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

const selectParameter = createSelector(
  [
    (state: RootState) => state.collection.filterConditions,
    (state, param: string) => param,
  ],
  (conditions, param) => conditions[param],
);
const buildFilterCondition = (currentFilter: FilterExpression) => {
  if (currentFilter?.Parameter) {
    const value = selectParameter(store.getState(), currentFilter.Expression);
    return { Type: currentFilter.Expression, Parameter: value };
  }
  return currentFilter;
};
const buildFilter = (filters: FilterExpression[]): object => {
  if (filters.length > 1) {
    return {
      Type: 'And',
      Left: buildFilterCondition(filters[0]),
      Right: buildFilter(filters.slice(1)),
    };
  }
  return buildFilterCondition(filters[0]);
};

const FilterSidebar = () => {
  const activeFilter = useSelector((state: RootState) => state.collection.activeFilter);
  const allCriteria = useFilterExpressionMain();
  const [newCriteria, setNewCriteria] = useState('');
  const dispatch = useDispatch();
  const selectedCriteria = useSelector((state: RootState) => state.collection.filterCriteria);
  const unusedCriteria = useMemo(() => {
    const selectedKeys = keys(selectedCriteria);
    return filter(allCriteria, item => selectedKeys.indexOf(item.Expression) === -1);
  }, [allCriteria, selectedCriteria]);

  useEffect(() => {
    if (!allCriteria[0]) return;
    setNewCriteria(allCriteria[0]?.Expression ?? '');
  }, [allCriteria]);

  const addCriteria = () => {
    const filterExpression = filter(allCriteria, { Expression: newCriteria })[0];
    dispatch(addFilterCriteria(filterExpression));
  };

  const applyFilter = () => {
    const requestData = buildFilter(values(selectedCriteria));
    dispatch(setActiveFilter(requestData));
  };

  return (
    <ShokoPanel title="Filter" className="ml-8 w-full" contentClassName="gap-3">
      {map(selectedCriteria, item => <DefaultCriteria key={item.Expression} criteria={item} />)}
      <Select
        id="addCondition"
        label="Select Condition"
        value={newCriteria}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          setNewCriteria(event.currentTarget.value);
        }}
        options={
          <div
            onClick={() => {
              addCriteria();
            }}
          >
            <Icon className="cursor-pointer text-panel-icon-important" path={mdiPlusCircleOutline} size={1} />
          </div>
        }
      >
        {map(unusedCriteria, (item) => {
          const value = item?.Expression;
          return <option key={value} value={value}>{item.Name}</option>;
        })}
      </Select>
      {activeFilter === null && (
        <Button
          buttonType="primary"
          className="px-4 py-3"
          onClick={() => {
            applyFilter();
          }}
        >
          Apply filter
        </Button>
      )}
      {activeFilter !== null && (
        <Button
          buttonType="danger"
          className="px-4 py-3"
          onClick={() => {
            dispatch(resetActiveFilter());
          }}
        >
          Reset filter
        </Button>
      )}
    </ShokoPanel>
  );
};

export default FilterSidebar;
