import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import { mdiEyeArrowRightOutline } from '@mdi/js';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';

import { useGetAniDBRecommendedAnimeQuery } from '../../../core/rtkQuery/seriesApi';
import type { SeriesAniDBType } from '../../../core/types/api/series';

const RecommendedAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetAniDBRecommendedAnimeQuery({ pageSize: 20 });

  const renderItem = (series: SeriesAniDBType, matches: number) => (
    <div key={`series-${series.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/AniDB/Poster/${series.Poster.ID}')` }} className="relative h-80 rounded overflow-hidden drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black mb-2">
        <div
          className="flex flex-col items-center justify-center w-full h-full font-semibold text-sm cursor-pointer bg-background-nav/85 transition-opacity opacity-0 hover:opacity-100"
          onClick={() => window.open(`https://anidb.net/anime/${series.ID}`, '_blank')}
        >
          <div className="p-5 bg-background-border rounded-full mb-1">
            <Icon path={mdiEyeArrowRightOutline} size={1} className="text-highlight-1" />
          </div>
          View Series on AniDB
        </div>
      </div>
      <p className="truncate text-center text-base font-semibold" title={series.Title}>{series.Title}</p>
      <p className="truncate text-center text-sm" title={`${matches} Matches`}>{matches} Matches</p>
    </div>
  );

  return (
    <ShokoPanel title="Recommeded Anime" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex shoko-scrollbar">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => renderItem(item.Anime, item.SimilarTo))
          : <div className="flex justify-center font-semibold mt-4 w-full">No recommended anime!</div>
        }
      </div>
    </ShokoPanel>
  );
};

export default RecommendedAnime;
