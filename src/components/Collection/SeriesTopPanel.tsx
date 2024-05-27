import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiTagTextOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import AnidbDescription from '@/components/Collection/AnidbDescription';
import SeriesInfo from '@/components/Collection/SeriesInfo';
import SeriesUserStats from '@/components/Collection/SeriesUserStats';
import { useSeriesImagesQuery, useSeriesTagsQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

type SeriesSidePanelProps = {
  series: SeriesType;
};

const SeriesTag = ({ text, type }) => (
  <div
    className={cx(
      'text-sm font-semibold flex gap-x-3 items-center border-2 border-panel-tags rounded-lg py-2 px-3 whitespace-nowrap capitalize',
      type === 'User' ? 'text-panel-icon-important' : 'text-panel-icon-action',
    )}
  >
    <Icon path={mdiTagTextOutline} size="1.25rem" />
    <span className="text-panel-text">{text}</span>
  </div>
);

const SeriesTopPanel = ({ series }: SeriesSidePanelProps) => {
  const { WebUI_Settings: { collection: { image: { showRandomPoster } } } } = useSettingsQuery().data;
  const [poster, setPoster] = useState<ImageType | null>(null);
  const { seriesId } = useParams();
  const tagsQuery = useSeriesTagsQuery(toNumber(seriesId!), { excludeDescriptions: true }, !!seriesId);
  const imagesQuery = useSeriesImagesQuery(toNumber(seriesId!), !!seriesId);
  const tags = useMemo(() => tagsQuery?.data ?? [], [tagsQuery.data]);

  useEffect(() => {
    if (!imagesQuery.isSuccess) return;

    const allPosters: ImageType[] = imagesQuery.data?.Posters ?? [];
    if (allPosters.length === 0) return;

    if (showRandomPoster) {
      setPoster(allPosters[Math.floor(Math.random() * allPosters.length)]);
      return;
    }
    setPoster(allPosters.find(art => art.Preferred) ?? allPosters[0]);
  }, [imagesQuery.data, imagesQuery.isSuccess, showRandomPoster]);

  return (
    <div className="flex w-full gap-x-6">
      <BackgroundImagePlaceholderDiv
        image={poster}
        className="aspect-[5/6] h-[32.1rem] min-w-[22rem] rounded drop-shadow-md lg:aspect-[4/6]"
      >
        {(series.AniDB?.Restricted ?? false) && (
          <div className="absolute bottom-0 left-0 flex w-full justify-center bg-panel-background-overlay py-1.5 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
            18+ Adults Only
          </div>
        )}
      </BackgroundImagePlaceholderDiv>
      <div className="flex w-full min-w-[56.25rem] flex-col gap-y-6">
        <div className="flex h-[16.25rem] flex-col gap-y-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold lg:gap-x-6">
          <div className="flex w-full text-xl font-semibold">
            Series Description
          </div>
          <div className="overflow-y-auto text-base font-normal">
            <AnidbDescription text={series.AniDB?.Description ?? ''} />
          </div>
        </div>
        <div className="flex flex-col gap-y-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold lg:gap-x-6">
          <div className="flex w-full text-xl font-semibold">
            Series Information
          </div>
          <div className="flex justify-between gap-x-[4.5rem] text-base font-normal">
            <SeriesInfo series={series} />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-6">
        <div className="flex h-[16.25rem] flex-col gap-y-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold lg:gap-x-6">
          <div className="flex w-full text-xl font-semibold">
            Top 10 Tags
          </div>
          <div className="flex flex-wrap gap-3 overflow-y-auto">
            {tags.slice(0, 10)
              .map(tag => <SeriesTag key={tag.ID} text={tag.Name} type={tag.Source} />)}
          </div>
        </div>
        <div className="flex flex-col gap-y-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold lg:gap-x-6">
          <div className="flex w-full text-xl font-semibold">
            User Stats
          </div>
          <div className="flex flex-col flex-wrap gap-3">
            <SeriesUserStats series={series} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesTopPanel;
