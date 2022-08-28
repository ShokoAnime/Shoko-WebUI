import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';

import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Input/Button';
import ComboBox from '../../../../components/Input/ComboBox';
import SelectList from '../../../../components/Input/SelectList';
import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import { RootState } from '../../../../core/store';
import { useLazyGetSeriesEpisodesQuery, useRefreshAnidbSeriesMutation, useLazyGetSeriesAniDBSearchQuery } from '../../../../core/rtkQuery/seriesApi';
import { setSelectedSeries } from '../../../../core/slices/utilities/unrecognized';


function EpisodeLinkPanel() {
  const { selectedSeries, selectedRows } = useSelector((state: RootState) => state.utilities.unrecongnized );
  const [updateEpisodes, episodesQuery] = useLazyGetSeriesEpisodesQuery();
  const [refreshSeries, anidbRefreshQuery] = useRefreshAnidbSeriesMutation();
  const [getAnidbSeries, anidbGetQuery] = useLazyGetSeriesAniDBSearchQuery();
  const episodes = episodesQuery?.data || [];
  
  useEffect(() => {
    if (selectedSeries.ShokoID === null) { return; }
    updateEpisodes({ seriesId: selectedSeries.ShokoID }).catch(() => {});
  }, [selectedSeries.ShokoID]);
  
  const [ epType, setEpType ] = useState('1');
  const episodeTypeOptions = [
    { value: '0', label: 'Special' },
    { value: '1', label: 'Episode' },
  ];
  
  const episodeOptions = useMemo(() => episodes.map(item => ({ value: `${item.IDs.ID}`, label: item.Name })), [episodes]);
  
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

  return (
    <ShokoPanel title={renderTitle()} className="w-1/2">
      <div className="flex flex-row space-x-3 justify-end">
        <ComboBox className="w-72" options={episodeTypeOptions} value={epType} onChange={value => setEpType(`${value}`)} />
        <Input inline label="Range Start" type="text" id="range" value="" onChange={() => {}} className="w-40"/>
        <Button className="bg-background-alt py-2 px-2 mr-2" onClick={() => {}}>Range Fill</Button>
        <Button className={cx('bg-highlight-1 py-2 px-2 mr-2', { 'hidden': selectedSeries.ShokoID !== null })} loading={anidbGetQuery.isLoading || anidbRefreshQuery.isLoading} onClick={refreshAniDB}>Fetch data</Button>
      </div>
      {selectedRows.map(file => (
        <div className={cx(['px-3 py-3.5 w-full bg-background-nav border border-background-border rounded-md', selectedSeries?.ID && 'mt-4'])} key={file.ID}>
          <SelectList className="w-72" options={episodeOptions} emptyValue="Select episode" value="" onChange={value => setEpType(`${value}`)} />
        </div>
      ))}
    </ShokoPanel>
  );
}

export default EpisodeLinkPanel;
