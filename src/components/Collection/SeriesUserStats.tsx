import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import SeriesRating from '@/components/Collection/Series/SeriesRating';
import { formatThousand } from '@/core/util';

import type { SeriesType } from '@/core/types/api/series';

type SeriesInfoProps = {
  series: SeriesType;
};

const SeriesUserStats = React.memo(({ series }: SeriesInfoProps) => {
  const { t } = useTranslation('series');
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex justify-between">
        <div className="font-semibold">{t('overview.stats.file_count')}</div>
        <div className="flex flex-row gap-x-1 font-normal">
          <span>{t('overview.episode_count', { count: series.Sizes.Local.Episodes ?? 0 })}</span>
          {series.Sizes.Local.Specials > 0 && (
            <>
              <span>|</span>
              <span>{t('overview.special_count', { count: series.Sizes.Local.Specials })}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <div className="font-semibold">{t('overview.stats.watched')}</div>
        <div className="flex flex-row gap-x-1 font-normal">
          <span>{t('overview.episode_count', { count: series.Sizes.Watched.Episodes ?? 0 })}</span>
          {series.Sizes.Total.Specials > 0 && series.Sizes.Watched.Specials > 0 && (
            <>
              <span>|</span>
              <span>{formatThousand(series.Sizes.Watched.Specials)}</span>
              <span>{t('overview.special_count', { count: series.Sizes.Watched.Specials })}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <div className="font-semibold">{t('overview.stats.missing')}</div>
        {(series.Sizes.Missing.Episodes > 0 || series.Sizes.Missing.Specials > 0)
          ? (
            <div className="flex gap-x-1">
              {series.Sizes.Missing.Episodes > 0 && (
                <Link
                  to="episodes?type=Normal&includeMissing=only&includeUnaired=false"
                  className="text-panel-text-primary"
                >
                  {formatThousand(series.Sizes.Missing.Episodes)}
                  &nbsp;
                  {t('overview.episode_count', { count: series.Sizes.Missing.Episodes })}
                </Link>
              )}
              {series.Sizes.Missing.Episodes > 0 && series.Sizes.Missing.Specials > 0 && <span>|</span>}
              {series.Sizes.Missing.Specials > 0 && (
                <Link
                  to="episodes?type=Special&includeMissing=only&includeUnaired=false"
                  className="text-panel-text-primary"
                >
                  {formatThousand(series.Sizes.Missing.Specials)}
                  &nbsp;
                  {t('overview.special_count', { count: series.Sizes.Missing.Specials })}
                </Link>
              )}
            </div>
          )
          : <div>{t('overview.stats.none_nice_work')}</div>}
      </div>

      <div className="flex items-center justify-between">
        <div className="font-semibold ">
          {t('overview.stats.series_rating')}
          &nbsp;
          {series.UserRating?.Type === 'Temporary' && t('overview.stats.temporary')}
        </div>
        <SeriesRating seriesId={series.IDs.ID} ratingValue={series.UserRating?.Value ?? 0} />
      </div>
    </div>
  );
});

export default SeriesUserStats;
