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
import { cloneDeep, debounce } from 'lodash';
import { useDebounce, useToggle } from 'usehooks-ts';

import CollectionTitle from '@/components/Collection/CollectionTitle';
import CollectionView from '@/components/Collection/CollectionView';
import DisplaySettingsModal from '@/components/Collection/DisplaySettingsModal';
import TimelineSidebar from '@/components/Collection/TimelineSidebar';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import Input from '@/components/Input/Input';
import buildFilter from '@/core/buildFilter';
import { useGetGroupQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import {
  useGetFilterQuery,
  useGetFilteredGroupSeriesQuery,
  useGetFilteredGroupsInfiniteQuery,
} from '@/core/rtkQuery/splitV3Api/filterApi';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { useLazyGetGroupViewInfiniteQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { FilterCondition, FilterType } from '@/core/types/api/filter';
import type { SeriesType } from '@/core/types/api/series';

const defaultPageSize = 50;

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

  const filterQuery = useGetFilterQuery({ filterId: filterId! }, { skip: !filterId });
  const groupData = useGetGroupQuery({ groupId: groupId! }, { skip: !isSeries });
  const subsectionName = isSeries ? groupData?.data?.Name : filterId && filterQuery?.data?.Name;

  const settingsQuery = useGetSettingsQuery();
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

  const [currentPage, setCurrentPage] = useState(1);
  const setCurrentPageDebounced = useMemo(
    () => debounce((page: number) => setCurrentPage(page), 200),
    [],
  );

  const showRandomPoster = useMemo(
    () => (mode === 'poster' ? showRandomPosterGrid : showRandomPosterList),
    [mode, showRandomPosterGrid, showRandomPosterList],
  );
  const [patchSettings] = usePatchSettingsMutation();

  useEffect(() => {
    setMode(viewSetting);
  }, [viewSetting]);

  useEffect(() => {
    setGroupSearch('');
    setSeriesSearch('');
  }, [isSeries]);

  const toggleMode = async () => {
    const newMode = mode === 'list' ? 'poster' : 'list';
    // Optimistically update view mode to reduce lag without waiting for settings refetch.
    setMode(newMode);
    const newSettings = cloneDeep(settings);
    newSettings.WebUI_Settings.collection.view = newMode;
    patchSettings({ oldSettings: settings, newSettings }).catch(console.error);
  };

  // Q: Why is { skip: isSeries } not added here?
  // A: When skip parameter changes while navigating to a group and back, the query is refired even if the data already
  // exists causing flickers in the UI.
  const groupsQuery = useGetFilteredGroupsInfiniteQuery({
    page: currentPage,
    pageSize: defaultPageSize,
    randomImages: showRandomPoster,
    filterCriteria: getFilter(debouncedGroupSearch, filterId ? filterQuery.data?.Expression : undefined, false),
  });

  const seriesQuery = useGetFilteredGroupSeriesQuery(
    {
      groupId: groupId!,
      randomImages: showRandomPoster,
      filterCriteria: getFilter(debouncedSeriesSearch),
    },
    { skip: !isSeries },
  );

  const isFetching = useMemo(
    () => (isSeries ? seriesQuery.isFetching : groupsQuery.isFetching),
    [isSeries, seriesQuery.isFetching, groupsQuery.isFetching],
  );
  const [pages, total] = useMemo(
    () => {
      const data = isSeries ? seriesQuery.currentData : groupsQuery.currentData;
      return [data?.pages ?? {}, data?.total ?? 0];
    },
    [isSeries, groupsQuery.currentData, seriesQuery.currentData],
  );

  useEffect(() => {
    if (!isSeries || debouncedSeriesSearch) return;
    setTimelineSeries((pages[1] ?? []) as SeriesType[]);
  }, [debouncedSeriesSearch, isSeries, pages]);

  const [fetchGroupExtras, groupExtrasData] = useLazyGetGroupViewInfiniteQuery();
  const groupExtras = groupExtrasData.currentData ?? [];

  useEffect(() => {
    const ids = groupsQuery.data?.pages[currentPage]?.map(group => group.IDs.ID) ?? [];
    if (!ids.length) return;
    fetchGroupExtras({
      GroupIDs: ids,
      TagFilter: 128,
      TagLimit: 20,
    }).then().catch(error => console.error(error));
  }, [currentPage, fetchGroupExtras, groupsQuery]);

  // This can be inside CollectionView but then defaultPageSize has to be passed to it so same either way
  // 999 to make it effectively infinite since Group/{id}/Series is not paginated
  const pageSize = useMemo(() => (groupId ? 999 : defaultPageSize), [groupId]);

  return (
    <>
      <div className="flex grow flex-col gap-y-8">
        <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background p-8">
          <CollectionTitle
            count={(total === 0 && isFetching) ? -1 : total}
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
            isFetching={isFetching}
            isSeries={isSeries}
            isSidebarOpen={showFilterSidebar}
            mode={mode}
            pageSize={pageSize}
            pages={pages}
            setCurrentPage={setCurrentPageDebounced}
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
