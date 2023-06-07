import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';
import Fuse from 'fuse.js';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { Icon } from '@mdi/react';
import {
  mdiChevronDown,
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiLinkOff,
  mdiLoading,
  mdiMagnify,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import moment from 'moment/moment';
import AnimateHeight from 'react-animate-height';

import TransitionDiv from '@/components/TransitionDiv';
import {
  useGetSeriesWithManuallyLinkedFilesQuery,
  useLazyGetSeriesEpisodesQuery,
  useLazyGetSeriesFilesQuery,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import { SeriesType } from '@/core/types/api/series';
import { ListResultType } from '@/core/types/api';
import { splitV3Api } from '@/core/rtkQuery/splitV3Api';
import { useDeleteFileLinkMutation, usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import toast from '@/components/Toast';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Input from '@/components/Input/Input';
import Title from '@/components/Utilities/Unrecognized/Title';
import ManuallyLinkedFilesRow from '@/components/Utilities/Unrecognized/ManuallyLinkedFilesRow';
import { useImmer } from 'use-immer';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import Button from '@/components/Input/Button';

const SeriesRow = (
  { row, virtualRow, selectedFiles, updateSelectedFiles }: { row: SeriesType, virtualRow: VirtualItem, selectedFiles: { [_: number]: boolean }, updateSelectedFiles: (fileIds: number[], select?: boolean) => void },
) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [getFiles, filesResult] = useLazyGetSeriesFilesQuery();
  const [getEpisodes, episodesResult] = useLazyGetSeriesEpisodesQuery();

  const handleExpand = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    setLoading(true);
    await getFiles({ seriesId: row.IDs.ID, isManuallyLinked: true, includeXRefs: true }, true);
    await getEpisodes({ pageSize: 0, seriesID: row.IDs.ID, includeMissing: 'true', includeDataFrom: ['AniDB'] }, true);
    setLoading(false);
    setOpen(true);
  };

  return (
    <div className={cx(virtualRow.index % 2 === 0 ? 'bg-background-alt' : 'bg-background', 'relative py-4 text-left')}>
      <div
        className="flex cursor-pointer px-8"
        onClick={handleExpand}
      >
        <div className="grow line-clamp-1">{row.Name}</div>
        <a href={`https://anidb.net/anime/${row.IDs.AniDB}`} rel="noopener noreferrer" target="_blank" className="text-highlight-1 font-semibold w-24 flex gap-x-2" onClick={e => e.stopPropagation()}>
          {row.IDs.AniDB}
          <Icon path={mdiOpenInNew} size={1} />
        </a>
        <div className="w-32">{row.Sizes.FileSources.Unknown} files</div>
        <div className="w-64">{moment(row.Created).format('MMMM DD YYYY, HH:mm')}</div>
        <Icon path={loading ? mdiLoading : mdiChevronDown} spin={loading} size={1} rotate={open ? 180 : 0} className="transition-transform" />
      </div>
      <AnimateHeight height={open ? 'auto' : 0}>
        <ManuallyLinkedFilesRow
          seriesId={row.IDs.ID}
          updateSelectedFiles={updateSelectedFiles}
          selectedFiles={selectedFiles}
          files={filesResult?.data ?? []}
          episodes={episodesResult?.data?.List ?? []}
        />
      </AnimateHeight>
    </div>
  );
};

const Menu = ({ selectedFiles, setSelectedFiles }: { selectedFiles: { [_: number]: boolean }, setSelectedFiles: (files: { [_: number]: boolean }) => void }) => {
  const dispatch = useDispatch();

  const [rescanFile] = usePostFileRescanMutation();

  const refreshData = () => {
    dispatch(splitV3Api.util.invalidateTags(['UtilitiesRefresh']));
    setSelectedFiles({});
  };

  const rescanFiles = () => {
    const fileIds = Object.keys(selectedFiles).map(parseInt);

    let failedFiles = 0;
    fileIds.forEach((fileId) => {
      rescanFile(fileId).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rescan failed for ${failedFiles} files!`);
    if (failedFiles !== fileIds.length) toast.success(`Rescanning ${fileIds.length} files!`);
  };

  return (
    <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative">
      <MenuButton onClick={refreshData} icon={mdiRefresh} name="Refresh" />
      <TransitionDiv className="flex grow gap-x-4 ml-4" show={Object.keys(selectedFiles).length !== 0}>
        <MenuButton onClick={rescanFiles} icon={mdiDatabaseSearchOutline} name="Rescan" />
        <MenuButton onClick={() => setSelectedFiles({})} icon={mdiCloseCircleOutline} name="Cancel Selection" highlight />
      </TransitionDiv>
      <span className="text-highlight-2 ml-auto">{Object.keys(selectedFiles).length}&nbsp;</span>Files Selected
    </div>
  );
};

function ManuallyLinkedTab() {
  const dispatch = useDispatch();

  const [unlinkFile] = useDeleteFileLinkMutation();

  const seriesQuery = useGetSeriesWithManuallyLinkedFilesQuery({ pageSize: 0 });
  const series: ListResultType<Array<SeriesType>> = seriesQuery.data ?? { Total: 0, List: [] };

  const [searchQuery, setSearchQuery] = useState('');
  const filteredSeries = useMemo(() => {
    if (searchQuery === '') return series.List;
    const fuse = new Fuse(series.List, { isCaseSensitive: true, shouldSort: true, keys: ['Name'] });
    return fuse.search(searchQuery).map(result => result.item);
  }, [series.List, searchQuery]);

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredSeries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const [selectedFiles, setSelectedFiles] = useImmer<{ [key: number]: boolean }>({});
  const updateSelectedFiles = useCallback((fileIds: number[], select = true) => setSelectedFiles((selectedFilesState) => {
    fileIds.forEach((fileId) => {
      // eslint-disable-next-line no-param-reassign
      selectedFilesState[fileId] = select;
    });
  }), [setSelectedFiles]);

  const unlinkFiles = () => {
    const fileIds = Object.keys(selectedFiles).map(parseInt);

    let failedFiles = 0;
    fileIds.forEach((fileId) => {
      unlinkFile(fileId).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error ignoring ${failedFiles} files!`);
    if (failedFiles !== fileIds.length) toast.success(`${fileIds.length} files unlinked!`);

    dispatch(splitV3Api.util.invalidateTags(['UtilitiesRefresh']));
    setSelectedFiles({});
  };

  return (
    <TransitionDiv className="flex flex-col grow gap-y-8 overflow-y-auto">

      <div>
        <ShokoPanel title={<Title />} options={<ItemCount filesCount={series.Total} series />}>
          <div className="flex items-center gap-x-3">
            <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} inputClassName="px-4 py-3" />
            <Menu selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
            <TransitionDiv show={Object.keys(selectedFiles).length !== 0} className="flex gap-x-3">
              <Button
                className="px-4 py-3 bg-highlight-1 flex gap-x-2.5 font-semibold"
                onClick={unlinkFiles}
              >
                <Icon path={mdiLinkOff} size={0.8333} />
                Unlink
              </Button>
            </TransitionDiv>
          </div>
        </ShokoPanel>
      </div>

      <div className="flex grow overflow-y-auto rounded-md bg-background-alt border border-background-border p-8">
        {seriesQuery.isFetching ? (
          <div className="flex grow justify-center items-center">
            <Icon path={mdiLoading} size={4} className="text-highlight-1" spin />
          </div>
        ) : series.Total > 0 ? (
          <div className="flex flex-col w-full overflow-y-auto">
            <div className="flex px-6 py-4 bg-background font-semibold sticky top-0 z-[1] rounded-md border border-background-border">
              <div className="grow">Series</div>
              <div className="w-24">AniDB ID</div>
              <div className="w-32">Link Count</div>
              <div className="w-64">Date Linked</div>
              <div className="w-10" />
            </div>
            <div ref={parentRef} className="grow overflow-y-auto relative">
              <div className="w-full absolute top-0" style={{ height: rowVirtualizer.getTotalSize() }}>
                <div className="w-full absolute top-0 left-0" style={{ transform: `translateY(${virtualItems[0].start}px)` }}>
                  {virtualItems.map((virtualRow) => {
                    const row = filteredSeries[virtualRow.index];
                    return (
                      <div
                        className="border-background-border border rounded-md mt-2"
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                      >
                        <SeriesRow row={row} virtualRow={virtualRow} selectedFiles={selectedFiles} updateSelectedFiles={updateSelectedFiles} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center grow font-semibold">No manually linked file(s)!</div>
        )}
      </div>
    </TransitionDiv>
  );
}

export default ManuallyLinkedTab;
