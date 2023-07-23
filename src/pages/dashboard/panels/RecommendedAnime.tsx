import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import { mdiEyeArrowRightOutline } from '@mdi/js';

import { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';

import { useGetAniDBRecommendedAnimeQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import type { SeriesAniDBType } from '@/core/types/api/series';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';

const RecommendedAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetAniDBRecommendedAnimeQuery({ pageSize: 20 });

  const renderItem = (series: SeriesAniDBType, matches: number) => (
    <div key={`series-${series.ID}`} className="mr-4 last:mr-0 shrink-0 w-56 justify-center flex flex-col">
      <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/AniDB/Poster/${series.Poster.ID}`} className="relative h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border mb-2 group">
        <div
          className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full font-semibold text-sm cursor-pointer bg-panel-background/85 transition-opacity opacity-0 group-hover:opacity-100"
          onClick={() => window.open(`https://anidb.net/anime/${series.ID}`, '_blank')}
        >
          <div className="p-5 bg-panel-border rounded-full mb-1">
            <Icon path={mdiEyeArrowRightOutline} size={1} className="text-panel-primary" />
          </div>
          View Series on AniDB
        </div>
      </BackgroundImagePlaceholderDiv>
      <p className="truncate text-center text-base font-semibold" title={series.Title}>{series.Title}</p>
      <p className="truncate text-center text-sm" title={`${matches} Matches`}>{matches} Matches</p>
    </div>
  );

  return (
    <ShokoPanel title="Recommended Anime" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex shoko-scrollbar">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => renderItem(item.Anime, item.SimilarTo))
          : (
            <div className="flex flex-col justify-center mt-4 w-full text-center gap-y-2">
              <div>No Recommended Anime!</div>
              <div>Watch Anime To Populate This Section.</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default RecommendedAnime;
