import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiTagPlusOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { toNumber } from 'lodash';
import { useToggle } from 'usehooks-ts';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import CleanDescription from '@/components/Collection/CleanDescription';
import SeriesInfo from '@/components/Collection/SeriesInfo';
import SeriesUserStats from '@/components/Collection/SeriesUserStats';
import TagButton from '@/components/Collection/TagButton';
import CustomTagModal from '@/components/Dialogs/CustomTagModal';
import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useSeriesImagesQuery, useSeriesTagsQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

const SeriesTopPanel = React.memo(({ series }: { series: SeriesType }) => {
  const { seriesId } = useParams();

  const tagsQuery = useSeriesTagsQuery(toNumber(seriesId!), { excludeDescriptions: true, filter: 1 }, !!seriesId);
  const tags = useMemo(() => tagsQuery?.data ?? [], [tagsQuery.data]);

  const { showRandomPoster } = useSettingsQuery().data.WebUI_Settings.collection.image;
  const imagesQuery = useSeriesImagesQuery(toNumber(seriesId!), !!seriesId && showRandomPoster);
  const [poster, setPoster] = useState<ImageType>();
  const [showTagModal, toggleTagModal] = useToggle(false);

  useEffect(() => {
    if (!showRandomPoster) {
      setPoster(series.Images?.Posters?.[0]);
      return;
    }

    const allPosters = imagesQuery.data?.Posters ?? [];
    if (allPosters.length === 0) return;

    setPoster(allPosters[Math.floor(Math.random() * allPosters.length)]);
  }, [imagesQuery.data, series, showRandomPoster]);

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
          className="!h-64"
          contentClassName="contain-strict"
          transparent
        >
          <CleanDescription
            text={series.Description ?? ''}
            altText={series.TMDB?.Shows[0]?.Overview ?? series.TMDB?.Movies[0]?.Overview ?? ''}
          />
        </ShokoPanel>

        <ShokoPanel
          title="Series Information"
          className="!h-60"
          transparent
        >
          <div className="grid h-32 grid-cols-1 gap-x-12 gap-y-2 overflow-y-auto pr-2 text-base font-normal 2xl:grid-cols-2 2xl:pr-0">
            <SeriesInfo series={series} />
          </div>
        </ShokoPanel>
      </div>
      <div className="flex w-full flex-col gap-y-6">
        <ShokoPanel
          title="Top 10 Tags"
          className="!h-64"
          contentClassName="!flex-row flex-wrap gap-3 content-start contain-strict"
          isFetching={tagsQuery.isFetching}
          transparent
          options={
            <div className="flex gap-x-2">
              <Button onClick={toggleTagModal} tooltip="Edit Tags">
                <Icon className="text-panel-icon-important" path={mdiTagPlusOutline} size={1} />
              </Button>
            </div>
          }
        >
          <CustomTagModal seriesId={toNumber(seriesId)} show={showTagModal} onClose={toggleTagModal} />
          {tags.slice(0, 10)
            .map(tag => <TagButton key={tag.ID} text={tag.Name} tagType={tag.Source} type="Series" />)}
        </ShokoPanel>

        <ShokoPanel
          title="User Stats"
          className="!h-60"
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
