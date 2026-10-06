import { useState } from 'react';
import { mdiCogOutline, mdiLoading, mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ToggleChips from '@/components/Utilities/AiringSchedule/ToggleChips';
import { useAiringSeasonSectionDefaultsQuery } from '@/core/react-query/airing-schedule/queries';
import useSyncedState from '@/hooks/useSyncedState';

import type { SeasonSectionDefinitionType } from '@/core/types/api/airing-season';
import type { AnimeTypeValues } from '@/core/types/api/series';
import type { DropResult } from '@hello-pangea/dnd';

/** A section of the layout with the key its row is drawn and dragged by, which is never saved. */
type SectionRowType = {
  key: string;
  section: SeasonSectionDefinitionType;
};

type Props = {
  /** The saved layout, or `null` to follow the server's default. */
  sections: SeasonSectionDefinitionType[] | null;
  /** Called with each edit's layout, or `null` to go back to the server's default. */
  onChange: (sections: SeasonSectionDefinitionType[] | null) => void;
};

const animeTypeOptions: { label: string, value: AnimeTypeValues }[] = [
  { label: 'TV', value: 'TV' },
  { label: 'TV Special', value: 'TVSpecial' },
  { label: 'Web', value: 'Web' },
  { label: 'Movie', value: 'Movie' },
  { label: 'OVA', value: 'OVA' },
  { label: 'Music Video', value: 'MusicVideo' },
  { label: 'Other', value: 'Other' },
  { label: 'Unknown', value: 'Unknown' },
];

const triStates = [
  { label: 'Any', value: 'any' },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
] as const;

const newSection: SeasonSectionDefinitionType = {
  Title: 'New Section',
  Types: null,
  Continuing: null,
  HalfLength: null,
};

let lastRowKey = 0;
const getRowKey = () => {
  lastRowKey += 1;
  return `section-${lastRowKey}`;
};

const toRows = (sections: SeasonSectionDefinitionType[]): SectionRowType[] =>
  sections.map(section => ({ key: getRowKey(), section }));

const toTriState = (value: boolean | null) => {
  if (value === null) return 'any';
  return value ? 'yes' : 'no';
};

const fromTriState = (state: string) => (state === 'any' ? null : state === 'yes');

// A rest group takes every anime no earlier section took, so nothing reaches a section after it.
const isRestGroup = (section: SeasonSectionDefinitionType) =>
  section.Types === null && section.Continuing === null && section.HalfLength === null;

const getSummary = (section: SeasonSectionDefinitionType) => {
  const types = section.Types === null
    ? 'Every type'
    : section.Types.map(type => animeTypeOptions.find(option => option.value === type)?.label ?? type).join(', ');
  const parts = [types];
  if (section.Continuing !== null) parts.push(section.Continuing ? 'Continuing' : 'Not continuing');
  if (section.HalfLength !== null) parts.push(section.HalfLength ? 'Half length' : 'Full length');
  return parts.join(' · ');
};

const SectionEditor = (
  { onChange, rowKey, section }: {
    rowKey: string;
    section: SeasonSectionDefinitionType;
    onChange: (section: SeasonSectionDefinitionType) => void;
  },
) => (
  <div className="flex flex-col gap-y-3 rounded-lg border border-panel-border bg-panel-background p-3">
    <div className="flex items-center justify-between gap-x-4">
      <span>Title</span>
      <InputSmall
        id={`${rowKey}-title`}
        type="text"
        value={section.Title}
        onChange={event => onChange({ ...section, Title: event.target.value })}
        className="w-64 px-3 py-1"
      />
    </div>
    <div className="flex flex-col gap-y-1">
      <span>Types</span>
      <ToggleChips
        options={animeTypeOptions}
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

/**
 * The season view's layout as a list of sections, dragged to reorder, each edited in place under its row. Every edit
 * is passed on as it happens. Until the first edit the list shows the server's default, which that edit copies.
 */
const SeasonSectionsEditor = ({ onChange, sections }: Props) => {
  // Read either way, so a reset can show the default at once.
  const defaultsQuery = useAiringSeasonSectionDefaultsQuery();
  const source = sections ?? defaultsQuery.data ?? null;
  // The rows are the editor's own once they are in: the saved layout read back after an edit would only redraw them
  // with new keys, and a reset sets them itself.
  const [rows, setRows] = useSyncedState<SeasonSectionDefinitionType[] | null, SectionRowType[] | null>(
    source,
    (current, previous) => previous ?? (current ? toRows(current) : null),
  );
  const [openKey, setOpenKey] = useState<string | null>(null);

  const updateRows = (newRows: SectionRowType[]) => {
    setRows(newRows);
    onChange(newRows.map(row => row.section));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!rows || !result.destination || result.destination.index === result.source.index) return;
    const reordered = [...rows];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    updateRows(reordered);
  };

  const handleAdd = () => {
    if (!rows) return;
    const row = { key: getRowKey(), section: newSection };
    updateRows([...rows, row]);
    setOpenKey(row.key);
  };

  const handleReset = () => {
    setRows(defaultsQuery.data ? toRows(defaultsQuery.data) : null);
    setOpenKey(null);
    onChange(null);
  };

  if (!rows) {
    return (
      <div className="flex grow items-center justify-center py-8">
        {defaultsQuery.isError
          ? <span className="text-panel-text-danger">The server&apos;s default sections could not be read.</span>
          : <Icon path={mdiLoading} spin size={3} className="text-panel-text-primary" />}
      </div>
    );
  }

  const restIndex = rows.findIndex(row => isRestGroup(row.section));

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-x-2">
        <span className="font-semibold">
          Sections
          {rows.length > 0 && <span className="ml-1.5 text-xs font-normal opacity-65">(Drag to Reorder)</span>}
        </span>
        <Button
          buttonType="secondary"
          className="px-2 py-1 whitespace-nowrap"
          onClick={handleReset}
          disabled={sections === null}
        >
          Reset to Default
        </Button>
      </div>
      <span className="text-sm opacity-65">
        Each anime goes to the first section it fits. Sections with no anime are hidden. Changes are saved as you make
        them.
      </span>
      <div className="flex min-h-10 flex-col rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        {rows.length === 0 && <span className="text-sm opacity-65">No sections.</span>}
        <DnDList onDragEnd={handleDragEnd}>
          {rows.map((row, index) => ({
            key: row.key,
            item: (
              <div className="flex flex-col gap-y-2 py-1">
                <div className="flex items-center justify-between gap-x-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{row.section.Title || 'Untitled'}</span>
                    <span className="truncate text-xs opacity-65">{getSummary(row.section)}</span>
                    {restIndex !== -1 && index > restIndex && (
                      <span className="text-xs opacity-65">
                        Never reached: an earlier section takes every type.
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-x-1">
                    <Button
                      onClick={() => setOpenKey(openKey === row.key ? null : row.key)}
                      tooltip={openKey === row.key ? 'Close' : 'Edit'}
                    >
                      <Icon
                        className={cx(openKey === row.key ? 'text-panel-text-primary' : 'text-panel-icon-action')}
                        path={mdiCogOutline}
                        size={1}
                      />
                    </Button>
                    <Button onClick={() => updateRows(rows.filter(item => item.key !== row.key))} tooltip="Remove">
                      <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                    </Button>
                  </div>
                </div>
                {openKey === row.key && (
                  <SectionEditor
                    rowKey={row.key}
                    section={row.section}
                    onChange={section =>
                      updateRows(rows.map(item => (item.key === row.key ? { ...item, section } : item)))}
                  />
                )}
              </div>
            ),
          }))}
        </DnDList>
      </div>
      {/* The default layout leaves some types out by design, so only a custom one is told. */}
      {sections !== null && restIndex === -1 && (
        <span className="text-sm opacity-65">Anime no section takes are left out, counts included.</span>
      )}
      <Button buttonType="secondary" className="flex items-center justify-center gap-x-2 py-2" onClick={handleAdd}>
        <Icon path={mdiPlusCircleOutline} size={0.833} />
        Add Section
      </Button>
    </div>
  );
};

export default SeasonSectionsEditor;
