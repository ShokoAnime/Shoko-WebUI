import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import React, { useState } from 'react';
import { DashboardEpisodeDetailsType } from '../../../core/types/api/dashboard';
import moment from 'moment';
import cx from 'classnames';

const Title = ({ showAll, setShowAll }) => (<div>
    <span className="px-2">&gt;</span>
    <span className={cx({ 'font-semibold': showAll === false, 'text-highlight-1': showAll === false })} onClick={() => { setShowAll(true);}}>My Collection</span>
  <span className="mx-2">|</span>
  <span className={cx({ 'font-semibold': showAll, 'text-highlight-1': showAll })} onClick={() => { setShowAll(false);}}>All</span>
</div>
);

const UpcomingAnime = () => {
  const items = useSelector((state: RootState) => state.mainpage.upcomingAnime);
  const [showAll, setShowAll] = useState(false);

  const renderDetails = (item: DashboardEpisodeDetailsType ) => {
    const airDate = moment(item.AirDate);
    
    return (<div key={`file-${item.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 h-[25.5rem] font-open-sans content-center flex flex-col">
      <p className="truncate text-center text-base font-semibold">{airDate.format('MMMM Mo, YYYY')}</p>
      <p className="truncate text-center text-sm">{airDate.toNow()}</p>
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${item.SeriesPoster.Source}/Poster/${item.SeriesPoster.ID}')` }} className="grow rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
      <p className="truncate text-center text-base font-semibold" title={item.SeriesTitle}>{item.SeriesTitle}</p>
      <p className="truncate text-center text-sm" title={`${item.Number} - ${item.Title}`}>{item.Number} - {item.Title}</p>
    </div>);
  };
  //TODO: make title tabs actually switch stuff 
  return (
    <ShokoPanel title="Upcoming Anime" titleTabs={<Title showAll={showAll} setShowAll={setShowAll} />}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">{items.map(item => renderDetails(item))}</div>
    </ShokoPanel>
  );
};

export default UpcomingAnime;