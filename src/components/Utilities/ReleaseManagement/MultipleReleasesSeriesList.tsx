import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce } from 'lodash';

import { Badge } from '@/components/Badge';
import ShokoIcon from '@/components/ShokoIcon';
import { useMultipleReleaseSeriesQuery } from '@/core/react-query/release-management/queries';
import { handleShiftSelect } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';

import type { SeriesWithCandidatesType } from '@/core/types/api/release-management';

type Props = {
  allSelected: boolean;
  autoDeleteMode: boolean;
  setSelectedSeries: (series: number[]) => void;
  setSeriesCount: (count: number) => void;
};

const SeriesRow = ({
  autoDeleteMode,
  selected,
  series,
}: {
  series: SeriesWithCandidatesType;
  autoDeleteMode: boolean;
  selected: boolean;
}) => {
  const primary = series.Candidates[0];

  return (
    <>
      <div
        className={cx(
          'shrink-0 overflow-hidden text-panel-icon-action transition-all',
          autoDeleteMode ? 'max-w-10' : 'max-w-0 opacity-0',
        )}
      >
        <Icon
          path={selected ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline}
          size={1}
        />
      </div>

      <div className="flex w-full min-w-0 flex-col gap-y-0.5">
        <div className="flex items-center gap-x-2">
          <div
            className="truncate font-semibold"
            data-tooltip-content={series.SeriesTitle}
            data-tooltip-id="tooltip"
          >
            {series.SeriesTitle}
          </div>

          <a
            href={`https://anidb.net/anime/${series.AnidbAnimeID}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-semibold text-panel-text-primary"
            aria-label="Open AniDB series page"
            onClick={event => event.stopPropagation()}
          >
            <div className="metadata-link-icon AniDB" />
            {series.AnidbAnimeID}
            <Icon path={mdiOpenInNew} size={0.6667} />
          </a>

          <Link
            to={`/webui/collection/series/${series.SeriesID}`}
            className="shrink-0 text-panel-text-primary"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex items-center gap-1 font-semibold">
              <ShokoIcon className="size-6" />
              {series.SeriesID}
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={0.6667} />
            </div>
          </Link>

          {series.IsAiring && (
            <Badge className="ml-auto bg-panel-text-warning text-button-primary-text">
              Airing
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-0.5 opacity-80">
          <div>
            <span className="font-semibold text-panel-text-important">{series.Candidates.length}</span>
            {series.Candidates.length === 1 ? ' candidate' : ' candidates'}
          </div>

          {primary && (
            <div>
              Primary:&nbsp;
              {primary.Name}
            </div>
          )}

          {series.FilesToAutoDeleteCount > 0
            ? (
              <div>
                <span className="font-semibold text-panel-text-danger">{series.FilesToAutoDeleteCount}</span>{' '}
                {series.FilesToAutoDeleteCount === 1 ? 'file' : 'files'} to auto-delete
              </div>
            )
            : <div>No auto-delete available</div>}
        </div>
      </div>
    </>
  );
};

const MultipleReleasesSeriesList = ({
  allSelected,
  autoDeleteMode,
  setSelectedSeries,
  setSeriesCount,
}: Props) => {
  const navigate = useNavigateVoid();
  const [searchParams] = useSearchParams();

  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';
  const includeVariations = searchParams.get('includeVariations') === 'true';

  const { fetchNextPage, ...seriesQuery } = useMultipleReleaseSeriesQuery({
    onlyFinishedSeries,
    includeVariations,
    onlyWithRedundant: autoDeleteMode,
    search: searchParams.get('search') ?? undefined,
    pageSize: 25,
  });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  useEffect(() => {
    setSeriesCount(seriesCount);
  }, [seriesCount, setSeriesCount]);

  const { handleRowSelect, rowSelection, selectedRows, setRowSelection } = useRowSelection(series);

  const lastRowIndex = useRef<number>(undefined);
  const handleRowClick = (event: React.MouseEvent, index: number) => {
    if (!autoDeleteMode) {
      navigate(
        `${series[index].SeriesID.toString()}?tab=candidates&includeVariations=${
          searchParams.get('includeVariations') ?? 'true'
        }`,
      );
      return;
    }

    if (!rowSelection || !handleRowSelect) return;
    handleShiftSelect({ event, handleRowSelect, index, lastRowIndex, rowSelection, rows: series, setRowSelection });
  };

  useEffect(() => {
    setSelectedSeries(selectedRows.map(item => item.SeriesID));
  }, [selectedRows, setSelectedSeries]);

  useEffect(() => {
    setRowSelection({});
  }, [allSelected, setRowSelection]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: seriesCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 80,
    overscan: 10,
    gap: 4,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () => debounce(() => fetchNextPage().catch(console.error), 100),
    [fetchNextPage],
  );

  if (!seriesQuery.isSuccess) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={4} spin />
      </div>
    );
  }

  if (seriesCount === 0 && !searchParams.get('search')) {
    return (
      <div className="flex grow items-center justify-center text-lg font-semibold">
        No series with multiple releases!
      </div>
    );
  }

  if (seriesCount === 0) {
    return (
      <div className="flex grow items-center justify-center text-lg font-semibold">
        No series match your search.
      </div>
    );
  }

  return (
    <div className="flex grow flex-col rounded-md border border-panel-border bg-panel-background px-4 py-6">
      <div className="h-0 grow overflow-y-auto pr-4" ref={scrollRef}>
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((virtualItem) => {
            const { index, key, size, start } = virtualItem;
            const item = series[index];

            if (!item) {
              if (!seriesQuery.isFetchingNextPage) fetchNextPageDebounced()?.catch(console.error);

              return (
                <div
                  key={`loading-${key}`}
                  className={cx(
                    'absolute top-0 left-0 flex w-full items-center justify-center rounded-lg border border-panel-border text-panel-text-primary',
                    index % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
                  )}
                  style={{ transform: `translateY(${start}px)`, height: size }}
                  data-index={index}
                  ref={virtualizer.measureElement}
                >
                  <Icon path={mdiLoading} size={1.5} spin />
                </div>
              );
            }

            // rowSelection acts as an exception set in auto-delete mode:
            //   allSelected=true  -> entries are deselected rows -> allSelected !== true  -> false (not selected)
            //   allSelected=false -> entries are selected rows   -> false !== true        -> true  (selected)
            const selected = autoDeleteMode && (allSelected !== (rowSelection[item.SeriesID] ?? false));

            return (
              <div
                key={key}
                className={cx(
                  'absolute top-0 left-0 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-panel-border p-4 text-sm transition-colors',
                  index % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
                  selected && 'bg-panel-background-selected-row',
                )}
                style={{ transform: `translateY(${start}px)` }}
                data-index={index}
                ref={virtualizer.measureElement}
                onClick={event => handleRowClick(event, index)}
              >
                <SeriesRow
                  series={item}
                  autoDeleteMode={autoDeleteMode}
                  selected={selected}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MultipleReleasesSeriesList;
