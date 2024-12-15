import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router';
import useMeasure from 'react-use-measure';
import {
  mdiAccountGroupOutline,
  mdiChevronRight,
  mdiFileDocumentMultipleOutline,
  mdiFilmstrip,
  mdiImageMultipleOutline,
  mdiInformationOutline,
  mdiLoading,
  mdiPencilCircleOutline,
  mdiTagTextOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import EditSeriesModal from '@/components/Collection/Series/EditSeriesModal';
import SeriesTopPanel from '@/components/Collection/SeriesTopPanel';
import Button from '@/components/Input/Button';
import { useGroupQuery } from '@/core/react-query/group/queries';
import { useSeriesImagesQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setSeriesId } from '@/core/slices/modals/editSeries';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

type SeriesTabProps = (props: { icon: string, text: string, to: string }) => React.ReactNode;
const SeriesTab: SeriesTabProps = ({ icon, text, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cx(
        'flex items-center gap-x-3 transition-colors hover:text-panel-text-primary',
        isActive && 'text-panel-text-primary',
      )}
    replace
  >
    <Icon path={icon} size={1} />
    {text}
  </NavLink>
);

const getImagePath = ({ ID, Source, Type }: ImageType) => `/api/v3/Image/${Source}/${Type}/${ID}`;

const languageMapping = { 'x-jat': 'ja', 'x-kot': 'ko', 'x-zht': 'zh-hans' };

const Series = () => {
  const navigate = useNavigateVoid();
  const { seriesId } = useParams();

  const seriesQuery = useSeriesQuery(toNumber(seriesId!), { includeDataFrom: ['AniDB', 'TMDB'] }, !!seriesId);
  const series = useMemo(() => seriesQuery?.data ?? {} as SeriesType, [seriesQuery.data]);
  const groupQuery = useGroupQuery(series?.IDs?.ParentGroup ?? 0, !!series?.IDs?.ParentGroup);

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const dispatch = useDispatch();

  const [mainTitle, originalTitle] = useMemo(() => {
    const tempMainTitle = series.AniDB?.Titles.find(title => title.Type === 'Main');
    const tempOriginalTitle = series.AniDB?.Titles.find(
      title => title.Language === languageMapping[tempMainTitle?.Language ?? ''] && title.Type === 'Official',
    );
    return [
      (tempMainTitle && tempMainTitle.Name !== series.Name) ? <span>{tempMainTitle.Name}</span> : null,
      (tempOriginalTitle && tempOriginalTitle.Name !== series.Name) ? <span>{tempOriginalTitle.Name}</span> : null,
    ];
  }, [series]);

  const onClickHandler = useEventCallback(() => {
    dispatch(setSeriesId(toNumber(seriesId) ?? -1));
  });

  const { showRandomBackdrop } = useSettingsQuery().data.WebUI_Settings.collection.image;
  const imagesQuery = useSeriesImagesQuery(toNumber(seriesId!), !!seriesId && showRandomBackdrop);
  const [backdrop, setBackdrop] = useState<ImageType>();
  useEffect(() => {
    if (!showRandomBackdrop) {
      setBackdrop(series.Images?.Backdrops?.[0]);
      return;
    }

    const allBackdrops = imagesQuery.data?.Backdrops ?? [];
    if (allBackdrops.length === 0) return;

    setBackdrop(allBackdrops[Math.floor(Math.random() * allBackdrops.length)]);
  }, [imagesQuery.data, series, showRandomBackdrop]);

  const [containerRef, containerBounds] = useMeasure();

  if (seriesQuery.isError) {
    navigate('../');
    return null;
  }

  if (!seriesQuery.isSuccess) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={4} spin />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6" ref={containerRef}>
      <div className="my-6 flex flex-col items-center gap-y-3">
        <div className="flex flex-row items-center gap-x-4">
          <Link className="text-xl font-semibold text-panel-text-primary" to="/webui/collection">
            Collection
          </Link>
          <Icon className="flex-none text-panel-icon" path={mdiChevronRight} size={1} />
          {groupQuery.isSuccess && groupQuery.data.Size > 1 && (
            <>
              <Link
                className="text-xl font-semibold text-panel-text-primary"
                to={`/webui/collection/group/${series.IDs.ParentGroup}`}
              >
                {groupQuery.data.Name}
              </Link>
              <Icon className="flex-none text-panel-icon" path={mdiChevronRight} size={1} />
            </>
          )}
        </div>
        <div className="text-center text-4xl font-semibold">{series.Name}</div>
        <div className="flex gap-x-3 text-xl font-semibold opacity-65">
          {mainTitle}
          {mainTitle && originalTitle && <span>|</span>}
          {originalTitle}
        </div>
      </div>
      <SeriesTopPanel series={series} />
      <div className="flex justify-between rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold">
        <div className="flex gap-x-10">
          <SeriesTab to="overview" icon={mdiInformationOutline} text="Overview" />
          <SeriesTab to="episodes" icon={mdiFilmstrip} text="Episodes" />
          <SeriesTab to="credits" icon={mdiAccountGroupOutline} text="Credits" />
          <SeriesTab to="images" icon={mdiImageMultipleOutline} text="Images" />
          <SeriesTab to="tags" icon={mdiTagTextOutline} text="Tags" />
          <SeriesTab to="files" icon={mdiFileDocumentMultipleOutline} text="Files" />
        </div>
        <div>
          <Button buttonType="secondary" buttonSize="normal" className="flex gap-x-2" onClick={onClickHandler}>
            <Icon path={mdiPencilCircleOutline} size={1} />
            Edit Series
          </Button>
        </div>
      </div>

      <EditSeriesModal />

      <Outlet context={{ backdrop, scrollRef, series } satisfies SeriesContextType} />

      <div
        className="fixed left-0 top-0 -z-10 w-full bg-cover bg-fixed opacity-5"
        // If this height feels like a hack, you figure out how to fix it
        // 3rem accounts for the top and bottom padding of the container (1.5rem each side)
        style={{
          backgroundImage: backdrop ? `url('${getImagePath(backdrop)}')` : undefined,
          height: `calc(${containerBounds.height}px + 3rem)`,
        }}
      />
    </div>
  );
};

export default Series;
