import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import cx from 'classnames';
import { toNumber } from 'lodash';

import { useSeriesOverviewQuery } from '@/core/react-query/webui/queries';
import { resetFilter, setFilterValues } from '@/core/slices/collection';
import { convertTimeSpanToMs, dayjs } from '@/core/util';
import { addFilterCriteriaToStore } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesType } from '@/core/types/api/series';
import type { WebuiSeriesDetailsType } from '@/core/types/api/webui';

type SeriesInfoProps = {
  series: SeriesType;
};

const SeriesInfo = ({ series }: SeriesInfoProps) => {
  const { i18n, t } = useTranslation('series');
  const { seriesId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  // Series Data;
  const seriesOverviewQuery = useSeriesOverviewQuery(toNumber(seriesId!), !!seriesId);
  const overview = seriesOverviewQuery?.data ?? {} as WebuiSeriesDetailsType;
  const startDate = useMemo(() => (series.AniDB?.AirDate != null ? dayjs(series.AniDB?.AirDate) : null), [series]);
  const endDate = useMemo(() => (series.AniDB?.EndDate != null ? dayjs(series.AniDB?.EndDate) : null), [series]);
  const airDate = useMemo(() => {
    const isChinese = i18n.language.startsWith('zh');
    const dateFormat = isChinese ? 'YYYY.MM.DD' : 'MMM DD, YYYY';
    if (!startDate) {
      return t('overview.details.unknown');
    }
    const formatted = startDate.format(dateFormat);
    if (endDate) {
      const formattedEnd = endDate.format(dateFormat);
      if (formatted === formattedEnd) {
        return formatted;
      }
      return t('overview.details.airdate_range', { start: formatted, end: formattedEnd });
    }
    return t('overview.details.airdate_ongoing', { start: formatted });
  }, [i18n.language, startDate, endDate, t]);

  const status = useMemo(() => {
    if (!startDate) {
      return t('overview.details.unknown');
    }
    if (!endDate || endDate.isAfter(dayjs())) {
      return t('overview.details.currently_airing');
    }
    return t('overview.details.finished');
  }, [startDate, endDate, t]);

  const handleSeasonFilter = useEventCallback(() => {
    if (!overview.FirstAirSeason) return;
    dispatch(resetFilter());
    const [season, year] = overview.FirstAirSeason.split(' ');
    addFilterCriteriaToStore('InSeason').then(() => {
      dispatch(setFilterValues({ InSeason: [`${year}: ${season}`] }));
      navigate('/webui/collection/filter/live');
    }).catch(console.error);
  });

  if (!seriesId) return null;

  return (
    <>
      <div className="flex w-full flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <div className="font-semibold">{t('overview.details.type')}</div>
          <div className="truncate">
            &nbsp;
            {series?.AniDB?.Type}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">{t('overview.details.source')}</div>
          <div className="truncate">
            &nbsp;
            {overview.SourceMaterial}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">{t('overview.details.airdate')}</div>
          <div className="truncate">
            &nbsp;
            {airDate}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">{t('overview.details.status')}</div>
          {/* TODO: Check if there are more status types */}
          <div className="truncate">
            &nbsp;
            {status}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <div className="font-semibold">
            {t('overview.details.episodes')}
            &nbsp;
          </div>
          <div className="truncate">
            {t('overview.episode_count', { count: series?.Sizes.Total.Episodes ?? 0 })}
            <span className="mx-1">|</span>
            {t('overview.special_count', { count: series?.Sizes.Total.Specials ?? 0 })}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">{t('overview.details.length')}</div>
          <div className="truncate">
            &nbsp;
            {overview.RuntimeLength
              ? t('overview.details.mins_per_episode', {
                minutes: Math.round(dayjs.duration(convertTimeSpanToMs(overview.RuntimeLength)).asMinutes()),
              })
              : t('overview.details.not_available')}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">{t('overview.details.season')}</div>
          <div
            className={cx(
              'truncate',
              overview.FirstAirSeason && 'cursor-pointer font-semibold text-panel-text-primary',
            )}
            onClick={handleSeasonFilter}
          >
            &nbsp;
            {overview?.FirstAirSeason ?? t('overview.details.not_available')}
          </div>
        </div>
        <div className="flex justify-between capitalize">
          <div className="font-semibold">{t('overview.details.studio')}</div>
          <div className="truncate">
            &nbsp;
            {overview?.Studios?.[0]
              ? overview?.Studios?.[0].Name
              : t('overview.details.studio_not_listed')}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesInfo;
