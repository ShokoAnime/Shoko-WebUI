import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router';
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
import { resetFilter } from '@/core/slices/collection';
import { buildFilter } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { RootState } from '@/core/store';
import type { FilterCondition, FilterType, SortingCriteria } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';

const getFilter = (
  query: string,
  filterConditions: (FilterCondition | undefined)[],
  sortingCriteria?: SortingCriteria,
): FilterType => {
  let finalCondition: FilterCondition | undefined;
  const cleanFilterConditions = filterConditions.filter(condition => !!condition);
  if (query) {
    let searchCondition: FilterCondition = {
      Type: 'AnyContains',
      Left: {
        Type: 'NamesSelector',
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
        ApplyAtSeriesLevel: true,
        Expression: finalCondition,
        Sorting: sortingCriteria ?? { Type: 'Name', IsInverted: false },
      }
      : {}
  );
};

const Collection = () => {
  const { pathname } = useLocation();
  const { filterId, groupId } = useParams();
  const isSeries = useMemo(() => !!groupId, [groupId]);
  const isLiveFilter = useMemo(() => pathname.endsWith('/live'), [pathname]);

  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const [searchParams, setSearchParams] = useSearchParams();
  const [groupSearch, setGroupSearch] = useState(searchParams.get('q') ?? '');
  const [seriesSearch, setSeriesSearch] = useState(searchParams.get('qs') ?? '');
  const setSearch = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;

    if (!query.trim()) {
      setSearchParams({}, { replace: true });
      setGroupSearch('');
      setSeriesSearch('');
      return;
    }

    if (isSeries) {
      setSearchParams({ qs: query }, { replace: true });
      setSeriesSearch(query);
    } else {
      setSearchParams({ q: query }, { replace: true });
      setGroupSearch(query);
    }
  });
  const [debouncedGroupSearch] = useDebounceValue(groupSearch.trim(), 200);
  const [debouncedSeriesSearch] = useDebounceValue(seriesSearch.trim(), 200);

  const activeFilterFromStore = useSelector((state: RootState) => state.collection.activeFilter) as FilterCondition;
  const activeFilter = useMemo(() => {
    if (!filterId) return undefined;
    return activeFilterFromStore;
  }, [activeFilterFromStore, filterId]);
  const filterQuery = useFilterQuery(toNumber(filterId!), !!filterId && !isLiveFilter);
  const groupQuery = useGroupQuery(toNumber(groupId!), isSeries);

  const settings = useSettingsQuery().data;
  const viewSetting = settings.WebUI_Settings.collection.view;
  const { showRandomPoster } = settings.WebUI_Settings.collection.image;

  const [mode, setMode] = useState<'poster' | 'list'>('poster');
  const [showFilterSidebar, toggleFilterSidebar, setShowFilterSidebar] = useToggle();
  const [timelineSeries, setTimelineSeries] = useState<SeriesType[]>([]);

  const handleFilterSidebarToggle = useEventCallback(() => {
    if (!filterId) {
      dispatch(resetFilter());
      navigate('filter/live');
      return;
    }
    toggleFilterSidebar();
  });

  useEffect(() => {
    if (filterId === 'live') setShowFilterSidebar(true);
    if (!filterId) setShowFilterSidebar(false);
  }, [filterId, setShowFilterSidebar]);

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
      ),
    },
    !isSeries && (!filterId || isLiveFilter || (!!filterId && filterQuery.isSuccess)),
  );
  const [groups, groupsTotal] = useFlattenListResult(groupsQuery.data);
  const lastPageIds = useMemo(() => {
    const lastPage = groupsQuery.data?.pages.at(-1);
    if (!lastPage) return [];

    return lastPage.List.map(group => group.IDs.ID);
  }, [groupsQuery.data]);

  const seriesQuery = useFilteredGroupSeries(
    toNumber(groupId!),
    {
      filterCriteria: getFilter(
        debouncedSeriesSearch,
        [activeFilter, filterQuery.data?.Expression],
        filterQuery.data?.Sorting,
      ),
      randomImages: showRandomPoster,
      includeDataFrom: ['AniDB', 'TMDB'],
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
  const item = items[0];

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
    <>
      <title>{`${isSeries ? groupQuery?.data?.Name : 'Collection'} | Shoko`}</title>
      <div className="flex grow flex-col gap-y-6">
        <div className="sticky -top-6 z-10 flex items-center justify-between rounded-lg border border-panel-border bg-panel-background p-6">
          <CollectionTitle
            // eslint-disable-next-line no-nested-ternary
            count={(total === 0 && isFetching) ? -1 : (isSeries ? total : groupsTotal)}
            filterName={filterQuery?.data?.Name}
            groupName={groupQuery?.data?.Name}
            filterActive={!!activeFilter}
            searchQuery={isSeries ? seriesSearch : groupSearch}
          />
          <TitleOptions
            groupSearch={groupSearch}
            isSeries={isSeries}
            item={item}
            mode={mode}
            seriesSearch={seriesSearch}
            setSearch={setSearch}
            toggleFilterSidebar={handleFilterSidebarToggle}
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
              'flex items-start',
              !isSeries && 'transition-all',
              showFilterSidebar
                ? 'w-[28rem] opacity-100'
                : 'w-0 opacity-0 overflow-hidden ',
            )}
          >
            <FilterSidebar />
          </div>
          {isSeries && !showFilterSidebar && (
            <TimelineSidebar series={timelineSeries} isFetching={seriesQuery.isPending} />
          )}
        </div>
        <EditSeriesModal />
        <EditGroupModal />
      </div>
    </>
  );
};

export default Collection;
