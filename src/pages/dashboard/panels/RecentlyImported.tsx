import React, { useState } from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';

import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { RootState } from '../../../core/store';

import { DashboardEpisodeDetailsType } from '../../../core/types/api/dashboard';
import { SeriesType } from '../../../core/types/api/series';

const Title = ({ showSeries, setShowSeries }) => (<div>
  <span className="px-2">&gt;</span>
  <span className={cx({ 'font-semibold': showSeries === false, 'text-highlight-1': showSeries === false })} onClick={() => { setShowSeries(false);}}>Episodes</span>
<span className="mx-2">|</span>
<span className={cx({ 'font-semibold': showSeries, 'text-highlight-1': showSeries })} onClick={() => { setShowSeries(true);}}>Series</span>
</div>
);

const RecentlyImported = () => {
  const [showSeries, setShowSeries] = useState(false);
  const episodes = useSelector((state: RootState) => state.mainpage.recentEpisodes);
  const series = useSelector((state: RootState) => state.mainpage.recentSeries);

  const renderEpisodeDetails = (item: DashboardEpisodeDetailsType) => {
    const {
      Title: episodeName,
      Number: episodeNumber,
      SeriesPoster: {
        Source: seriesImageSource,
        ID: seriesImageID,
      },
      SeriesTitle: seriesTitle,
    } = item;
    return (<div key={`file-${item.IDs.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${seriesImageSource}/Poster/${seriesImageID}')` }} className="h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black mb-2" />
      <p className="truncate text-center text-base font-semibold" title={seriesTitle}>{seriesTitle}</p>
      <p className="truncate text-center text-sm" title={`${episodeNumber} - ${episodeName}`}>{episodeNumber} - {episodeName}</p>
    </div>);
  };

  const renderSeriesDetails = (item: SeriesType) => {
    const {
      Name: seriesTitle,
      Size: fileCount,
    } = item;
    const {
      ID: seriesImageID,
      Source: seriesImageSource,
    } = item.Images.Posters[0];
    return (<div key={`file-${item.IDs.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${seriesImageSource}/Poster/${seriesImageID}')` }} className="h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black mb-2" />
      <p className="truncate text-center text-base font-semibold" title={seriesTitle}>{seriesTitle}</p>
      <p className="truncate text-center text-sm" title={`${fileCount} Files`}>{fileCount} Files</p>
    </div>);
  };

  return (
    <ShokoPanel title="Recently Imported" titleTabs={<Title showSeries={showSeries} setShowSeries={setShowSeries} />}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">{showSeries ? (
        series.map(renderSeriesDetails)
      ) : (
        episodes.map(renderEpisodeDetails)
      )}</div>
    </ShokoPanel>
  );
};

export default RecentlyImported;