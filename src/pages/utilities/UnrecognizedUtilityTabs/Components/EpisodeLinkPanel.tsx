import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { forEach, groupBy, orderBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollSyncPane } from 'react-scroll-sync';

import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Input/Button';
import ComboBox from '../../../../components/Input/ComboBox';
import SelectEpisodeList from '../../../../components/Input/SelectEpisodeList';
import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import { RootState } from '../../../../core/store';
import { useLazyGetSeriesEpisodesQuery, useRefreshAnidbSeriesMutation, useLazyGetSeriesAniDBSearchQuery } from '../../../../core/rtkQuery/seriesApi';
import {
  setLinks,
  setSelectedSeries,
  setLinksEpisode,
  setManualLink,
} from '../../../../core/slices/utilities/unrecognized';
import { SeriesAniDBSearchResult } from '../../../../core/types/api/series';



function EpisodeLinkPanel() {
  const { selectedSeries, selectedRows, links } = useSelector((state: RootState) => state.utilities.unrecognized );
  const [updateEpisodes, episodesQuery] = useLazyGetSeriesEpisodesQuery();
  const [refreshSeries, anidbRefreshQuery] = useRefreshAnidbSeriesMutation();
  const [getAnidbSeries, anidbGetQuery] = useLazyGetSeriesAniDBSearchQuery();
  const episodes = episodesQuery?.data || [];
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (selectedSeries.ShokoID === null) { return; }
    updateEpisodes({ seriesId: selectedSeries.ShokoID }).catch(() => {});
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
  
  const [ epType, setEpType ] = useState('1');
  const episodeTypeOptions = [
    { value: '0', label: 'Special' },
    { value: '1', label: 'Episode' },
  ];
  
  const episodeOptions = useMemo(() => episodes.map(item => ({ value: item.IDs.ID, label: item.Name })), [episodes]);
  const groupedLinks = useMemo(() => groupBy(orderBy(links, ['FileID', 'asc']), 'FileID'), [links]);
  
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
  
  const renderTitle = () => (
    <div className="flex gap-x-1 items-center">
      <span>AniDB</span>|
      <span className="text-highlight-2">{selectedSeries.ID} - {selectedSeries.Title}</span>
    </div>
  );
  
  const renderEpisodeLinks = () => {
    const result: React.ReactNode[] = [];
    forEach(groupedLinks, (episodeLinks) => {
      forEach(episodeLinks, (link, idx) => {
        result.push(
          <div className={cx(['px-3 mb-3', idx !== 0 && 'opacity-10'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`}>
            <SelectEpisodeList options={episodeOptions} emptyValue="Select episode" value={link.EpisodeID} onChange={value => dispatch(setLinksEpisode({ ...link, EpisodeID: value }))} />
          </div>,
        );
      });
    });
    return result;
  };

  return (
    <ShokoPanel title={renderTitle()} className="w-1/2">
      <div className="flex flex-row space-x-3 justify-end mb-3.5">
        <ComboBox className="w-72" options={episodeTypeOptions} value={epType} onChange={value => setEpType(`${value}`)} />
        <Input inline label="Range Start" type="text" id="range" value="" onChange={() => {}} className="w-40"/>
        <Button className="bg-background-alt py-2 px-2 mr-2" onClick={() => {}}>Range Fill</Button>
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
