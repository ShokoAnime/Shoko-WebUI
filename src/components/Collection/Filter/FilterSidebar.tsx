import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { mdiContentSaveOutline, mdiFilterPlusOutline } from '@mdi/js';
import { keys, map, values } from 'lodash';

import AddCriteriaModal from '@/components/Collection/Filter/AddCriteriaModal';
import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import MultiValueCriteria from '@/components/Collection/Filter/MultiValueCriteria';
import SavePresetModal from '@/components/Collection/Filter/SavePresetModal';
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

import type { ButtonType } from '@/components/Input/Button.utils';
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

const OptionButton = (
  { buttonType, disabled, icon, onClick, tooltip }: {
    buttonType?: ButtonType;
    disabled?: boolean;
    icon: string;
    onClick: React.MouseEventHandler<HTMLDivElement>;
    tooltip?: string;
  },
) => (
  <IconButton
    icon={icon}
    buttonType={buttonType ?? 'secondary'}
    buttonSize="normal"
    onClick={onClick}
    tooltip={tooltip}
    disabled={disabled}
  />
);

type OptionsProps = {
  showCriteriaModal: () => void;
  showSavePresetModal: () => void;
};

const Options = ({ showCriteriaModal, showSavePresetModal }: OptionsProps) => {
  const { filterId } = useParams();

  const activeCriteriaWithValues = useSelector(selectActiveCriteriaWithValues);

  const saveDisabled = filterId !== 'live' || keys(activeCriteriaWithValues).length === 0;
  const saveDisabledReason = filterId !== 'live' ? 'Editing presets is currently unsupported' : '';

  return (
    <div className="flex gap-2">
      <OptionButton
        onClick={showSavePresetModal}
        icon={mdiContentSaveOutline}
        tooltip={saveDisabled ? saveDisabledReason : 'Save as preset'}
        disabled={saveDisabled}
      />
      <OptionButton onClick={showCriteriaModal} icon={mdiFilterPlusOutline} tooltip="Add condition" />
    </div>
  );
};

const FilterSidebar = () => {
  const [criteriaModal, showCriteriaModal] = useState(false);
  const [savePresetModal, showSavePresetModal] = useState(false);
  const dispatch = useDispatch();
  const selectedCriteria = useSelector((state: RootState) => state.collection.filterCriteria);
  const activeCriteriaWithValues = useSelector(selectActiveCriteriaWithValues);

  const isFilterValid = keys(selectedCriteria).length > 0
    && keys(selectedCriteria).length === keys(activeCriteriaWithValues).length;

  const finalFilterExpression = isFilterValid ? buildSidebarFilter(values(selectedCriteria)) : undefined;

  useEffect(() => {
    if (isFilterValid && finalFilterExpression) dispatch(setActiveFilter(finalFilterExpression));
    else dispatch(resetActiveFilter());
  }, [dispatch, finalFilterExpression, isFilterValid]);

  return (
    <ShokoPanel
      title="Filter"
      className="sticky top-24 ml-6 h-[calc(100vh-18rem)]! w-full"
      contentClassName="gap-y-6"
      options={
        <Options
          showCriteriaModal={() => showCriteriaModal(true)}
          showSavePresetModal={() => showSavePresetModal(true)}
        />
      }
    >
      {map(
        selectedCriteria,
        item => <CriteriaComponent key={item.Expression} criteria={item} />,
      )}
      <Button
        buttonType="danger"
        className="px-4 py-3"
        onClick={() => dispatch(resetFilter())}
      >
        Clear Filter
      </Button>
      <AddCriteriaModal show={criteriaModal} onClose={() => showCriteriaModal(false)} />
      <SavePresetModal
        show={savePresetModal}
        onClose={() => showSavePresetModal(false)}
        filterCondition={finalFilterExpression}
      />
    </ShokoPanel>
  );
};

export default FilterSidebar;
