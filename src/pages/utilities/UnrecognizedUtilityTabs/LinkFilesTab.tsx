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
import { debounce, filter, find, findIndex, forEach, groupBy, keys, map, orderBy, toInteger, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import TransitionDiv from '@/components/TransitionDiv';
import Title from '@/components/Utilities/Unrecognized/Title';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Button from '@/components/Input/Button';
import {
  useDeleteSeriesMutation,
  useGetSeriesAniDBEpisodesQuery,
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

const AnimeSelectPanel = ({ updateSelectedSeries, seriesUpdating }: { updateSelectedSeries: (series: SeriesAniDBSearchResult) => void, seriesUpdating: boolean }) => {
  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();

  const [searchText, setSearchText] = useState('');

  const debouncedSearch = useRef(
    debounce((query: string) => {
      searchTrigger({ query, pageSize: 20 }).catch(() => {});
    }, 200),
  ).current;

  useEffect(() => () => {
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearch = (query: string) => {
    setSearchText(query);
    if (query !== '') debouncedSearch(query);
  };

  const renderRow = useCallback((data: SeriesAniDBSearchResult) => (
    <div key={data.ID} onClick={() => updateSelectedSeries(data)} className="flex cursor-pointer gap-y-1">
      <div
        className="flex font-semibold text-highlight-1 w-20"
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

  const searchRows: Array<React.ReactNode> = [];

  if (!seriesUpdating) {
    forEach(searchResults.data, (result) => {
      searchRows.push(renderRow(result));
    });
  } else {
    searchRows.push(<div className="flex grow justify-center items-center text-highlight-1"><Icon path={mdiLoading} size={4} spin /></div>);
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
      <div className="flex flex-col bg-background-border p-4 rounded-md h-full overflow-y-auto">
        {searchRows}
      </div>
    </div>
  );
};

function LinkFilesTab() {
  const navigate = useNavigate();

  const { selectedRows } = useLocation().state as { selectedRows: FileType[] };
  if (selectedRows.length === 0) navigate('../', { replace: true });

  const [isLoading, setLoading] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult);
  const [selectedLink, setSelectedLink] = useState<number>(-1);
  const [showRangeFillModal, setShowRangeFillModal] = useState(false);
  const [seriesUpdating, setSeriesUpdating] = useState(false);

  const [links, setLinks] = useImmer<ManualLink[]>([]);

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

  const updateSelectedLink = (idx: number) => {
    if (isLoading) return;
    if (selectedLink === idx) setSelectedLink(-1);
    else setSelectedLink(idx);
  };

  useEffect(() => {
    setSelectedLink(-1);
  }, [links]);

  const [deleteSeries] = useDeleteSeriesMutation();
  const [updateEpisodes] = useLazyGetSeriesEpisodesQuery();
  const anidbEpisodesQuery = useGetSeriesAniDBEpisodesQuery({ anidbID: selectedSeries.ID, pageSize: 0, includeMissing: 'true' }, { skip: !selectedSeries.ID || selectedSeries.Type === SeriesTypeEnum.Unknown });
  const [refreshSeries] = useRefreshAnidbSeriesMutation();
  const [getAnidbSeries] = useLazyGetSeriesAniDBSearchQuery();
  const [fileLinkEpisodesTrigger] = usePostFileLinkMutation();
  const filesQuery = useGetFilesQuery({ pageSize: 0, includeUnrecognized: 'only' });
  const episodes = useMemo(() => anidbEpisodesQuery?.data?.List || [], [anidbEpisodesQuery]);

  useEffect(() => {
    if (links.length > 0) return;
    const newLinks = selectedRows.map(file => ({ FileID: file.ID, EpisodeID: 0 }));
    setLinks(newLinks);
  }, [episodes, links, selectedRows, setLinks]);

  const updateSelectedSeries = async (series: SeriesAniDBSearchResult) => {
    setLinks([]);

    if (series.Type !== SeriesTypeEnum.Unknown) {
      setSelectedSeries(series);
      return;
    }

    setSeriesUpdating(true);
    try {
      await refreshSeries({ anidbID: series.ID, force: true }).unwrap();
      const updatedSeriesData = await getAnidbSeries({ query: `${series.ID}` }).unwrap();
      setSelectedSeries(updatedSeriesData[0]);
    } catch (_) {
      toast.error('Failed to get series data!');
    }
    setSeriesUpdating(false);
  };

  const episodeOptions = useMemo(() => (
    episodes.map(item => (
      { value: item.ID, AirDate: item?.AirDate ?? '', label: item?.Title ?? '', type: item?.Type ?? EpisodeTypeEnum.Unknown, number: item?.EpisodeNumber ?? 0 }
    ))
  ), [episodes]);
  const groupedLinksMap = useMemo(() => groupBy(links, 'EpisodeID'), [links]);

  const fileLinks = useMemo(() => orderBy<ManualLink>(links, (item) => {
    const file = find(selectedRows, ['ID', item.FileID]);
    return file?.Locations?.[0].RelativePath ?? item.FileID;
  }), [links, selectedRows]);

  const renderFileLinks = () => {
    const result: React.ReactNode[] = [];
    forEach(fileLinks, (link, idx) => {
      const file = find(selectedRows, ['ID', link.FileID]);
      const path = file?.Locations?.[0].RelativePath ?? '<missing file path>';
      const isSameFile = idx > 0 && fileLinks[idx - 1].FileID === link.FileID;
      result.push(
        <div title={path} className={cx(['flex items-center p-4 w-full border border-background-border rounded-md col-start-1 cursor-pointer transition-colors leading-5', idx % 2 === 0 ? 'bg-background-alt' : 'bg-background', selectedLink === idx && 'border-highlight-1'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`} data-file-id={link.FileID} onClick={() => updateSelectedLink(idx)}>
          {path}
          {isSameFile && (<Icon path={mdiLink} size={1} className="text-highlight-2 ml-auto" />)}
        </div>,
      );
      if (episodes.length > 0) {
        result.push(
          <div data-file-id={link.FileID} key={`${link.FileID}-${link.EpisodeID}-${idx}-select`}>
            <SelectEpisodeList rowIdx={idx} options={episodeOptions} emptyValue="Select episode" value={link.EpisodeID} disabled={isLoading} onChange={value => addLink(link.FileID, value)} />
          </div>,
        );
      } else if (idx === 0) {
        result.push(
          <div className="flex justify-center items-center">
            No episodes exist!
          </div>,
        );
      }
    });

    return result;
  };

  const manualLinkFileNodes = useMemo(() => {
    const manualLinkFileRows: Array<React.ReactNode> = [];
    forEach(selectedRows, (file) => {
      manualLinkFileRows.push(
        <div className="p-4 w-full odd:bg-background even:bg-background-alt border border-background-border rounded-md leading-5" key={file.ID}>
          {file.Locations?.[0].RelativePath ?? '<missing file path>'}
        </div>,
      );
    });
    return manualLinkFileRows;
  }, [selectedRows]);

  const makeLinks = async () => {
    if (isLoading) return;
    setLoading(true);
    setSelectedLink(-1);
    let series = selectedSeries;
    const doesNotExist = series.ShokoID === null;
    if (doesNotExist) {
      try {
        await refreshSeries({ anidbID: selectedSeries.ID, createSeries: true }).unwrap();
      } catch (_) {
        toast.error('Failed to add series! Unable to create shoko series entry.');
        setLoading(false);
        return;
      }

      let seriesResponse: SeriesAniDBSearchResult[];
      try {
        seriesResponse = await getAnidbSeries({ query: `${selectedSeries.ID}` }).unwrap();
      } catch (_) {
        toast.error('Failed to add series! Unable to fetch the updated anidb series entry.');
        setLoading(false);
        return;
      }

      [series] = seriesResponse;
      if (series.ShokoID === null) {
        toast.error('Failed to add series! Unable to fetch the updated anidb series entry.');
        setLoading(false);
        return;
      }
    }

    let shokoEpisodeResponse: ListResultType<EpisodeType[]>;
    try {
      shokoEpisodeResponse = await updateEpisodes({ seriesID: series.ShokoID!, includeMissing: 'true', includeHidden: 'true', pageSize: 0 }).unwrap();
    } catch (_) {
      // if it previously didn't exist, but was made right before this, then
      // delete it again.
      if (doesNotExist && series.ShokoID) {
        await deleteSeries({ seriesId: series.ShokoID!, deleteFiles: false });
      }
      setLoading(false);
      toast.error('Failed to add series! Unable to fetch shoko episodes!');
      return;
    }

    const anidbSet = new Set(keys(groupedLinksMap).map(i => parseInt(i, 10)));
    const groupedLinksArray = Array<[number, ManualLink[]]>();
    forEach(shokoEpisodeResponse.List, (episode) => {
      if (anidbSet.has(episode.IDs.AniDB)) {
        groupedLinksArray.push([episode.IDs.ID, groupedLinksMap[episode.IDs.AniDB]]);
      }
    });

    if (anidbSet.size !== groupedLinksArray.length) {
      // if it previously didn't exist, but was made right before this, then
      // delete it again.
      if (doesNotExist && series.ShokoID) {
        await deleteSeries({ seriesId: series.ShokoID!, deleteFiles: false });
      }
      setLoading(false);
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
    setLoading(false);
    setLinks([]);
    setSelectedSeries({} as SeriesAniDBSearchResult);
    navigate('../');
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

  return (
    <>
      <TransitionDiv className="flex flex-col grow w-full h-full">

        <div>
          <ShokoPanel title={<Title />} options={<ItemCount filesCount={selectedRows.length} />}>
            <div className="flex items-center gap-x-3">
              <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative">
                <div className="flex grow gap-x-4">
                  <MenuButton onClick={() => addLink(fileLinks[selectedLink].FileID)} icon={mdiPlusCircleMultipleOutline} name="Duplicate Entry" disabled={isLoading || selectedLink === -1} />
                  <MenuButton onClick={() => removeLink(fileLinks[selectedLink].FileID)} icon={mdiMinusCircleOutline} name="Remove Entry" disabled={isLoading || selectedLink === -1} />
                </div>
              </div>
              <div className="flex gap-x-3 font-semibold">
                <Button onClick={() => setShowRangeFillModal(true)} className="bg-background-nav border border-background-border px-4 py-3 text-font-main" disabled={isLoading || selectedSeries.Type === SeriesTypeEnum.Unknown}>Range Fill</Button>
                {/* <Button onClick={() => {}} className="bg-background-nav border border-background-border px-4 py-3 text-font-main">Auto Fill</Button> */}
                <Button onClick={() => { setSelectedSeries({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult); navigate('../'); }} className="bg-background-nav border border-background-border px-4 py-3 text-font-main" disabled={isLoading}>Cancel</Button>
                <Button onClick={makeLinks} className="bg-highlight-1 border border-background-border px-4 py-3" disabled={isLoading || selectedSeries.Type === SeriesTypeEnum.Unknown} loading={isLoading}>Save</Button>
              </div>
            </div>
          </ShokoPanel>
        </div>

        <div className="grow w-full h-full overflow-y-auto rounded-lg bg-background-alt border border-background-border mt-8 p-8 flex gap-x-8">
          <div className={cx('grid gap-y-2 gap-x-8 auto-rows-min', selectedSeries?.ID ? 'w-full grid-cols-2' : 'w-1/2 grid-cols-1')}>
            <div className="flex justify-between bg-background font-semibold p-4 rounded-md border border-background-border">
              Selected Files
              <Icon size={1} path={mdiSortAlphabeticalAscending} />
            </div>
            {selectedSeries?.ID && (
              <div className="flex bg-background font-semibold p-4 rounded-md border border-background-border">
                AniDB |&nbsp;
                <div
                  className="flex font-semibold text-highlight-1 cursor-pointer"
                  onClick={() => window.open(`https://anidb.net/anime/${selectedSeries.ID}`, '_blank')}
                >
                  {selectedSeries.ID} - {selectedSeries.Title}
                  <Icon path={mdiOpenInNew} size={1} className="ml-3" />
                </div>
                <Button onClick={() => setSelectedSeries({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult)} className="ml-auto text-highlight-1" disabled={isLoading}>
                  <Icon path={mdiPencilCircleOutline} size={1} />
                </Button>
              </div>
            )}
            {selectedSeries?.ID ? renderFileLinks() : manualLinkFileNodes}
          </div>
          {!selectedSeries?.ID && <AnimeSelectPanel updateSelectedSeries={updateSelectedSeries} seriesUpdating={seriesUpdating} />}
        </div>
      </TransitionDiv>
      <RangeFillModal show={showRangeFillModal} onClose={() => setShowRangeFillModal(false)} rangeFill={rangeFill} />
    </>
  );
}

export default LinkFilesTab;
