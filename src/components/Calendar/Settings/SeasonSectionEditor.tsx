import CheckboxGroup from '@/components/Input/CheckboxGroup';
import InputSmall from '@/components/Input/InputSmall';
import MultiStateButton from '@/components/Input/MultiStateButton';
import { ANIME_TYPE_OPTIONS } from '@/core/utilities/airingSchedule';

import type { SeasonSectionDefinitionType } from '@/core/types/api/airing-season';

type Props = {
  onChange: (section: SeasonSectionDefinitionType) => void;
  section: SeasonSectionDefinitionType;
};

const triStates = [
  { label: 'Any', value: 'any' },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
] as const;

const toTriState = (value: boolean | null) => {
  if (value === null) return 'any';
  return value ? 'yes' : 'no';
};

const fromTriState = (state: string) => (state === 'any' ? null : state === 'yes');

const SeasonSectionEditor = ({ onChange, section }: Props) => (
  <div className="flex flex-col gap-y-3 rounded-lg border border-panel-border bg-panel-background p-3">
    <div className="flex items-center justify-between gap-x-4">
      <span>Title</span>
      <InputSmall
        id="section-title"
        type="text"
        value={section.Title}
        onChange={event => onChange({ ...section, Title: event.target.value })}
        className="w-64 px-3 py-1"
      />
    </div>
    <div className="flex flex-col gap-y-1">
      <span>Types</span>
      <CheckboxGroup
        idPrefix="section-type"
        options={ANIME_TYPE_OPTIONS}
        selected={section.Types ?? []}
        onChange={types => onChange({ ...section, Types: types.length === 0 ? null : types })}
      />
      <span className="text-sm opacity-65">None selected takes every type.</span>
    </div>
    <div className="flex items-center justify-between gap-x-4">
      <span>Continuing</span>
      <MultiStateButton
        states={triStates}
        activeState={toTriState(section.Continuing)}
        onStateChange={state => onChange({ ...section, Continuing: fromTriState(state) })}
        alternateColor
        compact
      />
    </div>
    <div className="flex items-center justify-between gap-x-4">
      <span>Half Length</span>
      <MultiStateButton
        states={triStates}
        activeState={toTriState(section.HalfLength)}
        onStateChange={state => onChange({ ...section, HalfLength: fromTriState(state) })}
        alternateColor
        compact
      />
    </div>
  </div>
);

export default SeasonSectionEditor;
