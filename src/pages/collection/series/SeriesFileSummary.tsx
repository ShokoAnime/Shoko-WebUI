import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import FileMissingEpisodes from '@/components/Collection/Files/FilesMissingEpisodes';
import FileOverview from '@/components/Collection/Files/FilesOverview';
import FilesSummaryGroups from '@/components/Collection/Files/FilesSummaryGroup';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { WebuiSeriesFileSummaryType } from '@/core/types/api/webui';

type ModeType = 'Series' | 'Missing';

type FileSelectionHeaderProps = {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  fileSummary?: WebuiSeriesFileSummaryType;
};
const FilesSelectionHeader = React.memo(({ fileSummary, mode, setMode }: FileSelectionHeaderProps) => (
  <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
    <div className="flex gap-x-2 text-xl font-semibold">
      {mode}
      &nbsp;Files |
      {mode === 'Series'
        ? (
          <>
            <span className="text-panel-text-important">{fileSummary?.Groups.length ?? 0}</span>
            {fileSummary?.Groups?.length === 1 ? 'Entry' : 'Entries'}
          </>
        )
        : (
          <>
            <span className="text-panel-text-important">{fileSummary?.MissingEpisodes.length ?? 0}</span>
            {fileSummary?.MissingEpisodes?.length === 1 ? 'Entry' : 'Entries'}
          </>
        )}
    </div>
    <div className="flex items-center gap-x-1 text-xl font-semibold">
      {['Series', 'Missing'].map((key: ModeType) => (
        <Button
          className={cx(
            'w-[150px] rounded-lg ml-2 py-3 px-4 !font-normal',
            mode !== key
              ? 'bg-panel-toggle-background-alt text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover'
              : '!bg-panel-toggle-background text-panel-toggle-text',
          )}
          key={key}
          onClick={() => setMode(key)}
        >
          {key}
          &nbsp;Files
        </Button>
      ))}
    </div>
  </div>
));

const groupFilterMap = {
  GroupName: 'Release Group',
  FileVersion: 'Video Version',
  FileLocation: 'Location',
  AudioLanguages: 'Audio Language',
  SubtitleLanguages: 'Subtitle Language',
  VideoResolution: 'Resolution',
};
type GroupFilterPanelProps = {
  filter: Set<string>;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const GroupFilterPanel = React.memo(({ filter, onFilterChange }: GroupFilterPanelProps) => (
  <ShokoPanel
    title="Grouping Options"
    contentClassName="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6"
    transparent
    fullHeight={false}
  >
    {Object.keys(groupFilterMap).map((k: keyof typeof groupFilterMap) => (
      <Checkbox
        justify
        label={groupFilterMap[k]}
        id={k}
        key={k}
        isChecked={filter.has(k)}
        onChange={onFilterChange}
      />
    ))}
  </ShokoPanel>
));

const SeriesFileSummary = () => {
  const { seriesId } = useParams();

  const [mode, setMode] = useState<ModeType>('Series');
  const [filter, setFilter] = useState<Set<string>>(new Set(Object.keys(groupFilterMap)));

  useEffect(() => setFilter(new Set(Object.keys(groupFilterMap))), [mode]);

  const handleFilterChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prevState) => {
      const { id: filterOption } = event.target;
      const newState = new Set(prevState);
      if (!newState.delete(filterOption)) newState.add(filterOption);
      return newState;
    });
  });

  const { data: fileSummary, isFetching, isLoading } = useSeriesFileSummaryQuery(
    toNumber(seriesId!),
    { groupBy: [...filter].join(',') },
    !!seriesId,
  );

  if (!seriesId) return null;

  return (
    <div className="flex w-full gap-x-6">
      <div className="flex flex-col gap-y-6">
        {mode === 'Series' && <GroupFilterPanel filter={filter} onFilterChange={handleFilterChange} />}
        <FileOverview overview={fileSummary?.Overview} />
      </div>

      <div className="flex w-full flex-col gap-y-6">
        <FilesSelectionHeader
          mode={mode}
          setMode={setMode}
          fileSummary={fileSummary}
        />

        <div className="flex grow flex-col gap-y-6">
          {isLoading && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} spin size={3} />
            </div>
          )}
          {mode === 'Series'
            ? <FilesSummaryGroups groups={fileSummary?.Groups} fetchingState={isFetching} />
            : <FileMissingEpisodes missingEps={fileSummary?.MissingEpisodes} />}
        </div>
      </div>
    </div>
  );
};

export default SeriesFileSummary;
