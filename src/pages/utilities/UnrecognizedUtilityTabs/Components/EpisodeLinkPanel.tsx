import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { filter, find, findIndex, forEach, orderBy, toInteger } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollSyncPane } from 'react-scroll-sync';

import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Input/Button';
import ComboBox from '../../../../components/Input/ComboBox';
import SelectEpisodeList from '../../../../components/Input/SelectEpisodeList';
import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import { RootState } from '../../../../core/store';
import { useLazyGetSeriesEpisodesQuery, useRefreshAnidbSeriesMutation, useLazyGetSeriesAniDBSearchQuery } from '../../../../core/rtkQuery/splitV3Api/seriesApi';
import {
  setLinks,
  setSelectedSeries,
  setLinksEpisode,
  setManualLink,
  addLinkEpisode,
  ManualLink,
} from '../../../../core/slices/utilities/unrecognized';
import { SeriesAniDBSearchResult } from '../../../../core/types/api/series';
import toast from '../../../../components/Toast';
import type { EpisodeTypeEnum } from '../../../../core/types/api/episode';



function EpisodeLinkPanel() {
  const { selectedSeries, selectedRows, links } = useSelector((state: RootState) => state.utilities.unrecognized );
  const [updateEpisodes, episodesQuery] = useLazyGetSeriesEpisodesQuery();
  const [refreshSeries, anidbRefreshQuery] = useRefreshAnidbSeriesMutation();
  const [getAnidbSeries, anidbGetQuery] = useLazyGetSeriesAniDBSearchQuery();
  const episodes = episodesQuery?.data?.List || [];
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedSeries.ShokoID === null) { return; }
    updateEpisodes({ seriesID: selectedSeries.ShokoID, pageSize: 0 }).catch(() => {});
  }, [selectedSeries.ShokoID]);

  useEffect(() => {
    if (links.length > 0 || episodes.length === 0) { return; }
    const newLinks = selectedRows.map(file => ({ FileID: file.ID, EpisodeID: 0 }));
    dispatch(setLinks(newLinks));
  }, [episodes, links]);

  useEffect(() => {
    if (selectedRows.length > 0) { return; }
    dispatch(setManualLink(false));
    dispatch(setSelectedSeries({} as SeriesAniDBSearchResult));
    dispatch(setLinks([]));
  }, [selectedRows]);

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
      dispatch(setSelectedSeries(series.data[0]));
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

  const renderTitle = () => (
    <div className="flex gap-x-1 items-center">
      <span>AniDB</span>|
      <span className="text-highlight-2 line-clamp-1">{selectedSeries.ID} - {selectedSeries.Title}</span>
    </div>
  );

  const renderEpisodeLinks = () => {
    const result: React.ReactNode[] = [];
    forEach(groupedLinks, (link, idx) => {
      result.push(
        <div className="px-3 mb-3" data-file-id={link.FileID} key={`${link.FileID}-${link.EpisodeID}-${idx}`}>
          <SelectEpisodeList options={episodeOptions} emptyValue="Select episode" value={link.EpisodeID} onAddLink={() => dispatch(addLinkEpisode(link))} onChange={value => dispatch(setLinksEpisode({ ...link, EpisodeID: value }))} />
        </div>,
      );
    });
    return result;
  };

  return (
    <ShokoPanel title={renderTitle()} className="w-1/2">
      <div className="flex flex-row space-x-3 justify-end mb-3.5">
        <ComboBox className="w-72" options={episodeTypeOptions} value={epType} onChange={value => setEpType(`${value}`)} />
        <Input inline label="Range Start" type="text" id="range" value={rangeStart} onChange={(event) => { setRangeStart(event.target.value); }} className="w-40"/>
        <Button className="bg-background-alt py-2 px-2 mr-2" onClick={rangeFill}>Range Fill</Button>
        <Button className={cx('bg-highlight-1 py-2 px-2 mr-2', { 'hidden': selectedSeries.ShokoID !== null })} loading={anidbGetQuery.isLoading || anidbRefreshQuery.isLoading} onClick={refreshAniDB}>Fetch data</Button>
      </div>
      <ScrollSyncPane>
        <div className="overflow-y-auto grow basis-0 shoko-scrollbar">
          {renderEpisodeLinks()}
        </div>
      </ScrollSyncPane>
    </ShokoPanel>
  );
}

export default EpisodeLinkPanel;
