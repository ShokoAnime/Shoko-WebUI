import React, { type ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiFilterPlusOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { map, values } from 'lodash';

import AddCriteriaModal from '@/components/Collection/Filter/AddCriteriaModal';
import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import MultiValueCriteria from '@/components/Collection/Filter/MultiValueCriteria';
import TagCriteria from '@/components/Collection/Filter/TagCriteria';
import YearCriteria from '@/components/Collection/Filter/YearCriteria';
import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { resetActiveFilter, setActiveFilter } from '@/core/slices/collection';
import store from '@/core/store';

import type { RootState } from '@/core/store';
import type { FilterExpression, FilterTag } from '@/core/types/api/filter';

const buildTagCondition = (
  condition: FilterTag,
  type: string,
) => (condition.isExcluded
  ? { Type: 'Not', Left: { Type: type, Parameter: condition.Name } }
  : { Type: type, Parameter: condition.Name });
const buildFilterConditionTag = (conditionValues: FilterTag[], type: string): object => {
  if (conditionValues.length > 1) {
    return {
      Type: 'And',
      Left: buildTagCondition(conditionValues[0], type),
      Right: buildFilterConditionTag(conditionValues.slice(1), type),
    };
  }
  return buildTagCondition(conditionValues[0], type);
};
const buildFilterConditionMultivalue = (conditionValues: string[], type: string, operator = 'And'): object => {
  if (conditionValues.length > 1) {
    return {
      Type: operator,
      Left: { Type: type, Parameter: conditionValues[0] },
      Right: buildFilterConditionMultivalue(conditionValues.slice(1), type),
    };
  }
  return { Type: type, Parameter: conditionValues[0] };
};
const buildFilterCondition = (currentFilter: FilterExpression) => {
  if (currentFilter.Expression === 'HasCustomTag' || currentFilter.Expression === 'HasTag') {
    const tagValues = store.getState().collection.filterTags[currentFilter.Expression];
    return buildFilterConditionTag(tagValues, currentFilter.Expression);
  }
  if (currentFilter?.PossibleParameters) {
    const filterValues = store.getState().collection.filterValues[currentFilter.Expression];
    return buildFilterConditionMultivalue(filterValues, currentFilter.Expression);
  }
  if (currentFilter?.Expression === 'InYear') {
    const filterValues = store.getState().collection.filterValues[currentFilter.Expression];
    return buildFilterConditionMultivalue(filterValues, currentFilter.Expression, 'Or');
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
  if (criteria.Expression === 'InYear') {
    return YearCriteria;
  }
  if (criteria.PossibleParameters) {
    return MultiValueCriteria;
  }
  return DefaultCriteria;
};

type OptionButtonProps = (props: { icon: string, onClick: React.MouseEventHandler<HTMLDivElement> }) => ReactNode;
const OptionButton: OptionButtonProps = ({ icon, onClick }) => (
  <div
    className="cursor-pointer rounded border border-panel-border bg-button-secondary px-5 py-2 drop-shadow-md"
    onClick={onClick}
  >
    <Icon path={icon} size={1} />
  </div>
);

type OptionsProps = {
  showModal: () => void;
};
const Options = ({ showModal }: OptionsProps) => <OptionButton onClick={showModal} icon={mdiFilterPlusOutline} />;

const FilterSidebar = () => {
  const activeFilter = useSelector((state: RootState) => state.collection.activeFilter);
  const [criteriaModal, setCriteriaModal] = useState(false);
  const dispatch = useDispatch();
  const selectedCriteria = useSelector((state: RootState) => state.collection.filterCriteria);

  const applyFilter = () => {
    const requestData = buildFilter(values(selectedCriteria));
    dispatch(setActiveFilter(requestData));
  };

  const showCriteriaModal = (state: boolean) => () => {
    setCriteriaModal(state);
  };

  return (
    <ShokoPanel
      title="Filter"
      className="ml-8 w-full"
      contentClassName="gap-3"
      options={<Options showModal={showCriteriaModal(true)} />}
    >
      {map(selectedCriteria, (item) => {
        const CriteriaComponent = mapCriteriaComponent(item);
        return <CriteriaComponent key={item.Expression} criteria={item} />;
      })}
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
      <AddCriteriaModal show={criteriaModal} onClose={showCriteriaModal(false)} />
    </ShokoPanel>
  );
};

export default FilterSidebar;
