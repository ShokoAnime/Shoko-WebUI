import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { mdiTagTextOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import AnidbDescription from '@/components/Collection/AnidbDescription';
import SeriesInfo from '@/components/Collection/SeriesInfo';
import SeriesUserStats from '@/components/Collection/SeriesUserStats';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useSeriesImagesQuery, useSeriesTagsQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { resetFilter, setFilterTag } from '@/core/slices/collection';
import { addFilterCriteriaToStore } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

type SeriesSidePanelProps = {
  series: SeriesType;
};

const SeriesTag = React.memo(({ text, type }: { text: string, type: 'User' | 'AniDB' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleClick = useEventCallback(() => {
    dispatch(resetFilter());
    addFilterCriteriaToStore('HasTag').then(() => {
      dispatch(setFilterTag({ HasTag: [{ Name: text, isExcluded: false }] }));
      navigate('/webui/collection');
    }).catch(console.error);
  });

  return (
    <div
      className={cx(
        'text-sm font-semibold flex gap-x-3 items-center border-2 border-panel-tags rounded-lg py-2 px-3 whitespace-nowrap capitalize h-fit cursor-pointer',
        type === 'User' ? 'text-panel-icon-important' : 'text-panel-icon-action',
      )}
      onClick={handleClick}
    >
      <Icon path={mdiTagTextOutline} size="1.25rem" />
      <span className="text-panel-text">{text}</span>
    </div>
  );
});

const SeriesTopPanel = React.memo(({ series }: SeriesSidePanelProps) => {
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

  // TODO: try to make this a grid for better responsiveness... but we'll have v3 soon so maybe not right now.
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
      <div className="flex w-full max-w-[56.25rem] flex-col gap-y-6">
        <ShokoPanel
          title="Series Description"
          className="!h-[16.5rem]"
          contentClassName="contain-strict"
          transparent
        >
          <AnidbDescription text={series.AniDB?.Description ?? ''} />
        </ShokoPanel>

        <ShokoPanel
          title="Series Information"
          className="!h-[14.5rem]"
          transparent
        >
          <div className="shoko-scrollbar grid h-32 grid-cols-1 gap-x-12 gap-y-2 overflow-y-auto pr-2 text-base font-normal 2xl:grid-cols-2 2xl:pr-0">
            <SeriesInfo series={series} />
          </div>
        </ShokoPanel>
      </div>
      <div className="flex w-full flex-col gap-y-6">
        <ShokoPanel
          title="Top 10 Tags"
          className="!h-[16.5rem]"
          contentClassName="!flex-row flex-wrap gap-3 content-start contain-strict"
          isFetching={tagsQuery.isFetching}
          transparent
        >
          {tags.slice(0, 10)
            .map(tag => <SeriesTag key={tag.ID} text={tag.Name} type={tag.Source} />)}
        </ShokoPanel>

        <ShokoPanel
          title="User Stats"
          className="!h-[14.5rem]"
          contentClassName="flex-wrap gap-3"
          transparent
        >
          <SeriesUserStats series={series} />
        </ShokoPanel>
      </div>
    </div>
  );
});

export default SeriesTopPanel;
