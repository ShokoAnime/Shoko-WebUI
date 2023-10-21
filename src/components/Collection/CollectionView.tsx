import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import useMeasure from 'react-use-measure';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce } from 'lodash';

import ListViewItem from '@/components/Collection/ListViewItem';
import PosterViewItem from '@/components/Collection/PosterViewItem';
import { useLazyGetGroupSeriesQuery, useLazyGetGroupsQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { useLazyGetGroupViewQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { SeriesType } from '@/core/types/api/series';

type Props = {
  mode: string;
  setGroupTotal: (total: number) => void;
  setTimelineSeries: (series: SeriesType[]) => void;
  type: 'collection' | 'group';
  isSidebarOpen: boolean;
};

const defaultPageSize = 50;

export const posterItemSize = {
  width: 209,
  height: 363,
  gap: 16,
};

export const listItemSize = {
  width: 907,
  height: 328,
  widthAlt: 682,
  gap: 32,
};

const CollectionView = ({ isSidebarOpen, mode, setGroupTotal, setTimelineSeries, type }: Props) => {
  const { filterId, groupId } = useParams();

  const settingsQuery = useGetSettingsQuery();
  const settings = useMemo(() => settingsQuery?.data ?? initialSettings, [settingsQuery]);
  const { showRandomPoster: showRandomPosterGrid } = settings.WebUI_Settings.collection.poster;
  const { showRandomPoster: showRandomPosterList } = settings.WebUI_Settings.collection.list;
  const showRandomPoster = useMemo(
    () => (mode === 'poster' ? showRandomPosterGrid : showRandomPosterList),
    [mode, showRandomPosterGrid, showRandomPosterList],
  );

  const [itemWidth, itemHeight, itemGap] = useMemo(() => {
    if (mode === 'poster') return [posterItemSize.width, posterItemSize.height, posterItemSize.gap];
    return [
      (groupId || isSidebarOpen) ? listItemSize.widthAlt : listItemSize.width,
      listItemSize.height,
      listItemSize.gap,
    ];
  }, [isSidebarOpen, mode, groupId]);

  const [fetchingPage, setFetchingPage] = useState(false);

  const [fetchGroups, groupsData] = useLazyGetGroupsQuery();
  const [fetchSeries, seriesData] = useLazyGetGroupSeriesQuery();

  const pages = useMemo(
    () => (type === 'collection' ? groupsData.data?.pages : seriesData.data?.pages) ?? {},
    [groupsData, seriesData, type],
  );
  const total = (type === 'collection' ? groupsData.data?.total : seriesData.data?.total) ?? 0;

  const [fetchGroupExtras, groupExtrasData] = useLazyGetGroupViewQuery();
  const groupExtras = groupExtrasData.data ?? [];

  useEffect(() => {
    setGroupTotal(total);
    if (type === 'group' && pages[1]) {
      setTimelineSeries(pages[1] as SeriesType[]);
    }
  }, [total, setGroupTotal, type, pages, setTimelineSeries]);

  // 999 to make it effectively infinite since Group/{id}/Series is not paginated
  const pageSize = useMemo(() => (type === 'collection' ? defaultPageSize : 999), [type]);

  const fetchPage = useMemo(() =>
    debounce((page: number) => {
      if (type === 'collection') {
        fetchGroups({ page, pageSize, filterId: filterId ?? '0', randomImages: showRandomPoster }).then(
          (result) => {
            if (!result.data) return;

            const ids = result.data.pages[page].map(group => group.IDs.ID);
            fetchGroupExtras({
              GroupIDs: ids,
              TagFilter: 128,
              TagLimit: 20,
            }).then().catch(error => console.error(error));
          },
        ).catch(error => console.error(error)).finally(() => setFetchingPage(false));
      } else {
        fetchSeries({ groupId, randomImages: showRandomPoster }).then().catch(error => console.error(error));
      }
    }, 200), [filterId, fetchGroups, fetchGroupExtras, fetchSeries, groupId, pageSize, showRandomPoster, type]);

  useEffect(() => {
    fetchPage.cancel();
    setFetchingPage(false);

    fetchPage(1);

    return () => fetchPage.cancel();
  }, [filterId, fetchPage]);

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const [gridContainerRef, gridContainerBounds] = useMeasure();

  const itemsPerRow = Math.max(1, Math.floor(gridContainerBounds.width / itemWidth));
  const count = useMemo(() => Math.ceil(total / itemsPerRow), [total, itemsPerRow]);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight + itemGap,
    overscan: 2,
  });

  if (total === 0) {
    return (
      <div
        className={cx(
          'flex grow rounded-md items-center font-semibold justify-center',
          mode === 'poster' && 'px-6 py-8 bg-panel-background border-panel-border border',
        )}
      >
        {groupsData.isUninitialized || groupsData.isLoading
          ? <Icon path={mdiLoading} size={3} className="text-panel-text-primary" spin />
          : 'No series/groups available!'}
      </div>
    );
  }

  return (
    <div
      className={cx(
        'flex grow rounded-md',
        mode === 'poster' && 'px-6 py-8 bg-panel-background border-panel-border border',
      )}
    >
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }} ref={gridContainerRef}>
        {/* Each row is considered a virtual item here instead of each group */}
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const { index } = virtualRow;

          const items: React.ReactNode[] = [];
          // index of the first group in the current row
          // eg., row 2 (index = 1) at 1080p (itemsPerRow = 8)
          // will have fromIndex as 8, meaning first group in row 2 is 8th in the group list
          const fromIndex = index * itemsPerRow;
          // index of the last group in the current row + 1
          // same eg. as above, this will 16
          const toIndex = fromIndex + itemsPerRow;

          const neededPage1 = Math.ceil((fromIndex + 1) / pageSize);
          const neededPage2 = Math.ceil(toIndex / pageSize);

          const groupList1 = pages[neededPage1];
          const groupList2 = pages[neededPage2];

          if (groupList1 === undefined && !fetchingPage) {
            setFetchingPage(true);
            fetchPage(neededPage1);
          }

          if (groupList2 === undefined && !fetchingPage) {
            setFetchingPage(true);
            fetchPage(neededPage2);
          }

          // Here, i will be the actual index of the group in group list
          for (let i = fromIndex; i < toIndex; i += 1) {
            const neededPage = Math.ceil((i + 1) / pageSize);
            const relativeIndex = i % pageSize;
            const groupList = pages[neededPage];

            const item = groupList !== undefined ? groupList[relativeIndex] : undefined;

            // Placeholder to solve formatting issues.
            // Used to fill the empty "slots" in the last row
            const isPlaceholder = i > total - 1;

            if (isPlaceholder) {
              items.push(
                <div
                  key={`placeholder-${i}`}
                  style={{
                    width: `${itemWidth / 16}rem`,
                  }}
                />,
              );
            } else if (item) {
              items.push(
                mode === 'poster'
                  ? <PosterViewItem item={item} key={`group-${item.IDs.ID}`} isSeries={type === 'group'} />
                  : (
                    <ListViewItem
                      item={item}
                      mainSeries={groupExtras.find(extra => extra.ID === item.IDs.ID)}
                      key={`group-${item.IDs.ID}`}
                      isSeries={type === 'group'}
                      isSidebarOpen={isSidebarOpen}
                    />
                  ),
              );
            } else {
              items.push(
                <div
                  className="flex shrink-0 items-center justify-center rounded-md border border-panel-border text-panel-text-primary"
                  key={`loading-${i}`}
                  style={{
                    width: `${itemWidth / 16}rem`,
                  }}
                >
                  <Icon path={mdiLoading} spin size={3} />
                </div>,
              );
            }
          }

          return (
            <div
              className={cx(
                'absolute top-0 left-0 w-full flex items-center justify-center last:pb-0',
                mode === 'poster'
                  ? 'gap-x-4 pb-4'
                  : 'gap-x-8 pb-8',
              )}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
            >
              {items}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionView;
