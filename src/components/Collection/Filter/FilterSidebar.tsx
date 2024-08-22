import React, { type ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiFilterPlusOutline } from '@mdi/js';
import { keys, map, values } from 'lodash';

import AddCriteriaModal from '@/components/Collection/Filter/AddCriteriaModal';
import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import MultiValueCriteria from '@/components/Collection/Filter/MultiValueCriteria';
import TagCriteria from '@/components/Collection/Filter/TagCriteria';
import Button from '@/components/Input/Button';
import IconButton from '@/components/Input/IconButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import {
  resetActiveFilter,
  resetFilter,
  selectActiveCriteriaWithValues,
  setActiveFilter,
} from '@/core/slices/collection';
import { buildSidebarFilter } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';
import type { FilterExpression } from '@/core/types/api/filter';

const CriteriaComponent = ({ criteria }: { criteria: FilterExpression }) => {
  if (criteria.Expression === 'HasCustomTag' || criteria.Expression === 'HasTag') {
    return <TagCriteria criteria={criteria} />;
  }
  if (criteria.PossibleParameters ?? criteria.PossibleParameterPairs) {
    return <MultiValueCriteria criteria={criteria} />;
  }
  return <DefaultCriteria criteria={criteria} />;
};

type OptionButtonProps = (props: { icon: string, onClick: React.MouseEventHandler<HTMLDivElement> }) => ReactNode;
const OptionButton: OptionButtonProps = ({ icon, onClick }) => (
  <IconButton icon={icon} buttonType="secondary" buttonSize="normal" onClick={onClick} />
);
type OptionsProps = {
  showModal: () => void;
};
const Options = ({ showModal }: OptionsProps) => <OptionButton onClick={showModal} icon={mdiFilterPlusOutline} />;

const FilterSidebar = () => {
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

  const handleResetFilter = useEventCallback(() => {
    dispatch(resetFilter());
  });

  useEffect(() => {
    const count = keys(selectedCriteria).length;
    if (count !== keys(activeCriteriaWithValues).length) return;
    if (count > 0) applyFilter();
    else dispatch(resetActiveFilter());
  }, [activeCriteriaWithValues, applyFilter, dispatch, selectedCriteria]);

  return (
    <ShokoPanel
      title="Filter"
      className="ml-8 w-full"
      contentClassName="gap-y-6"
      options={<Options showModal={showCriteriaModal(true)} />}
    >
      {map(
        selectedCriteria,
        item => <CriteriaComponent key={item.Expression} criteria={item} />,
      )}
      <Button
        buttonType="danger"
        className="px-4 py-3"
        onClick={handleResetFilter}
      >
        Clear filter
      </Button>
      <AddCriteriaModal show={criteriaModal} onClose={showCriteriaModal(false)} />
    </ShokoPanel>
  );
};

export default FilterSidebar;
