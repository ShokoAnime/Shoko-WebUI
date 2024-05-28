import type { ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { Link, NavLink, useNavigate, useOutletContext } from 'react-router-dom';
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
import { get, toNumber } from 'lodash';

import EditSeriesModal from '@/components/Collection/Series/EditSeriesModal';
import SeriesTopPanel from '@/components/Collection/SeriesTopPanel';
import Button from '@/components/Input/Button';
import { useGroupQuery } from '@/core/react-query/group/queries';
import { useSeriesImagesQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

type SeriesTabProps = (props: { icon: string, text: string, to: string }) => ReactNode;
const SeriesTab: SeriesTabProps = ({ icon, text, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cx(
        'flex items-center gap-x-3',
        isActive && 'text-panel-text-primary',
      )}
  >
    <Icon path={icon} size={1} />
    {text}
  </NavLink>
);

const Series = () => {
  const navigate = useNavigate();
  const { seriesId } = useParams();

  const { showRandomFanart } = useSettingsQuery().data.WebUI_Settings.collection.image;
  const seriesQuery = useSeriesQuery(toNumber(seriesId!), { includeDataFrom: ['AniDB'] }, !!seriesId);
  const series = useMemo(() => seriesQuery?.data ?? {} as SeriesType, [seriesQuery.data]);
  const imagesQuery = useSeriesImagesQuery(toNumber(seriesId!), !!seriesId);
  const groupQuery = useGroupQuery(series?.IDs?.ParentGroup ?? 0, !!series?.IDs?.ParentGroup);

  const [fanartUri, setFanartUri] = useState('');
  const [showEditSeriesModal, setShowEditSeriesModal] = useState(false);
  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const onClickHandler = useEventCallback(() => setShowEditSeriesModal(true));

  useEffect(() => {
    if (!imagesQuery.isSuccess) return;

    const getImagePath = ({ ID, Source, Type }: ImageType) => `/api/v3/Image/${Source}/${Type}/${ID}`;

    const allFanarts: ImageType[] = get(imagesQuery.data, 'Fanarts', []);
    if (!Array.isArray(allFanarts) || allFanarts.length === 0) return;

    if (showRandomFanart) {
      setFanartUri(getImagePath(allFanarts[Math.floor(Math.random() * allFanarts.length)]));
      return;
    }

    setFanartUri(getImagePath(allFanarts.find(fanart => fanart.Preferred) ?? allFanarts[0]));
  }, [imagesQuery.data, imagesQuery.isSuccess, series, showRandomFanart]);

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
    <div className="flex flex-col gap-y-6">
      <div className="my-6 flex flex-col items-center gap-y-3">
        <div className="flex flex-row items-center gap-x-4">
          <Link className="text-xl font-semibold text-panel-text-primary" to="/webui/collection">
            Entire Collection
          </Link>
          <Icon className="text-panel-icon" path={mdiChevronRight} size={1} />
          {groupQuery.isSuccess && groupQuery.data.Size > 1 && (
            <>
              <Link
                className="text-xl font-semibold text-panel-text-primary"
                to={`/webui/collection/group/${series.IDs.ParentGroup}`}
              >
                {groupQuery.data.Name}
              </Link>
              <Icon className="text-panel-icon" path={mdiChevronRight} size={1} />
            </>
          )}
        </div>
        <div className="text-4xl font-semibold">{series.Name}</div>
        <div className="flex gap-x-3 text-xl font-semibold opacity-65">
          <span>
            {series.AniDB?.Titles.find(title => title.Type === 'Main')?.Name}
          </span>
          <span>|</span>
          <span>
            {series.AniDB?.Titles.find(title => title.Language === 'ja')?.Name}
          </span>
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

      <EditSeriesModal
        show={showEditSeriesModal}
        onClose={() => setShowEditSeriesModal(false)}
        seriesId={series.IDs.ID}
      />

      <Outlet context={{ scrollRef }} />
      <div
        className="fixed left-0 top-0 -z-10 size-full opacity-5"
        style={{ background: fanartUri !== '' ? `center / cover no-repeat url('${fanartUri}')` : undefined }}
      />
    </div>
  );
};

export default Series;
