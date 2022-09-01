import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { forEach, groupBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Input/Button';
import ComboBox from '../../../../components/Input/ComboBox';
import SelectList from '../../../../components/Input/SelectList';
import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import { RootState } from '../../../../core/store';
import { useLazyGetSeriesEpisodesQuery, useRefreshAnidbSeriesMutation, useLazyGetSeriesAniDBSearchQuery } from '../../../../core/rtkQuery/seriesApi';
import { setLinks, setSelectedSeries, setLinksEpisode } from '../../../../core/slices/utilities/unrecognized';



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
  
  const [ epType, setEpType ] = useState('1');
  const episodeTypeOptions = [
    { value: '0', label: 'Special' },
    { value: '1', label: 'Episode' },
  ];
  
  const episodeOptions = useMemo(() => episodes.map(item => ({ value: item.IDs.ID, label: item.Name })), [episodes]);
  const groupedLinks = useMemo(() => groupBy(links, 'FileID'), [links]);
  
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
          <div className={cx(['px-3 py-3.5 w-full bg-background-nav border border-background-border rounded-md', selectedSeries?.ID && 'mt-4', idx !== 0 && 'opacity-10' ])} key={`${link.FileID}-${link.EpisodeID}-${idx}`}>
            <SelectList className="w-72" options={episodeOptions} emptyValue="Select episode" value={link.EpisodeID} onChange={value => dispatch(setLinksEpisode({ ...link, EpisodeID: value }))} />
          </div>,
        );
      });
    });
    return result;
  };

  return (
    <ShokoPanel title={renderTitle()} className="w-1/2">
      <div className="flex flex-row space-x-3 justify-end">
        <ComboBox className="w-72" options={episodeTypeOptions} value={epType} onChange={value => setEpType(`${value}`)} />
        <Input inline label="Range Start" type="text" id="range" value="" onChange={() => {}} className="w-40"/>
        <Button className="bg-background-alt py-2 px-2 mr-2" onClick={() => {}}>Range Fill</Button>
        <Button className={cx('bg-highlight-1 py-2 px-2 mr-2', { 'hidden': selectedSeries.ShokoID !== null })} loading={anidbGetQuery.isLoading || anidbRefreshQuery.isLoading} onClick={refreshAniDB}>Fetch data</Button>
      </div>
      {renderEpisodeLinks()}
    </ShokoPanel>
  );
}

export default EpisodeLinkPanel;
