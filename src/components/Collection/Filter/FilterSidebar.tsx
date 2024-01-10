import React, { type ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiFilterPlusOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { forEach, keys, map, values } from 'lodash';

import AddCriteriaModal from '@/components/Collection/Filter/AddCriteriaModal';
import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import MultiValueCriteria from '@/components/Collection/Filter/MultiValueCriteria';
import SeasonCriteria from '@/components/Collection/Filter/SeasonCriteria';
import TagCriteria from '@/components/Collection/Filter/TagCriteria';
import YearCriteria from '@/components/Collection/Filter/YearCriteria';
import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { buildSidebarFilter } from '@/core/buildFilter';
import {
  removeFilterCriteria,
  resetActiveFilter,
  selectActiveCriteriaWithValues,
  setActiveFilter,
} from '@/core/slices/collection';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

const mapCriteriaComponent = (criteria: FilterExpression) => {
  if (criteria.Expression === 'HasCustomTag' || criteria.Expression === 'HasTag') {
    return TagCriteria;
  }
  if (criteria.Expression === 'InYear') {
    return YearCriteria;
  }
  if (criteria.Expression === 'InSeason') {
    return SeasonCriteria;
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
  const activeCriteriaWithValues = useSelector(selectActiveCriteriaWithValues);

  const applyFilter = useEventCallback(() => {
    const requestData = buildSidebarFilter(values(selectedCriteria));
    dispatch(setActiveFilter(requestData));
  });

  const showCriteriaModal = (state: boolean) => () => {
    setCriteriaModal(state);
  };

  const resetFilter = useEventCallback(() => {
    forEach(selectedCriteria, (criteria) => {
      dispatch(removeFilterCriteria(criteria));
    });
  });

  useEffect(() => {
    const count = keys(selectedCriteria).length;
    if (count !== keys(activeCriteriaWithValues).length) return;
    if (count > 0) applyFilter();
    else dispatch(resetActiveFilter());
  }, [activeCriteriaWithValues, applyFilter, dispatch, resetFilter, selectedCriteria]);

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
      <Button
        buttonType="danger"
        className="px-4 py-3"
        onClick={resetFilter}
        disabled={!activeFilter}
      >
        Reset filter
      </Button>
      <AddCriteriaModal show={criteriaModal} onClose={showCriteriaModal(false)} />
    </ShokoPanel>
  );
};

export default FilterSidebar;
