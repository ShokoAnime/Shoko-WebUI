import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { filter, keys, map, toPairs, values } from 'lodash';

import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import MultiValueCriteria from '@/components/Collection/Filter/MultiValueCriteria';
import TagCriteria from '@/components/Collection/Filter/TagCriteria';
import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { addFilterCriteria, resetActiveFilter, setActiveFilter } from '@/core/slices/collection';
import store from '@/core/store';
import { useFilterExpressionMain } from '@/hooks/filters';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

const buildTagCondition = (condition: [string, boolean], type: string) => {
  const value = condition[0];
  return condition[1] ? { Type: type, Parameter: value } : { Type: 'Not', Left: { Type: type, Parameter: value } };
};
const buildFilterConditionTag = (conditionValues: [string, boolean][], type: string): object => {
  if (conditionValues.length > 1) {
    return {
      Type: 'And',
      Left: buildTagCondition(conditionValues[0], type),
      Right: buildFilterConditionTag(conditionValues.slice(1), type),
    };
  }
  return buildTagCondition(conditionValues[0], type);
};
const buildFilterConditionMultivalue = (conditionValues: string[], type: string): object => {
  if (conditionValues.length > 1) {
    return {
      Type: 'And',
      Left: { Type: type, Parameter: conditionValues[0] },
      Right: buildFilterConditionMultivalue(conditionValues.slice(1), type),
    };
  }
  return { Type: type, Parameter: conditionValues[0] };
};
const buildFilterCondition = (currentFilter: FilterExpression) => {
  if (currentFilter.Expression === 'HasCustomTag' || currentFilter.Expression === 'HasTag') {
    const tagValues = store.getState().collection.filterTags;
    return buildFilterConditionTag(toPairs(tagValues), currentFilter.Expression);
  }
  if (currentFilter?.PossibleParameters) {
    const filterValues = store.getState().collection.filterValues[currentFilter.Expression];
    return buildFilterConditionMultivalue(filterValues, currentFilter.Expression);
  }

  const value = store.getState().collection.filterConditions[currentFilter.Expression] ?? true;
  return value ? { Type: currentFilter.Expression } : { Type: 'Not', Left: { Type: currentFilter.Expression } };
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

const mapCriteriaComponent = (criteria: FilterExpression) => {
  if (criteria.Expression === 'HasCustomTag' || criteria.Expression === 'HasTag') {
    return TagCriteria;
  }
  if (criteria.PossibleParameters) {
    return MultiValueCriteria;
  }
  return DefaultCriteria;
};

type Props = {
  show: boolean;
};

const FilterSidebar = ({ show }: Props) => {
  const activeFilter = useSelector((state: RootState) => state.collection.activeFilter);
  const allCriteria = useFilterExpressionMain(show);
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
      {map(selectedCriteria, (item) => {
        const CriteriaComponent = mapCriteriaComponent(item);
        return <CriteriaComponent key={item.Expression} criteria={item} />;
      })}
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
