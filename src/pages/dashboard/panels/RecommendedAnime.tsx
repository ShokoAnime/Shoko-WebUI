import React from 'react';
import { useSelector } from 'react-redux';
import { mdiEyeArrowRightOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useRecommendedAnimeQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { RootState } from '@/core/store';
import type { SeriesAniDBType } from '@/core/types/api/series';

const RecommendedAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const recommendedAnimeQuery = useRecommendedAnimeQuery({
    includeRestricted: !hideR18Content,
    pageSize: 20,
  });

  const renderItem = (series: SeriesAniDBType, matches: number) => (
    <div key={`series-${series.ID}`} className="mr-4 flex w-56 shrink-0 flex-col justify-center last:mr-0">
      <BackgroundImagePlaceholderDiv
        image={series.Poster}
        className="group mb-2 h-80 rounded border border-panel-border drop-shadow-md"
      >
        <div
          className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center bg-panel-background-transparent text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() =>
            window.open(`https://anidb.net/anime/${series.ID}`, '_blank')}
        >
          <div className="mb-1 rounded-full border border-panel-border bg-panel-background-alt p-5">
            <Icon path={mdiEyeArrowRightOutline} size={1} className="text-panel-text-primary" />
          </div>
          View Series on AniDB
        </div>
      </BackgroundImagePlaceholderDiv>
      <p className="truncate text-center text-base font-semibold" title={series.Title}>{series.Title}</p>
      <p className="truncate text-center text-sm" title={`${matches} Matches`}>
        {matches}
        &nbsp;Matches
      </p>
    </div>
  );

  return (
    <ShokoPanel title="Recommended Anime" isFetching={recommendedAnimeQuery.isPending} editMode={layoutEditMode}>
      <div className="shoko-scrollbar flex">
        {(recommendedAnimeQuery.data?.length ?? 0) > 0
          ? recommendedAnimeQuery.data?.map(item => renderItem(item.Anime, item.SimilarTo))
          : (
            <div className="mt-4 flex w-full flex-col justify-center gap-y-2 text-center">
              <div>No Recommended Anime!</div>
              <div>Watch Anime To Populate This Section.</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default RecommendedAnime;
