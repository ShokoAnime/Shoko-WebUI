import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { Link, NavLink, useOutletContext } from 'react-router-dom';
import {
  mdiAccountGroupOutline,
  mdiChevronRight,
  mdiFileDocumentMultipleOutline,
  mdiFilmstrip,
  mdiImageMultipleOutline,
  mdiInformationOutline,
  mdiPencilCircleOutline,
  mdiTagTextOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { get } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import AnidbDescription from '@/components/Collection/AnidbDescription';
import EditSeriesModal from '@/components/Collection/Series/EditSeriesModal';
import SeriesInfo from '@/components/Collection/SeriesInfo';
import { useGetGroupQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import {
  useGetSeriesImagesQuery,
  useGetSeriesQuery,
  useGetSeriesTagsQuery,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import useMainPoster from '@/hooks/useMainPoster';

import type { ImageType } from '@/core/types/api/common';
import type { TagType } from '@/core/types/api/tags';

const SeriesTab = ({ icon, text, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cx(
        'flex items-center gap-x-2',
        isActive && 'text-panel-text-primary',
      )}
  >
    <Icon path={icon} size={1} />
    {text}
  </NavLink>
);

const SeriesTag = ({ text, type }) => (
  <div
    className={cx(
      'text-xs font-semibold flex gap-x-2 items-center border-2 border-panel-tags rounded-md p-2 whitespace-nowrap capitalize',
      type === 'User' ? 'text-panel-icon-important' : 'text-panel-icon-action',
    )}
  >
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-panel-text">{text}</span>
  </div>
);

const Series = () => {
  const { seriesId } = useParams();
  const [fanartUri, setFanartUri] = useState('');
  const [showEditSeriesModal, setShowEditSeriesModal] = useState(false);

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const seriesData = useGetSeriesQuery({ seriesId: seriesId!, includeDataFrom: ['AniDB'] }, {
    refetchOnMountOrArgChange: false,
    skip: !seriesId,
  });
  const series = useMemo(() => seriesData?.data ?? null, [seriesData]);
  const imagesData = useGetSeriesImagesQuery({ seriesId: seriesId! }, { skip: !seriesId });
  const images = useMemo(() => imagesData ?? null, [imagesData]);
  const mainPoster = useMainPoster(series);
  const tagsData = useGetSeriesTagsQuery({ seriesId: seriesId!, excludeDescriptions: true }, { skip: !seriesId });
  const tags: TagType[] = tagsData?.data ?? [] as TagType[];
  const groupData = useGetGroupQuery({ groupId: series?.IDs?.ParentGroup.toString() ?? '' }, {
    skip: !series?.IDs?.ParentGroup,
  });
  const group = groupData?.data ?? null;

  useEffect(() => {
    const allFanarts: ImageType[] = get(images, 'data.Fanarts', []);
    if (!Array.isArray(allFanarts) || allFanarts.length === 0) return;

    const defaultFanart = allFanarts.find(fanart => fanart.Preferred);
    if (defaultFanart) {
      setFanartUri(`/api/v3/Image/${defaultFanart.Source}/${defaultFanart.Type}/${defaultFanart.ID}`);
    }
  }, [images, imagesData]);

  if (!series || !seriesId || !seriesData.isSuccess) return null;

  return (
    <>
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-row gap-x-8">
          <div className="flex w-full max-w-[82.813rem] gap-x-8 rounded-md border border-panel-border bg-panel-background-transparent p-8">
            <BackgroundImagePlaceholderDiv
              image={mainPoster}
              className="h-[25.75rem] w-[18.188rem] rounded drop-shadow-md"
            >
              {(series.AniDB?.Restricted ?? false) && (
                <div className="absolute bottom-0 left-0 flex w-full justify-center bg-panel-background-overlay py-1.5 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
                  18+ Adults Only
                </div>
              )}
            </BackgroundImagePlaceholderDiv>
            <div className="flex w-full max-w-[56.25rem] grow flex-col gap-y-2">
              <div className="flex justify-between">
                <div className="flex gap-x-2">
                  <Link className="font-semibold text-panel-text-primary" to="/webui/collection">
                    Entire Collection
                  </Link>
                  <Icon className="text-panel-icon" path={mdiChevronRight} size={1} />
                  {group && group.Size > 1 && (
                    <>
                      <Link
                        className="font-semibold text-panel-text-primary"
                        to={`/webui/collection/group/${series.IDs.ParentGroup}`}
                      >
                        {group.Name}
                      </Link>
                      <Icon className="text-panel-icon" path={mdiChevronRight} size={1} />
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-y-8">
                <div className="flex flex-col gap-y-4">
                  <div className="text-4xl font-semibold">{series.Name}</div>
                  <div className="text-xl font-semibold opacity-65">
                    Original Title:&nbsp;
                    {series.AniDB?.Titles.find(title => title.Type === 'Main')?.Name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 13).map(tag => <SeriesTag key={tag.ID} text={tag.Name} type={tag.Source} />)}
                    <NavLink to="tags">
                      <SeriesTag text="More..." type="All" />
                    </NavLink>
                  </div>
                </div>
                <AnidbDescription text={series?.AniDB?.Description ?? ''} />
              </div>
            </div>
          </div>
          <SeriesInfo />
        </div>
        <div className="flex flex-nowrap gap-x-8 rounded-md border border-panel-border bg-panel-background-transparent p-8 font-semibold">
          <SeriesTab to="overview" icon={mdiInformationOutline} text="Overview" />
          <SeriesTab to="episodes" icon={mdiFilmstrip} text="Episodes" />
          <SeriesTab to="credits" icon={mdiAccountGroupOutline} text="Credits" />
          <SeriesTab to="images" icon={mdiImageMultipleOutline} text="Images" />
          <SeriesTab to="tags" icon={mdiTagTextOutline} text="Tags" />
          <SeriesTab to="files" icon={mdiFileDocumentMultipleOutline} text="Files" />
          <div
            className="ml-auto flex cursor-pointer items-center gap-x-2"
            onClick={() => setShowEditSeriesModal(true)}
          >
            <Icon className="text-panel-icon" path={mdiPencilCircleOutline} size={1} />
            &nbsp;Edit Series
          </div>
        </div>
        <Outlet context={{ scrollRef }} />
        <div
          className="fixed left-0 top-0 -z-10 h-full w-full opacity-5"
          style={{ background: fanartUri !== '' ? `center / cover no-repeat url('${fanartUri}')` : undefined }}
        />
      </div>
      <EditSeriesModal
        show={showEditSeriesModal}
        onClose={() => setShowEditSeriesModal(false)}
        seriesId={series.IDs.ID}
      />
    </>
  );
};

export default Series;
