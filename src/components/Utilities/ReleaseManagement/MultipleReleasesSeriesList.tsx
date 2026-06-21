import React, { useEffect, useRef } from 'react';
import { mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import { useMultipleReleaseSeriesQuery } from '@/core/react-query/release-management/queries';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { MultipleReleasesSeriesRequestType } from '@/core/react-query/release-management/types';
import type { SeriesWithCandidatesType } from '@/core/types/api/release-management';
import type { Updater } from 'use-immer';

type Props = {
  onlyFinishedSeries: boolean;
  onlyWithRedundant: boolean;
  autoDeleteMode?: boolean;
  defaultSelected?: boolean;
  exceptions?: Set<number>;
  setExceptions?: Updater<Set<number>>;
  search?: string;
  onSeriesDetailOpen: (seriesId: number) => void;
  onRowSelect?: (seriesId: number) => void;
  onSeriesCountChange: (count: number) => void;
};

const SeriesRow = ({
  autoDeleteMode,
  index,
  isSelected,
  onDetailOpen,
  onRowClick,
  onToggle,
  series,
}: {
  series: SeriesWithCandidatesType;
  index: number;
  autoDeleteMode: boolean;
  isSelected: boolean;
  onDetailOpen: () => void;
  onRowClick: (event: React.MouseEvent, index: number) => void;
  onToggle: () => void;
}) => {
  const redundantFileCount = series.Candidates.reduce(
    (sum, candidate) => sum + candidate.Files.filter(file => file.IsRedundant).length,
    0,
  );
  const primary = series.Candidates[0];

  const defaultBg = index % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt';
  const rowBgClass = autoDeleteMode && isSelected
    ? 'bg-panel-background-selected-row'
    : defaultBg;

  return (
    <div
      className={cx(
        'relative flex cursor-pointer items-center gap-3 rounded-lg border border-panel-border p-4 text-sm transition-colors',
        rowBgClass,
      )}
      onClick={(event) => {
        if (autoDeleteMode) {
          onRowClick(event, index);
        } else {
          onDetailOpen();
        }
      }}
      onMouseDown={(event) => {
        if (autoDeleteMode && event.shiftKey) event.preventDefault();
      }}
    >
      <div
        className={cx(
          'shrink-0 overflow-hidden transition-all duration-300 ease-in-out',
          autoDeleteMode ? 'max-w-10 opacity-100' : 'max-w-0 opacity-0',
        )}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Checkbox
          id={`series-select-${series.SeriesID}`}
          isChecked={isSelected}
          onChange={onToggle}
          label=""
        />
      </div>

      <div className="flex min-w-0 grow flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{series.SeriesTitle}</span>
          {series.IsAiring && (
            <span className="shrink-0 rounded-sm bg-panel-text-primary/20 px-1.5 py-0.5 text-xs font-semibold text-panel-text-primary">
              Airing
            </span>
          )}
          <a
            href={`https://anidb.net/anime/${series.AnidbAnimeID}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-panel-text-primary"
            aria-label="Open AniDB series page"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex items-center gap-1 font-semibold">
              <div className="metadata-link-icon AniDB" />
              {series.AnidbAnimeID}
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={0.6667} />
            </div>
          </a>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 opacity-65">
          <span>
            <span className="font-semibold text-panel-text-important">{series.Candidates.length}</span>{' '}
            {series.Candidates.length === 1 ? 'candidate' : 'candidates'}
          </span>
          {primary && (
            <span>
              Primary:&nbsp;
              {primary.Name}
            </span>
          )}
          {series.HasRedundantCandidates
            ? (
              <span>
                <span className="font-semibold text-panel-text-danger">{redundantFileCount}</span>{' '}
                {redundantFileCount === 1 ? 'file' : 'files'} to auto-delete
              </span>
            )
            : <span>No auto-delete available</span>}
        </div>
      </div>
    </div>
  );
};

const MultipleReleasesSeriesList = ({
  autoDeleteMode = false,
  defaultSelected = true,
  exceptions,
  onRowSelect,
  onSeriesCountChange,
  onSeriesDetailOpen,
  onlyFinishedSeries,
  onlyWithRedundant,
  search,
  setExceptions,
}: Props) => {
  const params: MultipleReleasesSeriesRequestType = {
    onlyFinishedSeries,
    onlyWithRedundant,
    search,
    pageSize: 50,
  };

  const seriesQuery = useMultipleReleaseSeriesQuery(params);
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const lastRowIndex = useRef<number | undefined>(undefined);

  useEffect(() => {
    lastRowIndex.current = undefined;
  }, [onlyFinishedSeries, onlyWithRedundant, search]);

  useEffect(() => {
    onSeriesCountChange(seriesCount);
  }, [seriesCount, onSeriesCountChange]);

  const computeIsSelected = (seriesId: number): boolean => {
    if (defaultSelected) return !(exceptions?.has(seriesId) ?? false);
    return exceptions?.has(seriesId) ?? false;
  };

  const handleRowClick = (event: React.MouseEvent, index: number, seriesId: number) => {
    if (event.shiftKey && lastRowIndex.current !== undefined && setExceptions) {
      const anchorIsSelected = computeIsSelected(series[lastRowIndex.current].SeriesID);
      const fromIdx = Math.min(lastRowIndex.current, index);
      const toIdx = Math.max(lastRowIndex.current, index);
      setExceptions((draft) => {
        for (let idx = fromIdx; idx <= toIdx; idx += 1) {
          const id = series[idx].SeriesID;
          const currentIsSelected = defaultSelected ? !draft.has(id) : draft.has(id);
          if (currentIsSelected !== anchorIsSelected) {
            if (draft.has(id)) draft.delete(id);
            else draft.add(id);
          }
        }
      });
    } else {
      onRowSelect?.(seriesId);
    }
    lastRowIndex.current = index;
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 200;
    if (nearBottom && seriesQuery.hasNextPage && !seriesQuery.isFetchingNextPage) {
      seriesQuery.fetchNextPage().catch(console.error);
    }
  };

  if (!seriesQuery.isSuccess) {
    return (
      <div className="flex h-64 items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={4} spin />
      </div>
    );
  }

  if (seriesCount === 0 && !search) {
    return (
      <div className="flex h-64 items-center justify-center text-lg font-semibold">
        No series with multiple releases!
      </div>
    );
  }

  if (seriesCount === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-lg font-semibold">
        No series match your search.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto" onScroll={handleScroll}>
      {series.map((ser, idx) => (
        <SeriesRow
          key={ser.SeriesID}
          series={ser}
          index={idx}
          autoDeleteMode={autoDeleteMode}
          isSelected={computeIsSelected(ser.SeriesID)}
          onDetailOpen={() => onSeriesDetailOpen(ser.SeriesID)}
          onRowClick={(event, index) => handleRowClick(event, index, ser.SeriesID)}
          onToggle={() => onRowSelect?.(ser.SeriesID)}
        />
      ))}
      {seriesQuery.isFetchingNextPage && (
        <div className="flex justify-center py-4 text-panel-text-primary">
          <Icon path={mdiLoading} size={1.5} spin />
        </div>
      )}
    </div>
  );
};

export default MultipleReleasesSeriesList;
