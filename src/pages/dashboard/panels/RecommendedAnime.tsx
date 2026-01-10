import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import SeriesPoster from '@/components/SeriesPoster';
import { useRecommendedAnimeQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { RootState } from '@/core/store';

const RecommendedAnime = () => {
  const { t } = useTranslation('panels');
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const recommendedAnimeQuery = useRecommendedAnimeQuery({
    includeRestricted: !hideR18Content,
    pageSize: 20,
  });

  return (
    <ShokoPanel
      title={t('recommendedAnime.title')}
      isFetching={recommendedAnimeQuery.isPending}
      editMode={layoutEditMode}
      contentClassName="!flex-row gap-x-6"
    >
      {(!recommendedAnimeQuery.data || recommendedAnimeQuery.data.length === 0) && (
        <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
          <div>{t('recommendedAnime.emptyTitle')}</div>
          <div>{t('recommendedAnime.emptyDescription')}</div>
        </div>
      )}

      {map(
        recommendedAnimeQuery.data,
        item => (
          <SeriesPoster
            key={item.Anime.ID}
            image={item.Anime.Poster}
            title={item.Anime.Title}
            subtitle={t('recommendedAnime.similarMatches', { count: item.SimilarTo })}
            shokoId={item.Anime.ShokoID}
            anidbSeriesId={item.Anime.ID}
            inCollection={!!item.Anime.ShokoID}
          />
        ),
      )}
    </ShokoPanel>
  );
};

export default RecommendedAnime;
