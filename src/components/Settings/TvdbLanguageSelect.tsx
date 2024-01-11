import React from 'react';

import SelectSmall from '@/components/Input/SelectSmall';

const tvdbLanguages = [
  ['en', 'English'],
  ['sv', 'Swedish'],
  ['no', 'Norwegian'],
  ['da', 'Danish'],
  ['fi', 'Finnish'],
  ['nl', 'Dutch'],
  ['de', 'German'],
  ['it', 'Italian'],
  ['es', 'Spanish'],
  ['fr', 'French'],
  ['pl', 'Polish'],
  ['hu', 'Hungarian'],
  ['el', 'Greek'],
  ['tr', 'Turkish'],
  ['ru', 'Russian'],
  ['he', 'Hebrew'],
  ['ja', 'Japanese'],
  ['pt', 'Portuguese'],
  ['cs', 'Czech'],
  ['sl', 'Slovenian'],
  ['hr', 'Croatian'],
  ['ko', 'Korean'],
  ['zh', 'Chinese'],
];

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

const TvdbLanguageSelect = ({ id, label, onChange, value }: Props) => (
  <SelectSmall
    id={id}
    label={label}
    value={value}
    onChange={onChange}
  >
    {tvdbLanguages.map(
      item => <option value={item[0]} key={item[0]}>{item[1]}</option>,
    )}
  </SelectSmall>
);

export default TvdbLanguageSelect;
