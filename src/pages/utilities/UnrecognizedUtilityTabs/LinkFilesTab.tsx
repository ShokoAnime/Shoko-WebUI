import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '@/core/store';
import TransitionDiv from '@/components/TransitionDiv';
import { Title } from '../UnrecognizedUtility';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Button from '@/components/Input/Button';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import {
  mdiDownloadCircleOutline,
  mdiLink,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiPencilCircleOutline,
  mdiPlusCircleMultipleOutline,
  mdiSortAlphabeticalAscending,
} from '@mdi/js';
import { debounce, filter, find, findIndex, forEach, groupBy, orderBy, toInteger, toNumber } from 'lodash';
import {
  addLinkEpisode,
  ManualLink,
  removeLinkEpisode,
  setLinks,
  setLinksEpisode,
} from '@/core/slices/utilities/unrecognized';
import {
  useLazyGetSeriesAniDBSearchQuery,
  useLazyGetSeriesEpisodesQuery,
  useRefreshAnidbSeriesMutation,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import { SeriesAniDBSearchResult } from '@/core/types/api/series';
import Input from '@/components/Input/Input';
import { formatThousand } from '@/core/util';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import toast from '@/components/Toast';
import SelectEpisodeList from '@/components/Input/SelectEpisodeList';
import { FileLinkApiType } from '@/core/types/api/file';
import { useGetFileUnrecognizedQuery, usePostFileLinkMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';

const Menu = ({ link }: { link: ManualLink }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex grow gap-x-4">
      <MenuButton onClick={() => dispatch(addLinkEpisode(link!))} icon={mdiPlusCircleMultipleOutline} name="Duplicate Entry" />
      <MenuButton onClick={() => dispatch(removeLinkEpisode(link!))} icon={mdiMinusCircleOutline} name="Remove Entry" />
    </div>
  );
};

function LinkFilesTab() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { links, selectedRows } = useSelector((state: RootState) => state.utilities.unrecognized);
  if (selectedRows.length === 0) navigate('files', { replace: true }); //replace

  const [selectedSeries, setSelectedSeries] = useState({} as SeriesAniDBSearchResult);
  const [searchText, setSearchText] = useState('');
  const [selectedLink, setSelectedLink] = useState<number>(-1);

  const updateSelectedLink = (idx: number) => {
    if (selectedLink === idx) setSelectedLink(-1);
    else setSelectedLink(idx);
  };

  useEffect(() => {
    setSelectedLink(-1);
  }, [links]);

  const [updateEpisodes, episodesQuery] = useLazyGetSeriesEpisodesQuery();
  const [refreshSeries, anidbRefreshQuery] = useRefreshAnidbSeriesMutation();
  const [getAnidbSeries, anidbGetQuery] = useLazyGetSeriesAniDBSearchQuery();
  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();
  const [fileLinkEpisodesTrigger] = usePostFileLinkMutation();
  const filesQuery = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const episodes = episodesQuery?.data?.List || [];

  useEffect(() => {
    if (!selectedSeries.ShokoID) { return; }
    updateEpisodes({ seriesID: selectedSeries.ShokoID, pageSize: 0, includeMissing: 'true', includeDataFrom: ['AniDB', 'TvDB'] }).catch(() => {});
  }, [selectedSeries.ShokoID]);

  useEffect(() => {
    // if (links.length > 0 || episodes.length === 0) { return; }
    if (links.length > 0) return;
    const newLinks = selectedRows.map(file => ({ FileID: file.ID, EpisodeID: 0 }));
    dispatch(setLinks(newLinks));
  }, [episodes, links]);

  const updateSelectedSeries = (series: SeriesAniDBSearchResult) => {
    setSelectedSeries(series);
    dispatch(setLinks([]));
  };

  const [ epType, setEpType ] = useState('Normal');
  const episodeTypeOptions = [
    { value: 'Special', label: 'Special' },
    { value: 'Normal', label: 'Episode' },
  ];
  const [ rangeStart, setRangeStart ] = useState('');

  const episodeOptions = useMemo(() => episodes.map(item => ({ value: item.IDs.ID, AirDate: item?.AniDB?.AirDate ?? '', label: `${item.Name}`, type: item?.AniDB?.Type ?? '' as EpisodeTypeEnum, number: item?.AniDB?.EpisodeNumber ?? 0 })), [episodes]);
  const groupedLinks = useMemo(() => orderBy<ManualLink>(links, (item) => {
    const file = find(selectedRows, ['ID', item.FileID]);
    return file?.Locations?.[0].RelativePath ?? item.FileID;
  }), [links, selectedRows]);
  const groupedLinksMap = useMemo(() => groupBy(links, 'EpisodeID'), [links]);

  const refreshAniDB = async () => {
    const result:any = await refreshSeries({ anidbID: selectedSeries.ID });
    if (result.error) {
      return;
    }
    const series = await getAnidbSeries({ query: `${selectedSeries.ID}` });
    if (series.error) {
      return;
    }
    if (series?.data) {
      setSelectedSeries(series.data[0]);
    }
  };

  const rangeFill = () => {
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
    forEach(groupedLinks, (link) => {
      const ep = filtered.shift();
      if (!ep) { return; }
      dispatch(setLinksEpisode({ ...link, EpisodeID: ep.value }));
    });
  };

  const debouncedSearch = useRef(
    debounce( (query: string) => {
      searchTrigger({ query, pageSize: 20 }).catch(() => {});
    }, 200),
  ).current;

  const handleSearch = (query: string) => {
    setSearchText(query);
    if (query !== '')
      debouncedSearch(query);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const renderRow = (data: SeriesAniDBSearchResult) => (
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
      &nbsp;&nbsp;|&nbsp;&nbsp;{data.Title}
      <div className="ml-auto">{data.Type}&nbsp;&nbsp;|&nbsp;&nbsp;</div>
      <div className="w-10">{data.EpisodeCount ? formatThousand(data.EpisodeCount) : '-'}</div>
    </div>
  );

  const searchRows: Array<React.ReactNode> = [];
  forEach(searchResults.data, (result) => {
    searchRows.push(renderRow(result));
  });

  const fileLinks = useMemo(() => orderBy<ManualLink>(links, (item) => {
    const file = find(selectedRows, ['ID', item.FileID]);
    return file?.Locations?.[0].RelativePath ?? item.FileID;
  }), [links]);

  const renderFileLinks = () => {
    const result: React.ReactNode[] = [];
    forEach(fileLinks, (link, idx) => {
      const file = find(selectedRows, ['ID', link.FileID]);
      const path = file?.Locations?.[0].RelativePath ?? '';
      const isSameFile = idx > 0 && fileLinks[idx - 1].FileID === link.FileID;
      result.push(
        <div title={path} className={cx(['flex items-center p-4 w-full border border-background-border rounded-md leading-loose col-start-1 cursor-pointer transition-colors', idx % 2 === 0 ? 'bg-background-alt' : 'bg-background', selectedLink === idx && 'border-highlight-1'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`} data-file-id={link.FileID} onClick={() => updateSelectedLink(idx)}>
          {path}
          {isSameFile && (<Icon path={mdiLink} size={1} className="text-highlight-2 ml-auto" />)}
        </div>,
      );
      if (episodes.length > 0) {
        result.push(
          <div data-file-id={link.FileID} key={`${link.FileID}-${link.EpisodeID}-${idx}-select`}>
            <SelectEpisodeList rowIdx={idx} options={episodeOptions} emptyValue="Select episode" value={link.EpisodeID} onChange={value => dispatch(setLinksEpisode({ ...link, EpisodeID: value }))} />
          </div>,
        );
      } else if (idx === 0) {
        result.push(
          <Button className="bg-highlight-1 flex items-center justify-center px-3 py-4 font-semibold" key="populate-button" loading={anidbGetQuery.isLoading || anidbRefreshQuery.isLoading} onClick={refreshAniDB}>
            <Icon path={mdiDownloadCircleOutline} size={1} className="mr-2" />
            Populate Series Episode Data
          </Button>,
        );
      }
    });

    return result;
  };

  const renderManualLinkFileRows = () => {
    const manualLinkFileRows: Array<React.ReactNode> = [];
    forEach(selectedRows, (file) => {
      manualLinkFileRows.push(
        <div className="p-4 w-full odd:bg-background even:bg-background-alt border border-background-border rounded-md line-clamp-1 leading-loose" key={file.ID}>
          {file.Locations?.[0].RelativePath ?? ''}
        </div>,
      );
    });
    return manualLinkFileRows;
  };

  const makeLinks = () => {
    forEach(groupedLinksMap, async (fileIds, episodeID) => {
      const payload: FileLinkApiType = {
        episodeID: toNumber(episodeID),
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
        toast.success('Episode linking failed!');
        return;
      }

      await filesQuery.refetch();
      dispatch(setLinks([]));
      setSelectedSeries({} as SeriesAniDBSearchResult);
    });
  };

  return (
    <TransitionDiv className="flex flex-col grow w-full h-full">

      <div>
        <ShokoPanel title={<Title />} options={<ItemCount filesCount={selectedRows.length} />}>
          <div className="flex items-center gap-x-3">
            <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative">
              <Menu link={links[selectedLink]} />
            </div>
            <div className="flex gap-x-3 font-semibold">
              {/*TODO: add range fill functionality*/}
              <Button onClick={() => {}} className="bg-background-nav border border-background-border px-4 py-3 text-font-main">Range Fill</Button>
              {/*<Button onClick={() => {}} className="bg-background-nav border border-background-border px-4 py-3 text-font-main">Auto Fill</Button>*/}
              <Button onClick={() => { updateSelectedSeries({} as SeriesAniDBSearchResult); navigate('files'); }} className="bg-background-nav border border-background-border px-4 py-3 text-font-main">Cancel</Button>
              <Button onClick={makeLinks} className="bg-highlight-1 border border-background-border px-4 py-3">Save</Button>
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
              <Button onClick={() => updateSelectedSeries({} as SeriesAniDBSearchResult)} className="ml-auto text-highlight-1">
                <Icon path={mdiPencilCircleOutline} size={1} />
              </Button>
            </div>
          )}
          {selectedSeries?.ID ? renderFileLinks() : renderManualLinkFileRows()}
        </div>
        {!selectedSeries?.ID && (
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
        )}
      </div>
    </TransitionDiv>
  );
}

export default LinkFilesTab;