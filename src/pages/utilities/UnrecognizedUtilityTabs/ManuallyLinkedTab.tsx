import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';
import Fuse from 'fuse.js';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Icon } from '@mdi/react';
import {
  mdiChevronDown,
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiRestart,
} from '@mdi/js';
import { Disclosure } from '@headlessui/react';

import TransitionDiv from '@/components/TransitionDiv';
import Button from '@/components/Input/Button';
import { useGetSeriesWithManuallyLinkedFilesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { SeriesType } from '@/core/types/api/series';
import { ListResultType } from '@/core/types/api';
import ManuallyLinkedFilesRow from './Components/ManuallyLinkedFilesRow';
import { splitV3Api } from '@/core/rtkQuery/splitV3Api';
import { useDeleteFileLinkMutation, usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import toast from '@/components/Toast';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Input from '@/components/Input/Input';
import { Title } from '../UnrecognizedUtility';

function ManuallyLinkedTab() {
  const dispatch = useDispatch();

  const [filesCount, setFilesCount] = useState(0);

  const seriesQuery = useGetSeriesWithManuallyLinkedFilesQuery({ pageSize: 0 });
  const series: ListResultType<Array<SeriesType>> = seriesQuery.data ?? { Total: 0, List: [] };
  const [unlinkFile] = useDeleteFileLinkMutation();
  const [rescanFile] = usePostFileRescanMutation();

  useEffect(() => {
    setFilesCount(series.Total);
  }, [series.Total]);

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

  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());

  const modifySelectedFiles = useCallback(
    (fileIds: Array<number>, remove: boolean) => {
      setSelectedFiles((prev) => {
        const tempSet = new Set(prev);
        fileIds.forEach(remove ? tempSet.delete : tempSet.add, tempSet);
        return tempSet;
      });
    },
    [setSelectedFiles],
  );

  const refreshData = () => {
    dispatch(splitV3Api.util.invalidateTags(['UtilitiesRefresh']));
    setSelectedFiles(new Set());
  };

  const unlinkFiles = () => {
    let failedFiles = 0;
    selectedFiles.forEach((fileId) => {
      unlinkFile(fileId).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error ignoring ${failedFiles} files!`);
    if (failedFiles !== selectedFiles.size) toast.success(`${selectedFiles.size} files unlinked!`);

    refreshData();
  };

  const rescanFiles = () => {
    let failedFiles = 0;
    selectedFiles.forEach((fileId) => {
      rescanFile(fileId).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rescan failed for ${failedFiles} files!`);
    if (failedFiles !== selectedFiles.size) toast.success(`Rescanning ${selectedFiles.size} files!`);
  };

  const renderOperations = (common = false) => {
    const renderButton = (onClick: (...args: any) => void, icon: string, name: string, highlight = false) => (
      <Button onClick={onClick} className="flex items-center mr-4 font-normal text-font-main">
        <Icon path={icon} size={1} className={cx(['mr-1', highlight && 'text-highlight-1'])} />
        {name}
      </Button>
    );

    return (
      <>
        {renderButton(refreshData, mdiRestart, 'Refresh')}
        <TransitionDiv className="flex grow" show={!common}>
          {renderButton(rescanFiles, mdiDatabaseSearchOutline, 'Rescan')}
          {renderButton(unlinkFiles, mdiMinusCircleOutline, 'Unlink', true)}
          {renderButton(() => setSelectedFiles(new Set()), mdiCloseCircleOutline, 'Cancel Selection', true)}
        </TransitionDiv>
      </>

    );
  };

  const renderOptions = () => (
    <div className="font-semibold text-xl">
      <span className="text-highlight-2">{filesCount}</span> Files
    </div>
  );

  return (
    <TransitionDiv className="flex flex-col grow h-full w-full">

      <div>
        <ShokoPanel title={<Title />} options={renderOptions()}>
          <div className="flex items-center gap-x-3">
            <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} inputClassName="px-4 py-3" />
            <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative">
              {renderOperations(selectedFiles.size === 0) }
              <span className="text-highlight-2 ml-auto">{selectedFiles.size}&nbsp;</span>Files Selected
            </div>
          </div>
        </ShokoPanel>
      </div>

      <div className="grow w-full overflow-y-auto rounded-lg bg-background-alt border border-background-border mt-8 p-8" ref={parentRef}>
        {seriesQuery.isFetching ? (
          <div className="flex h-full justify-center items-center">
            <Icon path={mdiLoading} size={4} className="text-highlight-1" spin />
          </div>
        ) : series.Total > 0 ? (
          <React.Fragment>
            {/*<div className="flex px-8 py-3.5 bg-background-nav drop-shadow-lg font-bold sticky top-0 z-[1]">*/}
            {/*  Series Name*/}
            {/*</div>*/}
            <div className="w-full relative" style={{ height: rowVirtualizer.getTotalSize() }}>
              <div className="w-full absolute top-0 left-0" style={{ transform: `translateY(${virtualItems[0].start}px)` }}>
                {virtualItems.map((virtualRow) => {
                  const row = filteredSeries[virtualRow.index];
                  return (
                    <div
                      className="border-background-border border-t"
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                    >
                      <Disclosure>
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex w-full justify-between px-8 py-4">
                              <span>
                                {row.Name} (AniDB:<a href={`https://anidb.net/anime/${row.IDs.AniDB}`} rel="noopener,noreferrer" target="_blank" className="text-highlight-1 font-semibold ml-1" onClick={e => e.stopPropagation()}>{row.IDs.AniDB}</a>)
                              </span>
                                <Icon path={mdiChevronDown} size={1} className="transition-transform ui-open:-rotate-180" />
                            </Disclosure.Button>
                            <TransitionDiv show={open}>
                              <Disclosure.Panel>
                                <ManuallyLinkedFilesRow seriesId={row.IDs.ID} modifySelectedFiles={modifySelectedFiles} selectedFiles={selectedFiles} />
                              </Disclosure.Panel>
                            </TransitionDiv>
                          </>
                        )}
                      </Disclosure>
                    </div>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div className="flex items-center justify-center h-full font-semibold">No manually linked file(s)!</div> 
        )}
      </div>
    </TransitionDiv>
  );
}

export default ManuallyLinkedTab;