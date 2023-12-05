// This is the least maintainable file in the entire codebase
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  mdiLink,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiPencilCircleOutline,
  mdiPlusCircleMultipleOutline,
  mdiSortAlphabeticalAscending,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { filter, find, findIndex, forEach, groupBy, map, orderBy, reduce, toInteger, uniqBy } from 'lodash';
import { useImmer } from 'use-immer';
import { useDebounce, useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import SelectEpisodeList from '@/components/Input/SelectEpisodeList';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import RangeFillModal from '@/components/Utilities/Unrecognized/RangeFillModal';
import Title from '@/components/Utilities/Unrecognized/Title';
import { usePostFileLinkManyMutation, usePostFileLinkOneMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import {
  useDeleteSeriesMutation,
  useGetSeriesAniDBEpisodesQuery,
  useGetSeriesAniDBSearchQuery,
  useLazyGetSeriesAniDBQuery,
  useLazyGetSeriesEpisodesQuery,
  useRefreshAnidbSeriesMutation,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import { SeriesTypeEnum } from '@/core/types/api/series';
import { formatThousand } from '@/core/util';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';

import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';

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
  const none = filter(links, link => link.FileID === 0 || link.EpisodeID === 0);
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

  return { manyToMany, manyToOne, oneToMany, oneToOne, none };
};

const AnimeResultRow = (
  { data, updateSelectedSeries }: {
    updateSelectedSeries(series: SeriesAniDBSearchResult): void;
    data: SeriesAniDBSearchResult;
  },
) => {
  const handleOnClick = useEventCallback(() => {
    updateSelectedSeries(data);
  });

  return (
    <div
      key={data.ID}
      onClick={handleOnClick}
      className="flex cursor-pointer gap-x-2 gap-y-1 hover:text-panel-text-primary"
    >
      <a
        className="flex w-20 shrink-0 font-semibold text-panel-text-primary"
        href={`https://anidb.net/anime/${data.ID}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {data.ID}
        <Icon path={mdiOpenInNew} size={0.833} className="ml-auto" />
      </a>
      |
      <div>{data.Title}</div>
      <div className="ml-auto">{data.Type}</div>
      |
      <div className="w-10 shrink-0">{data.EpisodeCount ? formatThousand(data.EpisodeCount) : '-'}</div>
    </div>
  );
};

const AnimeSelectPanel = (
  { placeholder, seriesUpdating, updateSelectedSeries }: {
    updateSelectedSeries(series: SeriesAniDBSearchResult): void;
    seriesUpdating: boolean;
    placeholder: string;
  },
) => {
  const [searchText, setSearchText] = useState(placeholder);
  const debouncedSearch = useDebounce(searchText, 200);
  const searchQuery = useGetSeriesAniDBSearchQuery({ query: debouncedSearch }, { skip: !debouncedSearch });

  const searchRows = useMemo(() => {
    const rows: React.ReactNode[] = [];
    if (!seriesUpdating) {
      forEach(searchQuery.data, (data) => {
        rows.push(<AnimeResultRow key={data.ID} data={data} updateSelectedSeries={updateSelectedSeries} />);
      });
    } else {
      rows.push(
        <div key="loading" className="flex grow items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={4} spin />
        </div>,
      );
    }
    return rows;
  }, [searchQuery, seriesUpdating, updateSelectedSeries]);

  return (
    <div className="flex w-1/2 flex-col gap-y-2">
      <Input
        id="link-search"
        type="text"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Enter Series Name or AniDB ID..."
        inputClassName="!p-4"
        startIcon={mdiMagnify}
      />
      <div className="flex grow flex-col overflow-y-auto rounded-md border border-panel-border bg-panel-input p-4">
        {searchRows}
      </div>
    </div>
  );
};

function LinkFilesTab() {
  const navigate = useNavigate();
  const { selectedRows } = useLocation().state as { selectedRows: FileType[] };
  const [{ createdNewSeries, isLinking, isLinkingRunning }, setLoading] = useState({
    isLinking: false,
    isLinkingRunning: false,
    createdNewSeries: true,
  });
  const [selectedLink, setSelectedLink] = useState<number>(-1);
  const [selectedSeries, setSelectedSeries] = useState({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult);
  const [seriesUpdating, setSeriesUpdating] = useState(false);
  const [showRangeFillModal, setShowRangeFillModal] = useState(false);
  const [links, setLinks] = useImmer<ManualLink[]>(
    () => selectedRows.map(file => ({ LinkID: generateLinkID(), FileID: file.ID, EpisodeID: 0 })),
  );
  const [deleteSeries] = useDeleteSeriesMutation();
  const [fileLinkManyTrigger] = usePostFileLinkManyMutation();
  const [fileLinkOneOrManyTrigger] = usePostFileLinkOneMutation();
  const [getAnidbSeries, getAnidbSeriesQuery] = useLazyGetSeriesAniDBQuery();
  const [refreshSeries] = useRefreshAnidbSeriesMutation();
  const [updateEpisodes] = useLazyGetSeriesEpisodesQuery();
  const anidbEpisodesQuery = useGetSeriesAniDBEpisodesQuery({
    anidbID: selectedSeries.ID,
    pageSize: 0,
    includeMissing: 'true',
  }, { skip: !selectedSeries.ID || selectedSeries.Type === SeriesTypeEnum.Unknown });

  const showDataMap = useMemo(() =>
    new Map(
      selectedRows
        .map((file) => {
          const path = file?.Locations?.[0]?.RelativePath || '';
          const details = detectShow(path);
          return { file, path, details };
        })
        .map(mapping => [mapping.file.ID, mapping]),
    ), [selectedRows]);

  const initialSearchName = useMemo(
    () => findMostCommonShowName(map(groupBy(links, 'FileID'), l => showDataMap.get(l[0].FileID)!.details)),
    [showDataMap, links],
  );

  const episodes = useMemo(() => anidbEpisodesQuery?.data?.List || [], [anidbEpisodesQuery]);
  const orderedLinks = useMemo(() =>
    orderBy<ManualLink>(links, (item) => {
      const file = find(selectedRows, ['ID', item.FileID]);
      return file?.Locations?.[0].RelativePath ?? item.FileID;
    }), [links, selectedRows]);

  const episodeOptions = useMemo(() => (
    episodes.map(item => (
      {
        value: item.ID,
        AirDate: item?.AirDate ?? '',
        label: item?.Title ?? '',
        type: item?.Type ?? EpisodeTypeEnum.Unknown,
        number: item?.EpisodeNumber ?? 0,
      }
    ))
  ), [episodes]);

  const addLink = useEventCallback(
    (FileID: number, EpisodeID: number = 0, LinkID?: number) =>
      setLinks((linkState) => {
        if (EpisodeID === 0) {
          linkState.push({ LinkID: generateLinkID(), FileID, EpisodeID: 0 });
        } else {
          // eslint-disable-next-line no-param-reassign
          const itemIndex = LinkID
            ? linkState.findIndex(link => link.LinkID === LinkID)
            : linkState.findIndex(link => link.FileID === FileID);
          // We are using immer but eslint is stupid
          // eslint-disable-next-line no-param-reassign
          linkState[itemIndex].EpisodeID = EpisodeID;
        }
      }),
  );

  const duplicateLink = useEventCallback(() => {
    addLink(orderedLinks[selectedLink].FileID);
  });

  const removeLink = useEventCallback(() => {
    const { LinkID } = orderedLinks[selectedLink];
    setSelectedLink(-1);
    setLinks((linkState) => {
      const itemIndex = linkState.findLastIndex(link => link.LinkID === LinkID);
      linkState.splice(itemIndex, 1);
    });
  });

  const updateSelectedLink = useEventCallback((idx: number) => {
    if (isLinking) return;
    if (selectedLink === idx) setSelectedLink(-1);
    else setSelectedLink(idx);
  });

  const updateSelectedSeries = useEventCallback(async (series: SeriesAniDBSearchResult) => {
    setLinks((linkState) => {
      forEach(linkState, (link) => {
        // eslint-disable-next-line no-param-reassign
        link.EpisodeID = 0;
      });
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

  const editSelectedSeries = useEventCallback(() => {
    setSelectedSeries({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult);
  });

  const openRangeFill = useEventCallback(() => {
    setShowRangeFillModal(true);
  });

  const closeRangeFill = useEventCallback(() => {
    setShowRangeFillModal(false);
  });

  const cancelChanges = useEventCallback(() => {
    setSelectedSeries({ Type: SeriesTypeEnum.Unknown } as SeriesAniDBSearchResult);
    navigate('../');
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

  const rangeFill = useEventCallback((rangeStart: string, epType: string) => {
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
    forEach(orderedLinks, (link) => {
      const ep = filtered.shift();
      if (!ep) return;
      addLink(link.FileID, ep.value, link.LinkID);
    });
  });

  const autoFill = useEventCallback(() => {
    if (!episodes.length) return;
    let hasChanged = false;
    let skipped = false;
    const newLinks: ManualLink[] = [];
    let specials = 0;
    forEach(groupBy(orderedLinks, 'FileID'), (l) => {
      const { FileID } = l[0];
      const { details } = showDataMap.get(FileID)!;
      // skip links.
      if (!details) {
        skipped = true;
        newLinks.push(...l);
        return;
      }

      const { episodeEnd, episodeStart, episodeType } = details;

      // single episode link
      if ((episodeEnd - episodeStart) === 0) {
        // Special handling of specials if we were unable to determine the episode number during the detection phase.
        const episodeNumber = episodeType === EpisodeTypeEnum.Special && episodeStart === 0
          ? specials += 1
          : episodeStart;
        const episode = find(episodes, ep => ep.Type === episodeType && ep.EpisodeNumber === episodeNumber);
        if (!episode) {
          skipped = true;
          newLinks.push(...l);
          return;
        }
        hasChanged = true;
        newLinks.push({ LinkID: generateLinkID(), FileID, EpisodeID: episode.ID });
        return;
      }

      // multi episode link
      let foundLinks = false;
      for (let episodeNumber = episodeStart; episodeNumber <= episodeEnd; episodeNumber += 1) {
        const episode = find(episodes, ep => ep.Type === episodeType && ep.EpisodeNumber === episodeNumber);
        if (episode) {
          foundLinks = true;
          hasChanged = true;
          newLinks.push({ LinkID: generateLinkID(), FileID, EpisodeID: episode.ID });
        }
      }
      if (!foundLinks) {
        skipped = true;
        newLinks.push(...l);
      }
    });
    if (hasChanged) {
      setLinks(newLinks);
      if (skipped) {
        toast.warning(
          'Auto matching applied',
          'Some matches could not be filled it. Be sure to vefify the ones that were, and fill in the rest!',
        );
      } else {
        toast.success('Auto matching applied.', 'Be sure to verify before saving!');
      }
    }
  });

  const makeLinks = useEventCallback(async (seriesID: number, manualLinks: ManualLink[], didNotExist: boolean) => {
    setLoading(state => ({ ...state, isLinkingRunning: true }));

    let shokoEpisodeResponse: ListResultType<EpisodeType[]>;
    try {
      shokoEpisodeResponse = await updateEpisodes({
        seriesID,
        includeMissing: 'true',
        includeHidden: 'true',
        pageSize: 0,
      }).unwrap();
    } catch (_) {
      // if it previously didn't exist, but was made right before this, then
      // delete it again.
      if (didNotExist) {
        await deleteSeries({ seriesId: seriesID, deleteFiles: false });
      }
      setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
      toast.error('Linking aborted!', 'Unable to fetch shoko episodes!');
      return;
    }

    const anidbMap = new Map(shokoEpisodeResponse.List.map(i => [i.IDs.AniDB, i.IDs.ID]));
    const mappedLinks: ManualLink[] = manualLinks.map(({ EpisodeID, FileID, LinkID }) => ({
      LinkID,
      FileID,
      EpisodeID: anidbMap.get(EpisodeID) || 0,
    }));
    const { manyToMany, manyToOne, none, oneToMany, oneToOne } = parseLinks(mappedLinks);
    if (manyToMany.length) {
      // if it previously didn't exist, but was made right before this, then
      // delete it again.
      if (didNotExist) {
        await deleteSeries({ seriesId: seriesID, deleteFiles: false });
      }
      setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
      toast.error('Linking aborted!', 'Unable create many-to-many relations. Try again or contact support.');
      return;
    }

    await Promise.all([
      ...map(none, async ({ FileID }) => {
        if (FileID === 0) return;
        const { path = '<missing file path>' } = showDataMap.get(FileID)!;
        toast.warning('Episode linking skipped!', `Path: ${path}`);
      }),
      ...map(oneToOne, async ({ EpisodeID, FileID }) => {
        const { path = '<missing file path>' } = showDataMap.get(FileID)!;
        try {
          await fileLinkOneOrManyTrigger({ episodeIDs: [EpisodeID], fileID: FileID }).unwrap();
          toast.success('Scheduled a 1:1 mapping for linking!', `Path: ${path}`);
        } catch (error) {
          toast.error('Failed at 1:1 linking!', `Path: ${path}`);
        }
      }),
      ...map(oneToMany, async ({ EpisodeIDs, FileID }) => {
        const { path = '<missing file path>' } = showDataMap.get(FileID)!;
        try {
          await fileLinkOneOrManyTrigger({ episodeIDs: EpisodeIDs, fileID: FileID }).unwrap();
          toast.success(`Scheduled a 1:${EpisodeIDs.length} mapping for linking!`, `Path: ${path}`);
        } catch (error) {
          toast.error(`Failed at 1:${EpisodeIDs.length} linked!`, `Path: ${path}`);
        }
      }),
      ...map(manyToOne, async ({ EpisodeID, FileIDs }) => {
        const episode = find(episodes, ['ID', EpisodeID]);
        const episodeDetails = episode
          ? `Episode: ${episode.EpisodeNumber} - ${episode.Title}`
          : `Episode: ${EpisodeID}`;
        try {
          await fileLinkManyTrigger({ episodeID: EpisodeID, fileIDs: FileIDs }).unwrap();
          toast.success(`Scheduled a ${FileIDs.length}:1 mapping for linking!`, episodeDetails);
        } catch (error) {
          toast.error(`Failed at ${FileIDs.length}:1 linking!`, episodeDetails);
        }
      }),
    ]);

    setLoading({ isLinking: false, isLinkingRunning: false, createdNewSeries: false });
    setLinks([]);
    setSelectedSeries({} as SeriesAniDBSearchResult);
    navigate('../');
  });

  useEffect(() => {
    if (links.length === 0) {
      navigate('../', { replace: true });
    }
  }, [links, navigate]);

  useEffect(() => {
    if (selectedSeries.ID && episodes.length) {
      autoFill();
    }
  }, [selectedSeries.ID, episodes.length, autoFill]);

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

  const renderStaticFileLinks = () =>
    map(orderedLinks, (link, idx) => {
      const file = find(selectedRows, ['ID', link.FileID]);
      const path = file?.Locations?.[0].RelativePath ?? '<missing file path>';
      return (
        <div
          title={path}
          className={cx([
            'p-4 w-full odd:bg-panel-background-alt even:bg-panel-background border border-panel-border rounded-md leading-5',
            selectedLink === idx && 'border-panel-text-primary',
          ])}
          key={`${link.FileID}-${link.EpisodeID}-${idx}-static`}
          onClick={() => updateSelectedLink(idx)}
        >
          {path}
        </div>
      );
    });

  const renderDynamicFileLinks = () =>
    reduce<ManualLink, React.ReactNode[]>(orderedLinks, (result, link, idx) => {
      const file = find(selectedRows, ['ID', link.FileID]);
      const path = file?.Locations?.[0].RelativePath ?? '<missing file path>';
      const isSameFile = idx > 0 && orderedLinks[idx - 1].FileID === link.FileID;
      result.push(
        <div
          title={path}
          className={cx([
            'flex items-center p-4 w-full border border-panel-border rounded-md col-start-1 cursor-pointer transition-colors leading-5',
            idx % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
            selectedLink === idx && 'border-panel-text-primary',
          ])}
          key={`${link.FileID}-${link.EpisodeID}-${idx}`}
          data-file-id={link.FileID}
          onClick={() => updateSelectedLink(idx)}
        >
          {path}
          {isSameFile && <Icon path={mdiLink} size={1} className="ml-auto text-panel-text-important" />}
        </div>,
      );
      if (episodes.length > 0) {
        result.push(
          <div data-file-id={link.FileID} key={`${link.FileID}-${link.EpisodeID}-${idx}-select`}>
            <SelectEpisodeList
              rowIdx={idx}
              options={episodeOptions}
              emptyValue="Select episode"
              value={link.EpisodeID}
              disabled={isLinking}
              onChange={value => addLink(link.FileID, value, link.LinkID)}
            />
          </div>,
        );
      } else if (idx === 0) {
        result.push(
          <div className="flex items-center justify-center">
            No episodes exist!
          </div>,
        );
      }
      return result;
    }, []);

  return (
    <>
      <TransitionDiv className="flex h-full w-full grow flex-col">
        <div>
          <ShokoPanel title={<Title />} options={<ItemCount filesCount={selectedRows.length} />}>
            <div className="flex items-center gap-x-3">
              <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
                <div className="flex grow gap-x-4">
                  <MenuButton
                    onClick={duplicateLink}
                    icon={mdiPlusCircleMultipleOutline}
                    name="Duplicate Entry"
                    disabled={isLinking || selectedLink === -1 || !selectedSeries.ID}
                  />
                  <MenuButton
                    onClick={removeLink}
                    icon={mdiMinusCircleOutline}
                    name="Remove Entry"
                    disabled={isLinking || selectedLink === -1}
                  />
                </div>
              </div>
              <div className="flex gap-x-3 font-semibold">
                <Button
                  onClick={openRangeFill}
                  buttonType="secondary"
                  className="px-4 py-3"
                  disabled={isLinking || selectedSeries.Type === SeriesTypeEnum.Unknown}
                >
                  Range Fill
                </Button>
                <Button onClick={cancelChanges} buttonType="secondary" className="px-4 py-3" disabled={isLinking}>
                  Cancel
                </Button>
                <Button
                  onClick={saveChanges}
                  buttonType="primary"
                  className="px-4 py-3"
                  disabled={isLinking || selectedSeries.Type === SeriesTypeEnum.Unknown}
                  loading={isLinking}
                >
                  Save
                </Button>
              </div>
            </div>
          </ShokoPanel>
        </div>

        <div className="mt-8 flex h-full w-full grow gap-x-8 overflow-y-auto rounded-lg border border-panel-border bg-panel-background p-8">
          <div
            className={cx(
              'grid gap-y-2 gap-x-8 auto-rows-min',
              selectedSeries?.ID ? 'w-full grid-cols-2' : 'w-1/2 grid-cols-1',
            )}
          >
            <div className="flex justify-between rounded-md border border-panel-border bg-panel-background-alt p-4 font-semibold">
              Selected Files
              <Icon size={1} path={mdiSortAlphabeticalAscending} />
            </div>
            {selectedSeries?.ID && (
              <div className="flex rounded-md border border-panel-border bg-panel-background-alt p-4 font-semibold">
                AniDB |&nbsp;
                <a
                  className="flex cursor-pointer font-semibold text-panel-text-primary"
                  href={`https://anidb.net/anime/${selectedSeries.ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedSeries.ID}
                  &nbsp;-&nbsp;
                  {selectedSeries.Title}
                  <Icon path={mdiOpenInNew} size={1} className="ml-3" />
                </a>
                <Button onClick={editSelectedSeries} className="ml-auto text-panel-text-primary" disabled={isLinking}>
                  <Icon path={mdiPencilCircleOutline} size={1} />
                </Button>
              </div>
            )}
            {selectedSeries.ID ? renderDynamicFileLinks() : renderStaticFileLinks()}
          </div>
          {!selectedSeries?.ID && (
            <AnimeSelectPanel
              updateSelectedSeries={updateSelectedSeries}
              seriesUpdating={seriesUpdating}
              placeholder={initialSearchName}
            />
          )}
        </div>
      </TransitionDiv>
      <RangeFillModal show={showRangeFillModal} onClose={closeRangeFill} rangeFill={rangeFill} />
    </>
  );
}

export default LinkFilesTab;
