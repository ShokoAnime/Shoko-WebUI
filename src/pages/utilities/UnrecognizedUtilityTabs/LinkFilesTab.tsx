// This is the least maintainable file in the entire codebase
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import {
  mdiLink, mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiPencilCircleOutline,
  mdiPlusCircleMultipleOutline,
  mdiSortAlphabeticalAscending,
} from '@mdi/js';
import { debounce, filter, find, findIndex, forEach, groupBy, keys, map, orderBy, reduce, toInteger, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import TransitionDiv from '@/components/TransitionDiv';
import Title from '@/components/Utilities/Unrecognized/Title';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Button from '@/components/Input/Button';
import {
  useDeleteSeriesMutation,
  useGetSeriesAniDBEpisodesQuery,
  useLazyGetSeriesAniDBQuery,
  useLazyGetSeriesAniDBSearchQuery,
  useLazyGetSeriesEpisodesQuery,
  useRefreshAnidbSeriesMutation,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import { SeriesAniDBSearchResult, SeriesTypeEnum } from '@/core/types/api/series';
import Input from '@/components/Input/Input';
import { formatThousand } from '@/core/util';
import { EpisodeType, EpisodeTypeEnum } from '@/core/types/api/episode';
import toast from '@/components/Toast';
import SelectEpisodeList from '@/components/Input/SelectEpisodeList';
import { FileLinkApiType, FileType } from '@/core/types/api/file';
import { useGetFilesQuery, usePostFileLinkMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import RangeFillModal from '@/components/Utilities/Unrecognized/RangeFillModal';
import { ListResultType } from '@/core/types/api';

type ManualLink = {
  FileID: number;
  EpisodeID: number;
};

const AnimeSelectPanel = ({ updateSelectedSeries, seriesUpdating, placeholder }: { updateSelectedSeries: (series: SeriesAniDBSearchResult) => void, seriesUpdating: boolean; placeholder: string }) => {
  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();
  const [searchText, setSearchText] = useState(placeholder);

  const debouncedSearch = useRef(
    debounce((query: string) => {
      searchTrigger({ query, pageSize: 20 }).catch(() => {});
    }, 200),
  ).current;

  const handleSearch = (query: string) => {
    setSearchText(query);
    if (query !== '') debouncedSearch(query);
  };

  const renderRow = useCallback((data: SeriesAniDBSearchResult) => (
    <div key={data.ID} onClick={() => updateSelectedSeries(data)} className="flex cursor-pointer gap-y-1">
      <div
        className="flex font-semibold text-panel-primary w-20"
        onClick={(e) => {
          e.stopPropagation();
          window.open(`https://anidb.net/anime/${data.ID}`, '_blank');
        }}
      >
        {data.ID}
        <Icon path={mdiOpenInNew} size={0.833} className="ml-auto" />
      </div>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <div>{data.Title}</div>
      <div className="ml-auto">{data.Type}&nbsp;&nbsp;|&nbsp;&nbsp;</div>
      <div className="w-10">{data.EpisodeCount ? formatThousand(data.EpisodeCount) : '-'}</div>
    </div>
  ), [updateSelectedSeries]);

  useEffect(() => () => {
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const searchRows: Array<React.ReactNode> = [];
  if (!seriesUpdating) {
    forEach(searchResults.data, (result) => {
      searchRows.push(renderRow(result));
    });
  } else {
    searchRows.push(<div className="flex grow justify-center items-center text-panel-primary"><Icon path={mdiLoading} size={4} spin /></div>);
  }

  return (
    <div className="flex flex-col gap-y-2 w-1/2">
      <Input
        id="link-search"
        type="text"
        value={searchText}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Enter Series Name or AniDB ID..."
        inputClassName="!p-4"
        startIcon={mdiMagnify}
      />
      <div className="flex flex-col bg-panel-border p-4 rounded-md h-full overflow-y-auto">
        {searchRows}
      </div>
    </div>
  );
};

function LinkFilesTab() {
  const navigate = useNavigate();
  const { selectedRows } = useLocation().state as { selectedRows: FileType[] };
  const [{ isLinking, isLinkingRunning, createdNewSeries }, setLoading] = useState({ isLinking: false, isLinkingRunning: false, createdNewSeries: true });
  const [selectedLink, setSelectedLink] = useState<number>(-1);
  const [selectedSeries, setSelectedSeries] = useState({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult);
  const [seriesUpdating, setSeriesUpdating] = useState(false);
  const [showRangeFillModal, setShowRangeFillModal] = useState(false);
  const [links, setLinks] = useImmer<ManualLink[]>([]);
  const [deleteSeries] = useDeleteSeriesMutation();
  const [fileLinkEpisodesTrigger] = usePostFileLinkMutation();
  const [getAnidbSeries, getAnidbSeriesQuery] = useLazyGetSeriesAniDBQuery();
  const [refreshSeries] = useRefreshAnidbSeriesMutation();
  const [updateEpisodes] = useLazyGetSeriesEpisodesQuery();
  const anidbEpisodesQuery = useGetSeriesAniDBEpisodesQuery({ anidbID: selectedSeries.ID, pageSize: 0, includeMissing: 'true' }, { skip: !selectedSeries.ID || selectedSeries.Type === SeriesTypeEnum.Unknown });
  const filesQuery = useGetFilesQuery({ pageSize: 0, includeUnrecognized: 'only' });

  const episodes = useMemo(() => anidbEpisodesQuery?.data?.List || [], [anidbEpisodesQuery]);
  const groupedLinksMap = useMemo(() => groupBy(links, 'EpisodeID'), [links]);
  const fileLinks = useMemo(() => orderBy<ManualLink>(links, (item) => {
    const file = find(selectedRows, ['ID', item.FileID]);
    return file?.Locations?.[0].RelativePath ?? item.FileID;
  }), [links, selectedRows]);

  const episodeOptions = useMemo(() => (
    episodes.map(item => (
      { value: item.ID, AirDate: item?.AirDate ?? '', label: item?.Title ?? '', type: item?.Type ?? EpisodeTypeEnum.Unknown, number: item?.EpisodeNumber ?? 0 }
    ))
  ), [episodes]);

  const addLink = useCallback((FileID: number, EpisodeID = 0) => setLinks((linkState) => {
    if (EpisodeID === 0) {
      linkState.push({ FileID, EpisodeID: 0 });
    } else {
      const itemIndex = linkState.findIndex(link => link.FileID === FileID);
      // We are using immer but eslint is stupid
      // eslint-disable-next-line no-param-reassign
      linkState[itemIndex].EpisodeID = EpisodeID;
    }
  }), [setLinks]);

  const removeLink = useCallback((FileID: number) => setLinks((linkState) => {
    const itemIndex = linkState.reverse().findIndex(link => link.FileID === FileID);
    linkState.splice(itemIndex, 1);
  }), [setLinks]);

  const updateSelectedLink = useCallback((idx: number) => {
    if (isLinking) return;
    if (selectedLink === idx) setSelectedLink(-1);
    else setSelectedLink(idx);
  }, [isLinking, selectedLink, setSelectedLink]);

  const updateSelectedSeries = async (series: SeriesAniDBSearchResult) => {
    setLinks([]);

    if (series.Type !== SeriesTypeEnum.Unknown) {
      setSelectedSeries(series);
      return;
    }

    setSeriesUpdating(true);
    try {
      const refresh = await refreshSeries({ anidbID: series.ID, force: true }).unwrap();
      // Because server thinks sending data as false with status 200 is the same as sending error status
      if (!refresh) throw Error();
      const updatedSeriesData = await getAnidbSeries(series.ID).unwrap();
      setSelectedSeries(updatedSeriesData);
    } catch (_) {
      toast.error('Failed to get series data!');
    }
    setSeriesUpdating(false);
  };

  const saveChanges = async () => {
    if (isLinking) return;
    setSelectedLink(-1);
    const doesNotExist = selectedSeries.ShokoID === null;
    if (doesNotExist) {
      try {
        await refreshSeries({ anidbID: selectedSeries.ID, createSeries: true }).unwrap();
      } catch (_) {
        toast.error('Failed to add series! Unable to create shoko series entry.');
        setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
      }
    }
    setLoading({ isLinking: true, createdNewSeries: doesNotExist, isLinkingRunning: false });
  };

  const rangeFill = (rangeStart: string, epType: string) => {
    if (toInteger(rangeStart) <= 0) {
      toast.error('Value is not a positive integer.');
      return;
    }

    const items = filter(episodeOptions, ['type', epType]);
    const idx = findIndex(items, ['number', toInteger(rangeStart)]);
    if (idx === -1) {
      toast.error('Unable to find starting episode.');
      return;
    }
    const filtered = items.slice(idx);
    forEach(fileLinks, (link) => {
      const ep = filtered.shift();
      if (!ep) { return; }
      addLink(link.FileID, ep.value);
    });
  };

  const makeLinks = useCallback(async (seriesID: number, anidbMap: Map<number, ManualLink[]>, didNotExist: boolean) => {
    setLoading(state => ({ ...state, isLinkingRunning: true }));

    let shokoEpisodeResponse: ListResultType<EpisodeType[]>;
    try {
      shokoEpisodeResponse = await updateEpisodes({ seriesID, includeMissing: 'true', includeHidden: 'true', pageSize: 0 }).unwrap();
    } catch (_) {
      // if it previously didn't exist, but was made right before this, then
      // delete it again.
      if (didNotExist) {
        await deleteSeries({ seriesId: seriesID, deleteFiles: false });
      }
      setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
      toast.error('Failed to add series! Unable to fetch shoko episodes!');
      return;
    }

    const groupedLinksArray = Array<[number, ManualLink[]]>();
    forEach(shokoEpisodeResponse.List, (episode) => {
      const fileIds = anidbMap.get(episode.IDs.AniDB);
      if (fileIds) {
        groupedLinksArray.push([episode.IDs.ID, fileIds]);
      }
    });

    if (anidbMap.size !== groupedLinksArray.length) {
      // if it previously didn't exist, but was made right before this, then
      // delete it again.
      if (didNotExist) {
        await deleteSeries({ seriesId: seriesID, deleteFiles: false });
      }
      setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
      toast.error('Failed to add series! Not all files/episodes accounted for. Try again or contact support.');
      return;
    }

    await Promise.all(map(groupedLinksArray, async ([episodeID, fileIds]) => {
      const payload: FileLinkApiType = {
        episodeID,
        fileIDs: [],
      };
      payload.episodeID = toNumber(episodeID);
      forEach(fileIds, (link) => {
        if (link.FileID === 0) {
          return;
        }
        payload.fileIDs.push(link.FileID);
      });

      if (payload.episodeID === 0 || payload.fileIDs.length === 0) { return; }
      try {
        await fileLinkEpisodesTrigger(payload).unwrap();
        toast.success('Episode linked!');
      } catch (error) {
        toast.error('Episode linking failed!');
      }
    }));

    await filesQuery.refetch();
    setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
    setLinks([]);
    setSelectedSeries({} as SeriesAniDBSearchResult);
    navigate('../');
  }, [
    deleteSeries,
    fileLinkEpisodesTrigger,
    filesQuery,
    navigate,
    setLinks,
    updateEpisodes,
  ]);

  useEffect(() => {
    setSelectedLink(-1);
  }, [links]);

  useEffect(() => {
    if (selectedRows.length === 0) {
      navigate('../', { replace: true });
    }
    if (links.length > 0) return;
    const newLinks = selectedRows.map(file => ({ FileID: file.ID, EpisodeID: 0 }));
    setLinks(newLinks);
  }, [episodes, links, selectedRows, setLinks, navigate]);

  useEffect(() => {
    if (!isLinking || isLinkingRunning || getAnidbSeriesQuery.isLoading || !(getAnidbSeriesQuery.isSuccess && getAnidbSeriesQuery.data.ShokoID)) {
      return;
    }

    const seriesID = getAnidbSeriesQuery.data.ShokoID;
    const anidbMap = new Map(keys(groupedLinksMap).map(i => [parseInt(i, 10), groupedLinksMap[i]]));
    makeLinks(seriesID, anidbMap, createdNewSeries).catch(() => undefined);
  }, [
    isLinking,
    isLinkingRunning,
    createdNewSeries,
    makeLinks,
    groupedLinksMap,
    getAnidbSeriesQuery.data,
    getAnidbSeriesQuery.isLoading,
    getAnidbSeriesQuery.isSuccess,
  ]);

  const renderStaticFileLinks = () => map(selectedRows, file => (
    <div className="p-4 w-full odd:bg-panel-background-toolbar even:bg-panel-background border border-background-border rounded-md leading-5" key={file.ID}>
      {file.Locations?.[0].RelativePath ?? '<missing file path>'}
    </div>
  ));

  const renderDynamicFileLinks = () => reduce<ManualLink, React.ReactNode[]>(fileLinks, (result, link, idx) => {
    const file = find(selectedRows, ['ID', link.FileID]);
    const path = file?.Locations?.[0].RelativePath ?? '<missing file path>';
    const isSameFile = idx > 0 && fileLinks[idx - 1].FileID === link.FileID;
    result.push(
      <div title={path} className={cx(['flex items-center p-4 w-full border border-panel-border rounded-md col-start-1 cursor-pointer transition-colors leading-5', idx % 2 === 0 ? 'bg-background-alt' : 'bg-background', selectedLink === idx && 'border-highlight-1'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`} data-file-id={link.FileID} onClick={() => updateSelectedLink(idx)}>
        {path}
        {isSameFile && (<Icon path={mdiLink} size={1} className="text-panel-important ml-auto" />)}
      </div>,
    );
    if (episodes.length > 0) {
      result.push(
        <div data-file-id={link.FileID} key={`${link.FileID}-${link.EpisodeID}-${idx}-select`}>
          <SelectEpisodeList rowIdx={idx} options={episodeOptions} emptyValue="Select episode" value={link.EpisodeID} disabled={isLinking} onChange={value => addLink(link.FileID, value)} />
        </div>,
      );
    } else if (idx === 0) {
      result.push(
        <div className="flex justify-center items-center">
          No episodes exist!
        </div>,
      );
    }
    return result;
  }, []);

  return (
    <>
      <TransitionDiv className="flex flex-col grow w-full h-full">
        <div>
          <ShokoPanel title={<Title />} options={<ItemCount filesCount={selectedRows.length} />}>
            <div className="flex items-center gap-x-3">
              <div className="box-border flex grow bg-panel-background-toolbar border border-panel-border items-center rounded-md px-4 py-3 relative">
                <div className="flex grow gap-x-4">
                  <MenuButton onClick={() => addLink(fileLinks[selectedLink].FileID)} icon={mdiPlusCircleMultipleOutline} name="Duplicate Entry" disabled={isLinking || selectedLink === -1} />
                  <MenuButton onClick={() => removeLink(fileLinks[selectedLink].FileID)} icon={mdiMinusCircleOutline} name="Remove Entry" disabled={isLinking || selectedLink === -1} />
                </div>
              </div>
              <div className="flex gap-x-3 font-semibold">
                <Button onClick={() => setShowRangeFillModal(true)} buttonType="secondary" className="px-4 py-3" disabled={isLinking || selectedSeries.Type === SeriesTypeEnum.Unknown}>Range Fill</Button>
                {/* <Button onClick={() => {}} buttonType="secondary" className="px-4 py-3">Auto Fill</Button> */}
                <Button onClick={() => { setSelectedSeries({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult); navigate('../'); }} buttonType="secondary" className="px-4 py-3" disabled={isLinking}>Cancel</Button>
                <Button onClick={saveChanges} buttonType="primary" className="px-4 py-3" disabled={isLinking || selectedSeries.Type === SeriesTypeEnum.Unknown} loading={isLinking}>Save</Button>
              </div>
            </div>
          </ShokoPanel>
        </div>

        <div className="grow w-full h-full overflow-y-auto rounded-lg bg-panel-background border border-panel-border mt-8 p-8 flex gap-x-8">
          <div className={cx('grid gap-y-2 gap-x-8 auto-rows-min', selectedSeries?.ID ? 'w-full grid-cols-2' : 'w-1/2 grid-cols-1')}>
            <div className="flex justify-between bg-panel-background-toolbar font-semibold p-4 rounded-md border border-panel-border">
              Selected Files
              <Icon size={1} path={mdiSortAlphabeticalAscending} />
            </div>
            {selectedSeries?.ID && (
              <div className="flex bg-panel-background-toolbar font-semibold p-4 rounded-md border border-panel-border">
                AniDB |&nbsp;
                <div
                  className="flex font-semibold text-panel-primary cursor-pointer"
                  onClick={() => window.open(`https://anidb.net/anime/${selectedSeries.ID}`, '_blank')}
                >
                  {selectedSeries.ID} - {selectedSeries.Title}
                  <Icon path={mdiOpenInNew} size={1} className="ml-3" />
                </div>
                <Button onClick={() => setSelectedSeries({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult)} className="ml-auto text-panel-primary" disabled={isLinking}>
                  <Icon path={mdiPencilCircleOutline} size={1} />
                </Button>
              </div>
            )}
            {selectedSeries.ID ? renderDynamicFileLinks() : renderStaticFileLinks()}
          </div>
          {!selectedSeries?.ID && <AnimeSelectPanel updateSelectedSeries={updateSelectedSeries} seriesUpdating={seriesUpdating} placeholder="" />}
        </div>
      </TransitionDiv>
      <RangeFillModal show={showRangeFillModal} onClose={() => setShowRangeFillModal(false)} rangeFill={rangeFill} />
    </>
  );
}

export default LinkFilesTab;
