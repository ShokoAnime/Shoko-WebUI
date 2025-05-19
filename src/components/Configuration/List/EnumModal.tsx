import React, { useEffect, useState } from 'react';
import { map, remove } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

import type { EnumDefinitionType } from '@/core/react-query/configuration/types';

export type EnumModalProps = {
  definitions: EnumDefinitionType[];
  onClose: () => void;
  setValues: (values: string[]) => void;
  show: boolean;
  title: string;
  values: string[];
};

function EnumModal({ definitions, onClose, show, title, ...props }: EnumModalProps) {
  const [currentValues, setCurrentValues] = useState(props.values);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked: value, id } = event.target;

    const newValues = currentValues.slice();

    if (value) newValues.push(id);
    else remove(newValues, item => item === id);

    setCurrentValues(newValues);
  };

  const handleSave = useEventCallback(() => {
    props.setValues(currentValues);
    onClose();
  });

  useEffect(() => {
    setCurrentValues(props.values);
  }, [props.values]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={title}
    >
      <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4 capitalize">
        <div className="flex max-h-80 flex-col gap-y-1.5 overflow-y-auto rounded-lg bg-panel-input px-3 py-2">
          {map(definitions, definition => (
            <Checkbox
              id={definition.value}
              key={definition.value}
              isChecked={currentValues.includes(definition.value)}
              onChange={handleInputChange}
              label={definition.title}
              justify
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">
          Cancel
        </Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2" disabled={currentValues.length === 0}>
          Save
        </Button>
      </div>
    </ModalPanel>
  );
}

export default EnumModal;
