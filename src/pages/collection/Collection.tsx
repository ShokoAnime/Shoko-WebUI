import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import cx from 'classnames';
import { cloneDeep, toNumber } from 'lodash';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import CollectionTitle from '@/components/Collection/CollectionTitle';
import CollectionView from '@/components/Collection/CollectionView';
import FilterSidebar from '@/components/Collection/Filter/FilterSidebar';
import EditSeriesModal from '@/components/Collection/Series/EditSeriesModal';
import TimelineSidebar from '@/components/Collection/TimelineSidebar';
import TitleOptions from '@/components/Collection/TitleOptions';
import buildFilter from '@/core/buildFilter';
import {
  useFilterQuery,
  useFilteredGroupSeries,
  useFilteredGroupsInfiniteQuery,
} from '@/core/react-query/filter/queries';
import { useGroupQuery } from '@/core/react-query/group/queries';
import queryClient from '@/core/react-query/queryClient';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useGroupViewQuery } from '@/core/react-query/webui/queries';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { RootState } from '@/core/store';
import type { FilterCondition, FilterType, SortingCriteria } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';

const getFilter = (
  query: string,
  filterCondition?: FilterCondition,
  sortingCriteria?: SortingCriteria,
  isSeriesSearch = true,
): FilterType => {
  let finalCondition: FilterCondition | undefined;
  if (query) {
    let searchCondition: FilterCondition = {
      Type: isSeriesSearch ? 'StringContains' : 'AnyContains',
      Left: {
        Type: isSeriesSearch ? 'NameSelector' : 'NamesSelector',
      },
      Parameter: query,
    };

    if (Number.isFinite(toNumber(query))) {
      searchCondition = {
        Type: 'Or',
        Left: searchCondition,
        Right: {
          Type: 'AnyEquals',
          Left: {
            Type: 'AniDBIDsSelector',
          },
          Parameter: query,
        },
      };
    }

    if (filterCondition) {
      finalCondition = buildFilter([searchCondition, filterCondition]);
    } else {
      finalCondition = buildFilter([searchCondition]);
    }
  } else if (filterCondition) {
    finalCondition = buildFilter([filterCondition]);
  }

  return (
    finalCondition
      ? {
        ApplyAtSeriesLevel: isSeriesSearch,
        Expression: finalCondition,
        Sorting: sortingCriteria ?? { Type: 'Name', IsInverted: false },
      }
      : {}
  );
};

function Collection() {
  const { filterId, groupId } = useParams();
  const isSeries = useMemo(() => !!groupId, [groupId]);

  const activeFilter = useSelector((state: RootState) => state.collection.activeFilter);
  const filterQuery = useFilterQuery(toNumber(filterId!), !!filterId);
  const groupQuery = useGroupQuery(toNumber(groupId!), isSeries);
  const subsectionName = isSeries ? groupQuery?.data?.Name : filterId && filterQuery?.data?.Name;

  const settings = useSettingsQuery().data;
  const viewSetting = settings.WebUI_Settings.collection.view;
  const { showRandomPoster } = settings.WebUI_Settings.collection.image;

  const [mode, setMode] = useState<'poster' | 'list'>('poster');
  const [showFilterSidebar, toggleFilterSidebar] = useToggle(false);
  const [timelineSeries, setTimelineSeries] = useState<SeriesType[]>([]);

  const [groupSearch, setGroupSearch] = useState('');
  const [debouncedGroupSearch] = useDebounceValue(groupSearch, 200);

  const [seriesSearch, setSeriesSearch] = useState('');
  const [debouncedSeriesSearch] = useDebounceValue(seriesSearch, 200);

  const { mutate: patchSettings } = usePatchSettingsMutation();

  useEffect(() => {
    setMode(viewSetting);
  }, [viewSetting]);

  useEffect(() => {
    setGroupSearch('');
    setSeriesSearch('');
  }, [isSeries]);

  const groupFilterCondition = useMemo(() => {
    if (filterId) return filterQuery.data?.Expression;
    if (activeFilter !== null) return activeFilter as FilterCondition;
    return undefined;
  }, [activeFilter, filterId, filterQuery.data?.Expression]);

  const groupsQuery = useFilteredGroupsInfiniteQuery(
    {
      pageSize: 50,
      randomImages: showRandomPoster,
      filterCriteria: getFilter(debouncedGroupSearch, groupFilterCondition, filterQuery.data?.Sorting, false),
    },
    !filterId || (!!filterId && filterQuery.isSuccess),
  );
  const [groups, groupsTotal] = useFlattenListResult(groupsQuery.data);
  const lastPageIds = useMemo(
    () => groupsQuery.data?.pages.toReversed()[0].List.map(group => group.IDs.ID) ?? [],
    [groupsQuery.data],
  );

  const seriesQuery = useFilteredGroupSeries(
    toNumber(groupId!),
    {
      filterCriteria: getFilter(debouncedSeriesSearch, groupFilterCondition, filterQuery.data?.Sorting, true),
      randomImages: showRandomPoster,
      includeDataFrom: ['AniDB'],
      recursive: true,
    },
    isSeries,
  );

  useEffect(() => {
    if (!isSeries) {
      queryClient.resetQueries({
        queryKey: ['filter', 'preview', 'group-series'],
      }).catch(console.error);
    }
  }, [isSeries]);

  useEffect(() => () => {
    queryClient.resetQueries({
      queryKey: ['filter', 'preview', 'groups'],
    }).catch(console.error);
  }, []);

  const isFetching = useMemo(
    () => (isSeries ? seriesQuery.isFetching : groupsQuery.isFetching),
    [isSeries, seriesQuery.isFetching, groupsQuery.isFetching],
  );
  const [items, total] = useMemo(
    () => {
      const data = isSeries ? seriesQuery.data : groups;
      const tempTotal = isSeries ? seriesQuery.data?.length : groupsTotal;
      return [data ?? [], tempTotal ?? 0];
    },
    [groups, groupsTotal, isSeries, seriesQuery.data],
  );

  useEffect(() => {
    if (!isSeries || debouncedSeriesSearch || !seriesQuery.isSuccess) return;
    setTimelineSeries(seriesQuery.data);
  }, [debouncedSeriesSearch, isSeries, seriesQuery.data, seriesQuery.isSuccess]);

  const groupExtras = useGroupViewQuery(
    {
      GroupIDs: lastPageIds,
      TagFilter: 128,
      TagLimit: 20,
    },
    viewSetting === 'list' && lastPageIds.length > 0,
  ).data;

  const toggleMode = useEventCallback(() => {
    if (isFetching) return;

    const newMode = mode === 'list' ? 'poster' : 'list';
    // Optimistically update view mode to reduce lag without waiting for settings refetch.
    setMode(newMode);
    if (newMode === 'list') {
      // If we invalidate instead of resetting, if we had 5 pages loaded in poster view, it will again load 5 pages
      // after invalidation even if we are at the top of the page
      queryClient.resetQueries({ queryKey: ['filter', 'preview', 'groups'] }).catch(console.error);
    }
    const newSettings = cloneDeep(settings);
    newSettings.WebUI_Settings.collection.view = newMode;
    patchSettings({ newSettings });
  });

  return (
    <div className="flex grow flex-col gap-y-6">
      <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background p-6">
        <CollectionTitle
          // eslint-disable-next-line no-nested-ternary
          count={(total === 0 && isFetching) ? -1 : (isSeries ? total : groupsTotal)}
          filterOrGroup={subsectionName}
          searchQuery={isSeries ? debouncedSeriesSearch : debouncedGroupSearch}
        />
        <TitleOptions
          isSeries={isSeries}
          groupSearch={groupSearch}
          mode={mode}
          seriesSearch={seriesSearch}
          setGroupSearch={setGroupSearch}
          setSeriesSearch={setSeriesSearch}
          toggleFilterSidebar={toggleFilterSidebar}
          toggleMode={toggleMode}
        />
      </div>
      <div className="flex grow">
        <CollectionView
          groupExtras={groupExtras ?? []}
          fetchNextPage={groupsQuery.fetchNextPage}
          isFetchingNextPage={groupsQuery.isFetchingNextPage}
          isFetching={isFetching}
          isSeries={isSeries}
          isSidebarOpen={showFilterSidebar}
          items={items}
          mode={mode}
          total={total}
        />
        <div
          className={cx(
            'flex items-start transition-all',
            (!isSeries && showFilterSidebar)
              ? 'w-[28.84rem] opacity-100 overflow-auto '
              : 'w-0 opacity-0 overflow-hidden ',
          )}
        >
          <FilterSidebar />
        </div>
        {isSeries && <TimelineSidebar series={timelineSeries} isFetching={seriesQuery.isPending} />}
      </div>
      <EditSeriesModal />
    </div>
  );
}

export default Collection;
