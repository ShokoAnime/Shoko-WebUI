import { useState } from 'react';
import { uniqueId } from 'lodash';

import SeasonSectionEditor from '@/components/Calendar/Settings/SeasonSectionEditor';
import Button from '@/components/Input/Button';
import OrderList from '@/components/Settings/OrderList';
import { useAiringSeasonSectionDefaultsQuery } from '@/core/react-query/airing-schedule/queries';
import { getSectionSummary, isRestSection } from '@/core/utilities/airingSchedule';
import useSyncedState from '@/hooks/useSyncedState';

import type { SeasonSectionDefinitionType } from '@/core/types/api/airing-season';

type Props = {
  /** The saved layout, or `null` to follow the server's default. */
  sections: SeasonSectionDefinitionType[] | null;
  /** Called with each edit's layout, or `null` to go back to the server's default. */
  onChange: (sections: SeasonSectionDefinitionType[] | null) => void;
};

type RowType = { key: string, section: SeasonSectionDefinitionType };

const newSection: SeasonSectionDefinitionType = {
  Title: 'New Section',
  Types: null,
  Continuing: null,
  HalfLength: null,
};

const toRows = (sections: SeasonSectionDefinitionType[]): RowType[] =>
  sections.map(section => ({ key: uniqueId('section-'), section }));

const SeasonSectionsEditor = ({ onChange, sections }: Props) => {
  const defaultsQuery = useAiringSeasonSectionDefaultsQuery();
  // Until the first edit the list shows the server's default, which that edit copies. The rows are the editor's own
  // once they are in, so an edit does not draw them again with new keys.
  const [rows, setRows] = useSyncedState<SeasonSectionDefinitionType[] | null, RowType[] | null>(
    sections ?? defaultsQuery.data ?? null,
    (source, previous) => previous ?? (source ? toRows(source) : null),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const updateRows = (newRows: RowType[]) => {
    setRows(newRows);
    onChange(newRows.map(row => row.section));
  };

  const handleOrderChange = (keys: string[]) => {
    const byKey = new Map((rows ?? []).map(row => [row.key, row]));
    updateRows(keys.flatMap(key => byKey.get(key) ?? []));
  };

  const handleAdd = () => {
    const row = { key: uniqueId('section-'), section: newSection };
    updateRows([...(rows ?? []), row]);
    setSelectedKey(row.key);
  };

  const handleReset = () => {
    setRows(defaultsQuery.data ? toRows(defaultsQuery.data) : null);
    setSelectedKey(null);
    onChange(null);
  };

  const restIndex = (rows ?? []).findIndex(row => isRestSection(row.section));
  const selected = rows?.find(row => row.key === selectedKey);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-x-2">
        <span className="font-semibold">Sections</span>
        <Button buttonType="secondary" className="px-2 py-1" onClick={handleReset} disabled={sections === null}>
          Reset to Default
        </Button>
      </div>
      <OrderList
        label="Each anime goes to the first section it fits"
        items={(rows ?? []).map((row, index) => ({
          key: row.key,
          content: (
            <button
              type="button"
              className="flex min-w-0 flex-col text-left"
              onClick={() => setSelectedKey(row.key)}
            >
              <span className={row.key === selectedKey ? 'truncate text-panel-text-primary' : 'truncate'}>
                {row.section.Title || 'Untitled'}
              </span>
              <span className="truncate text-xs opacity-65">{getSectionSummary(row.section)}</span>
              {restIndex !== -1 && index > restIndex && (
                <span className="text-xs opacity-65">Never reached: an earlier section takes every type.</span>
              )}
            </button>
          ),
        }))}
        onOrderChange={handleOrderChange}
        onAdd={handleAdd}
        addTooltip="Add Section"
        isPending={!rows && defaultsQuery.isPending}
        errorMessage={!rows && defaultsQuery.isError ? 'The server\'s default sections could not be read.' : undefined}
        emptyStateMessage="No sections."
      />
      {selected && (
        <SeasonSectionEditor
          section={selected.section}
          onChange={section => updateRows((rows ?? []).map(row => (row === selected ? { ...row, section } : row)))}
        />
      )}
      {/* The default layout leaves some types out by design, so only a custom one is told. */}
      {sections !== null && restIndex === -1 && (
        <span className="text-sm opacity-65">Anime no section takes are left out, counts included.</span>
      )}
    </div>
  );
};

export default SeasonSectionsEditor;
