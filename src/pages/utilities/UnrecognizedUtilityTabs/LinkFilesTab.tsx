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
import { debounce, filter, find, findIndex, forEach, groupBy, map, orderBy, reduce, toInteger, uniqBy } from 'lodash';
import { useImmer } from 'use-immer';
import { useEventCallback } from 'usehooks-ts';

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
import { FileType } from '@/core/types/api/file';
import { useGetFilesQuery, usePostFileLinkManyMutation, usePostFileLinkOneMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import RangeFillModal from '@/components/Utilities/Unrecognized/RangeFillModal';
import { ListResultType } from '@/core/types/api';

type ManualLink = {
  LinkID: number;
  FileID: number;
  EpisodeID: number;
};

type ManualLinkOneToMany = {
  FileID: number;
  EpisodeIDs: number[];
};

type ManualLinkManyToOne = {
  FileIDs: number[];
  EpisodeID: number;
};

let lastLinkId = 0;
const generateLinkID = () => {
  if (lastLinkId === Number.MAX_SAFE_INTEGER) {
    lastLinkId = 0;
  }
  // eslint-disable-next-line no-plusplus
  return ++lastLinkId;
};

const parseLinks = (links: ManualLink[]) => {
  const filteredLinks = filter(links, link => link.FileID !== 0 && link.EpisodeID !== 0);
  const groupedByFileId = groupBy(filteredLinks, 'FileID');
  const groupedByEpisodeId = groupBy(filteredLinks, 'EpisodeID');
  const oneToOne: ManualLink[] = [];
  const oneToMany: ManualLinkOneToMany[] = [];
  const manyToOne: ManualLinkManyToOne[] = [];
  let manyToMany: ManualLink[] = [];

  forEach(groupedByFileId, (oTM) => {
    if (oTM.length === 1) {
      if (filter(filteredLinks, { EpisodeID: oTM[0].EpisodeID }).length === 1) {
        oneToOne.push(oTM[0]);
      }
    } else {
      oneToMany.push({ EpisodeIDs: oTM.map(a => a.EpisodeID), FileID: oTM[0].FileID });
    }
  });

  forEach(groupedByEpisodeId, (mTO) => {
    if (mTO.length > 1) {
      manyToOne.push({ EpisodeID: mTO[0].EpisodeID, FileIDs: mTO.map(a => a.FileID) });
    }
  });

  forEach(groupedByFileId, (linksByAId) => {
    forEach(linksByAId, (link) => {
      if (groupedByEpisodeId[link.EpisodeID].length > 1 && linksByAId.length > 1) {
        manyToMany.push(link);
      }
    });
  });
  manyToMany = uniqBy(manyToMany, l => `${l.FileID}-${l.EpisodeID}`);

  return { manyToMany, manyToOne, oneToMany, oneToOne };
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
      <div className="flex flex-col bg-panel-background-alt border border-panel-border p-4 rounded-md h-full overflow-y-auto">
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
  const [links, setLinks] = useImmer<ManualLink[]>(() => selectedRows.map(file => ({ LinkID: generateLinkID(), FileID: file.ID, EpisodeID: 0 })));
  const [deleteSeries] = useDeleteSeriesMutation();
  const [fileLinkManyTrigger] = usePostFileLinkManyMutation();
  const [fileLinkOneOrManyTrigger] = usePostFileLinkOneMutation();
  const [getAnidbSeries, getAnidbSeriesQuery] = useLazyGetSeriesAniDBQuery();
  const [refreshSeries] = useRefreshAnidbSeriesMutation();
  const [updateEpisodes] = useLazyGetSeriesEpisodesQuery();
  const anidbEpisodesQuery = useGetSeriesAniDBEpisodesQuery({ anidbID: selectedSeries.ID, pageSize: 0, includeMissing: 'true' }, { skip: !selectedSeries.ID || selectedSeries.Type === SeriesTypeEnum.Unknown });
  const filesQuery = useGetFilesQuery({ pageSize: 0, includeUnrecognized: 'only' });

  const episodes = useMemo(() => anidbEpisodesQuery?.data?.List || [], [anidbEpisodesQuery]);
  const fileLinks = useMemo(() => orderBy<ManualLink>(links, (item) => {
    const file = find(selectedRows, ['ID', item.FileID]);
    return file?.Locations?.[0].RelativePath ?? item.FileID;
  }), [links, selectedRows]);

  const episodeOptions = useMemo(() => (
    episodes.map(item => (
      { value: item.ID, AirDate: item?.AirDate ?? '', label: item?.Title ?? '', type: item?.Type ?? EpisodeTypeEnum.Unknown, number: item?.EpisodeNumber ?? 0 }
    ))
  ), [episodes]);

  const addLink = useEventCallback((FileID: number, EpisodeID: number = 0, LinkID?: number) => setLinks((linkState) => {
    if (EpisodeID === 0) {
      linkState.push({ LinkID: generateLinkID(), FileID, EpisodeID: 0 });
    } else {
      // eslint-disable-next-line no-param-reassign
      const itemIndex = LinkID ? linkState.findIndex(link => link.LinkID === LinkID) : linkState.findIndex(link => link.FileID === FileID);
      // We are using immer but eslint is stupid
      // eslint-disable-next-line no-param-reassign
      linkState[itemIndex].EpisodeID = EpisodeID;
    }
  }));

  const removeLink = useEventCallback((fileId: number) => setLinks((linkState) => {
    const itemIndex = linkState.findLastIndex(link => link.FileID === fileId);
    linkState.splice(itemIndex, 1);
  }));

  const updateSelectedLink = useCallback((idx: number) => {
    if (isLinking) return;
    if (selectedLink === idx) setSelectedLink(-1);
    else setSelectedLink(idx);
  }, [isLinking, selectedLink, setSelectedLink]);

  const updateSelectedSeries = useEventCallback(async (series: SeriesAniDBSearchResult) => {
    setLinks((linkState) => {
      // eslint-disable-next-line no-param-reassign
      forEach(linkState, (link) => { link.EpisodeID = 0; });
    });

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
  });

  const saveChanges = useEventCallback(async () => {
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
  });

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

  const makeLinks = useEventCallback(async (seriesID: number, manualLinks: ManualLink[], didNotExist: boolean) => {
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
      toast.error('Failed to add episodes! Unable to fetch shoko episodes!');
      return;
    }

    const anidbMap = new Map(shokoEpisodeResponse.List.map(i => [i.IDs.AniDB, i.IDs.ID]));
    const mappedLinks: ManualLink[] = manualLinks.map(({ LinkID, FileID, EpisodeID }) => ({ LinkID, FileID, EpisodeID: anidbMap.get(EpisodeID)! }));
    const { manyToMany, manyToOne, oneToMany, oneToOne } = parseLinks(mappedLinks);
    if (manyToMany.length) {
      // if it previously didn't exist, but was made right before this, then
      // delete it again.
      if (didNotExist) {
        await deleteSeries({ seriesId: seriesID, deleteFiles: false });
      }
      setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
      toast.error('Failed to add episodes! Unable create many-to-many relations. Try again or contact support.');
      return;
    }

    await Promise.all([
      ...map(oneToOne, async ({ EpisodeID, FileID }) => {
        try {
          await fileLinkOneOrManyTrigger({ episodeIDs: [EpisodeID], fileID: FileID }).unwrap();
          toast.success('Episode linked!');
        } catch (error) {
          toast.error('Episode linking failed!');
        }
      }),
      ...map(oneToMany, async ({ EpisodeIDs, FileID }) => {
        try {
          await fileLinkOneOrManyTrigger({ episodeIDs: EpisodeIDs, fileID: FileID }).unwrap();
          toast.success('1-To-Many Episode linked!');
        } catch (error) {
          toast.error('Episode linking failed!');
        }
      }),
      ...map(manyToOne, async ({ EpisodeID, FileIDs }) => {
        try {
          await fileLinkManyTrigger({ episodeID: EpisodeID, fileIDs: FileIDs }).unwrap();
          toast.success('Many-To-1 Episode linked!');
        } catch (error) {
          toast.error('Episode linking failed!');
        }
      }),
    ]);

    await filesQuery.refetch();
    setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
    setLinks([]);
    setSelectedSeries({} as SeriesAniDBSearchResult);
    navigate('../');
  });

  useEffect(() => {
    if (links.length === 0) {
      navigate('../', { replace: true });
    }
    setSelectedLink(-1);
  }, [links, navigate]);

  useEffect(() => {
    const seriesId = selectedSeries?.ShokoID ?? getAnidbSeriesQuery.data?.ShokoID;
    if (!seriesId || !isLinking || isLinkingRunning) {
      return;
    }

    makeLinks(seriesId, links, createdNewSeries).catch(() => console.error);
  }, [
    isLinking,
    isLinkingRunning,
    createdNewSeries,
    makeLinks,
    links,
    selectedSeries.ShokoID,
    getAnidbSeriesQuery.data,
    getAnidbSeriesQuery.isFetching,
  ]);

  const renderStaticFileLinks = () => map(links, (link, idx) => {
    const file = find(selectedRows, ['ID', link.FileID]);
    const path = file?.Locations?.[0].RelativePath ?? '<missing file path>';
    return (
      <div title={path} className={cx(['p-4 w-full odd:bg-panel-background-toolbar even:bg-panel-background border border-panel-border rounded-md leading-5', selectedLink === idx && 'border-panel-primary'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`} onClick={() => updateSelectedLink(idx)}>
        {path}
      </div>
    );
  });

  const renderDynamicFileLinks = () => reduce<ManualLink, React.ReactNode[]>(fileLinks, (result, link, idx) => {
    const file = find(selectedRows, ['ID', link.FileID]);
    const path = file?.Locations?.[0].RelativePath ?? '<missing file path>';
    const isSameFile = idx > 0 && fileLinks[idx - 1].FileID === link.FileID;
    result.push(
      <div title={path} className={cx(['flex items-center p-4 w-full border border-panel-border rounded-md col-start-1 cursor-pointer transition-colors leading-5', idx % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-toolbar', selectedLink === idx && 'border-panel-primary'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`} data-file-id={link.FileID} onClick={() => updateSelectedLink(idx)}>
        {path}
        {isSameFile && (<Icon path={mdiLink} size={1} className="text-panel-important ml-auto" />)}
      </div>,
    );
    if (episodes.length > 0) {
      result.push(
        <div data-file-id={link.FileID} key={`${link.FileID}-${link.EpisodeID}-${idx}-select`}>
          <SelectEpisodeList rowIdx={idx} options={episodeOptions} emptyValue="Select episode" value={link.EpisodeID} disabled={isLinking} onChange={value => addLink(link.FileID, value, link.LinkID)} />
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
                  <MenuButton onClick={() => addLink(fileLinks[selectedLink].FileID)} icon={mdiPlusCircleMultipleOutline} name="Duplicate Entry" disabled={isLinking || selectedLink === -1 || !selectedSeries.ID} />
                  <MenuButton onClick={() => removeLink(fileLinks[selectedLink].LinkID)} icon={mdiMinusCircleOutline} name="Remove Entry" disabled={isLinking || selectedLink === -1} />
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
