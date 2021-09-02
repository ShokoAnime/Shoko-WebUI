import React from 'react';

import Button from '../components/Input/Button';
import Checkbox from '../components/Input/Checkbox';

interface PageProps {
  title?: {};
  onCancel: () => void;
  onDelete: () => void;
}

export const Panel = ({ title, onCancel, onDelete }: PageProps) => (
  <div className="w-1/4">
    <div className="font-bold pb-2">{title}</div>
    <Checkbox className="py-1.5" isChecked labelRight label="Shoko only" />
    <Checkbox className="py-1.5" labelRight label="Shoko & physical" />
      <div className="pt-2">
          <Button className="button-color-primary mr-1" onClick={onCancel}>Cancel</Button>
          <Button className="bg-color-danger ml-1" onClick={onDelete}>Delete</Button>
      </div>
  </div>
);
