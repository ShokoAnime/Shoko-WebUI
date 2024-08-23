import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import cx from 'classnames';
import { cloneDeep, toNumber } from 'lodash';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import CollectionTitle from '@/components/Collection/CollectionTitle';
import CollectionView from '@/components/Collection/CollectionView';
import FilterSidebar from '@/components/Collection/Filter/FilterSidebar';
import EditGroupModal from '@/components/Collection/Group/EditGroupModal';
import EditSeriesModal from '@/components/Collection/Series/EditSeriesModal';
import TimelineSidebar from '@/components/Collection/TimelineSidebar';
import TitleOptions from '@/components/Collection/TitleOptions';
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
import { buildFilter } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { RootState } from '@/core/store';
import type { FilterCondition, FilterType, SortingCriteria } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';

const getFilter = (
  query: string,
  filterConditions: (FilterCondition | undefined)[],
  sortingCriteria?: SortingCriteria,
  isSeriesSearch = true,
): FilterType => {
  let finalCondition: FilterCondition | undefined;
  const cleanFilterConditions = filterConditions.filter(condition => !!condition) as FilterCondition[];
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

    if (cleanFilterConditions.length > 0) {
      finalCondition = buildFilter([searchCondition, ...cleanFilterConditions]);
    } else {
      finalCondition = buildFilter([searchCondition]);
    }
  } else if (cleanFilterConditions.length > 0) {
    finalCondition = buildFilter(cleanFilterConditions);
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

  const [searchParams, setSearchParams] = useSearchParams();
  const groupSearch = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const seriesSearch = useMemo(() => searchParams.get('qs') ?? '', [searchParams]);
  const setSearch = (query: string) => {
    if (!query) {
      setSearchParams({}, { replace: true });
      return;
    }
    setSearchParams({ [isSeries ? 'qs' : 'q']: query }, { replace: true });
  };
  const [debouncedGroupSearch] = useDebounceValue(groupSearch, 200);
  const [debouncedSeriesSearch] = useDebounceValue(seriesSearch, 200);

  const activeFilter = useSelector((state: RootState) => state.collection.activeFilter) as FilterCondition;
  const filterQuery = useFilterQuery(toNumber(filterId!), !!filterId);
  const groupQuery = useGroupQuery(toNumber(groupId!), isSeries);
  const subsectionName = isSeries ? groupQuery?.data?.Name : filterId && filterQuery?.data?.Name;

  const settings = useSettingsQuery().data;
  const viewSetting = settings.WebUI_Settings.collection.view;
  const { showRandomPoster } = settings.WebUI_Settings.collection.image;

  const [mode, setMode] = useState<'poster' | 'list'>('poster');
  const [showFilterSidebar, toggleFilterSidebar] = useToggle(false);
  const [timelineSeries, setTimelineSeries] = useState<SeriesType[]>([]);

  const { mutate: patchSettings } = usePatchSettingsMutation();

  useEffect(() => {
    setMode(viewSetting);
  }, [viewSetting]);

  const groupsQuery = useFilteredGroupsInfiniteQuery(
    {
      pageSize: 50,
      randomImages: showRandomPoster,
      filterCriteria: getFilter(
        debouncedGroupSearch,
        [activeFilter, filterQuery.data?.Expression],
        filterQuery.data?.Sorting,
        false,
      ),
    },
    !isSeries && (!filterId || (!!filterId && filterQuery.isSuccess)),
  );
  const [groups, groupsTotal] = useFlattenListResult(groupsQuery.data);
  const lastPageIds = useMemo(
    () => groupsQuery.data?.pages.toReversed()[0].List.map(group => group.IDs.ID) ?? [],
    [groupsQuery.data],
  );

  const seriesQuery = useFilteredGroupSeries(
    toNumber(groupId!),
    {
      filterCriteria: getFilter(
        debouncedSeriesSearch,
        [activeFilter, filterQuery.data?.Expression],
        filterQuery.data?.Sorting,
        true,
      ),
      randomImages: showRandomPoster,
      includeDataFrom: ['AniDB'],
      recursive: true,
      includeMissing: true,
    },
    isSeries,
  );

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
          filterActive={!!activeFilter}
          searchQuery={isSeries ? seriesSearch : groupSearch}
        />
        <TitleOptions
          isSeries={isSeries}
          groupSearch={groupSearch}
          mode={mode}
          seriesSearch={seriesSearch}
          setSearch={setSearch}
          toggleFilterSidebar={toggleFilterSidebar}
          toggleMode={toggleMode}
        />
      </div>
      <div className="flex grow">
        <CollectionView
          groupExtras={groupExtras ?? []}
          fetchNextPage={() => groupsQuery.fetchNextPage()}
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
      <EditGroupModal />
    </div>
  );
}

export default Collection;
