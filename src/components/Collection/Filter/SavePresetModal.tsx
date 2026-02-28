import React, { useState } from 'react';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
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

  const { isPending: isCreatePending, mutate: createFilter } = useCreateFilterMutation();

  const filterExists = filtersQuery.data?.List.some(filter => filter.Name === name) ?? false;

  const handleClose = () => {
    setName('');
    onClose();
  };

  const handleSave = () => {
    createFilter({
      Name: name,
      ApplyAtSeriesLevel: true,
      Expression: filterCondition,
      Sorting: { Type: 'Name', IsInverted: false },
    }, {
      onSuccess: () => handleClose(),
      onError: () => toast.error('Failed to save preset!'),
    });
  };

  return (
    <ModalPanel show={show} onRequestClose={handleClose} header="Save Preset" size="sm">
      <Input
        id="name"
        label="Name"
        type="text"
        value={name}
        onChange={event => setName(event.target.value)}
      />

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button
          onClick={handleClose}
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
