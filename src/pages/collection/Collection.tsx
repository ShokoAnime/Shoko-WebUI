import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
  mdiCogOutline,
  mdiFilterMenuOutline,
  mdiFilterOutline,
  mdiFormatListText,
  mdiMagnify,
  mdiViewGridOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { cloneDeep, toNumber } from 'lodash';
import { useImmer } from 'use-immer';
import { useDebounce, useToggle } from 'usehooks-ts';

import CollectionTitle from '@/components/Collection/CollectionTitle';
import CollectionView from '@/components/Collection/CollectionView';
import DisplaySettingsModal from '@/components/Collection/DisplaySettingsModal';
import TimelineSidebar from '@/components/Collection/TimelineSidebar';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import Input from '@/components/Input/Input';
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
import { useFlattenListResult } from '@/hooks/useFlattenListResult';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { FilterCondition, FilterType } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';
import type { WebuiGroupExtra } from '@/core/types/api/webui';

const getFilter = (query: string, filterCondition?: FilterCondition, isSeries = true): FilterType => {
  let finalCondition: FilterCondition | undefined;
  if (query) {
    const searchCondition: FilterCondition = {
      Type: 'StringFuzzyMatches',
      Left: {
        Type: 'NameSelector',
      },
      Parameter: query,
    };

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
        ApplyAtSeriesLevel: isSeries,
        Expression: finalCondition,
      }
      : {}
  );
};

const OptionButton = ({ icon, onClick }) => (
  <div
    className="cursor-pointer rounded border border-panel-border bg-button-secondary px-5 py-2 drop-shadow-md"
    onClick={onClick}
  >
    <Icon path={icon} size={1} />
  </div>
);

function Collection() {
  const { filterId, groupId } = useParams();
  const isSeries = useMemo(() => !!groupId, [groupId]);

  const filterQuery = useFilterQuery(toNumber(filterId!), !!filterId);
  const groupQuery = useGroupQuery(toNumber(groupId!), isSeries);
  const subsectionName = isSeries ? groupQuery?.data?.Name : filterId && filterQuery?.data?.Name;

  const settingsQuery = useSettingsQuery();
  const settings = useMemo(() => settingsQuery?.data ?? initialSettings, [settingsQuery]);
  const viewSetting = settings.WebUI_Settings.collection.view;
  const { showRandomPoster: showRandomPosterGrid } = settings.WebUI_Settings.collection.poster;
  const { showRandomPoster: showRandomPosterList } = settings.WebUI_Settings.collection.list;

  const [mode, setMode] = useState<'poster' | 'list'>('poster');
  const [showFilterSidebar, toggleFilterSidebar] = useToggle(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDisplaySettingsModal, setShowDisplaySettingsModal] = useState(false);
  const [timelineSeries, setTimelineSeries] = useState<SeriesType[]>([]);

  const [groupSearch, setGroupSearch] = useState('');
  const debouncedGroupSearch = useDebounce(groupSearch, 200);

  const [seriesSearch, setSeriesSearch] = useState('');
  const debouncedSeriesSearch = useDebounce(seriesSearch, 200);

  const showRandomPoster = useMemo(
    () => (mode === 'poster' ? showRandomPosterGrid : showRandomPosterList),
    [mode, showRandomPosterGrid, showRandomPosterList],
  );
  const { mutate: patchSettings } = usePatchSettingsMutation();

  useEffect(() => {
    setMode(viewSetting);
  }, [viewSetting]);

  useEffect(() => {
    setGroupSearch('');
    setSeriesSearch('');
  }, [isSeries]);

  const groupsQuery = useFilteredGroupsInfiniteQuery({
    pageSize: 50,
    randomImages: showRandomPoster,
    filterCriteria: getFilter(debouncedGroupSearch, filterId ? filterQuery.data?.Expression : undefined, false),
  });
  const [groups, groupsTotal] = useFlattenListResult(groupsQuery.data);
  const lastPageIds = useMemo(
    () => groupsQuery.data?.pages.toReversed()[0].List.map(group => group.IDs.ID) ?? [],
    [groupsQuery],
  );

  const seriesQuery = useFilteredGroupSeries(
    toNumber(groupId!),
    {
      filterCriteria: getFilter(debouncedSeriesSearch),
      randomImages: showRandomPoster,
      includeDataFrom: ['AniDB'],
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
  }, [debouncedSeriesSearch, isSeries, seriesQuery]);

  // Couldn't find a way to do it in the query itself like we had in RTKQ, so doing it here
  const [groupExtras, setGroupExtras] = useImmer<WebuiGroupExtra[]>([]);
  const groupExtrasQuery = useGroupViewQuery(
    {
      GroupIDs: lastPageIds,
      TagFilter: 128,
      TagLimit: 20,
    },
    viewSetting === 'list' && lastPageIds.length > 0,
  );

  useEffect(() => {
    if (!groupExtrasQuery.isSuccess) return;
    setGroupExtras(immerState => [...immerState, ...groupExtrasQuery.data]);
  }, [groupExtrasQuery.data, groupExtrasQuery.isSuccess, setGroupExtras]);

  const toggleMode = async () => {
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
    patchSettings({ oldSettings: settings, newSettings });
  };

  return (
    <>
      <div className="flex grow flex-col gap-y-8">
        <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background p-8">
          <CollectionTitle
            // eslint-disable-next-line no-nested-ternary
            count={(total === 0 && isFetching) ? -1 : (isSeries ? total : groupsTotal)}
            filterOrGroup={subsectionName}
            searchQuery={isSeries ? debouncedSeriesSearch : debouncedGroupSearch}
          />
          <div className="flex gap-x-2">
            <Input
              id="search"
              type="text"
              placeholder="Search..."
              startIcon={mdiMagnify}
              value={isSeries ? seriesSearch : groupSearch}
              onChange={e => (isSeries ? setSeriesSearch(e.target.value) : setGroupSearch(e.target.value))}
            />
            {!isSeries && (
              <>
                <OptionButton onClick={() => setShowFilterModal(true)} icon={mdiFilterMenuOutline} />
                <OptionButton onClick={toggleFilterSidebar} icon={mdiFilterOutline} />
              </>
            )}
            <OptionButton onClick={toggleMode} icon={mode === 'poster' ? mdiFormatListText : mdiViewGridOutline} />
            <OptionButton onClick={() => setShowDisplaySettingsModal(true)} icon={mdiCogOutline} />
          </div>
        </div>
        <div className="flex grow">
          <CollectionView
            groupExtras={groupExtras}
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
              'flex items-start overflow-hidden transition-all',
              (!isSeries && showFilterSidebar) ? 'w-[26.125rem] opacity-100' : 'w-0 opacity-0',
            )}
          >
            <div className="ml-8 line-clamp-1 flex grow items-center justify-center rounded border border-panel-border bg-panel-background p-8">
              Filter sidebar
            </div>
          </div>
          {isSeries && <TimelineSidebar series={timelineSeries} isFetching={seriesQuery.isLoading} />}
        </div>
      </div>
      <FiltersModal show={showFilterModal} onClose={() => setShowFilterModal(false)} />
      <DisplaySettingsModal show={showDisplaySettingsModal} onClose={() => setShowDisplaySettingsModal(false)} />
    </>
  );
}

export default Collection;
