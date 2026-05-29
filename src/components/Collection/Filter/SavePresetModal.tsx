import React, { useLayoutEffect, useState } from 'react';
import { toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useCreateFilterMutation } from '@/core/react-query/filter/mutations';
import { useFiltersQuery } from '@/core/react-query/filter/queries';

import type { FilterCondition } from '@/core/types/api/filter';

type Props = {
  show: boolean;
  onClose: () => void;
  filterCondition?: FilterCondition;
};

const SavePresetModal = ({ filterCondition, onClose, show }: Props) => {
  const filtersQuery = useFiltersQuery(show);

  const [name, setName] = useState('');
  const [parentFilter, setParentFilter] = useState(-1);

  const { isPending: isCreatePending, mutate: createFilter } = useCreateFilterMutation();

  const filterExists = filtersQuery.data?.List.some(filter => filter.Name === name) ?? false;

  const directoryFilters = filtersQuery.data?.List.filter(filter => filter.IsDirectory) ?? [];

  useLayoutEffect(() => {
    if (show) return;
    setName('');
    setParentFilter(-1);
  }, [show]);

  const handleSave = () => {
    createFilter({
      Name: name,
      ApplyAtSeriesLevel: true,
      Expression: filterCondition,
      Sorting: { Type: 'Name', IsInverted: false },
      ParentID: parentFilter === -1 ? undefined : parentFilter,
    }, {
      onSuccess: () => onClose(),
      onError: () => toast.error('Failed to save preset!'),
    });
  };

  return (
    <ModalPanel show={show} onRequestClose={onClose} header="Save Preset" size="sm">
      <Input
        id="name"
        label="Name"
        type="text"
        value={name}
        onChange={event => setName(event.target.value)}
      />

      <Select
        id="parentFilter"
        label="Parent"
        value={parentFilter}
        onChange={event => setParentFilter(toNumber(event.target.value))}
        disabled={directoryFilters.length === 0}
      >
        <option value={-1}>None</option>
        {directoryFilters.map(filter => (
          <option key={filter.IDs.ID} value={filter.IDs.ID}>
            {filter.Name}
          </option>
        ))}
      </Select>

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button
          onClick={onClose}
          buttonType="secondary"
          buttonSize="normal"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          buttonSize="normal"
          disabled={!name || filterExists}
          tooltip={filterExists ? 'A preset with this name already exists' : ''}
          loading={isCreatePending}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default SavePresetModal;
