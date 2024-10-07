import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import prettyBytes from 'pretty-bytes';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashbordStatsQuery } from '@/core/react-query/dashboard/queries';
import { resetFilter } from '@/core/slices/collection';
import { addFilterCriteriaToStore } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';

const Item = (
  { filter, link, title, value = 0 }: { title: string, value?: string | number, link?: string, filter?: string },
) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleMissingFilter = useEventCallback((filterName: string) => {
    dispatch(resetFilter());
    addFilterCriteriaToStore(filterName).then(() => {
      navigate('/webui/collection');
    }).catch(console.error);
  });

  return (
    <div className="flex">
      <div className="grow">
        {title}
      </div>
      {/* eslint-disable-next-line no-nested-ternary */}
      {link
        ? <Link to={link} className="font-semibold text-panel-text-primary">{value}</Link>
        : filter
        ? (
          <div
            className="cursor-pointer font-semibold text-panel-text-primary"
            onClick={() => handleMissingFilter(filter)}
          >
            {value}
          </div>
        )
        : <div>{value}</div>}
    </div>
  );
};

function CollectionStats() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const statsQuery = useDashbordStatsQuery();

  const childrenFirst = [
    <Item key="series" title="Series" value={statsQuery.data?.SeriesCount} />,
    <Item key="series-completed" title="Series Completed" value={statsQuery.data?.FinishedSeries} />,
    <Item key="episodes-watched" title="Episodes Watched" value={statsQuery.data?.WatchedEpisodes} />,
    <Item key="hours-watched" title="Hours Watched" value={`${statsQuery.data?.WatchedHours ?? 0} H`} />,
  ];
  const childrenSecond = [
    <Item
      key="collection-size"
      title="Collection Size"
      value={`${prettyBytes(statsQuery.data?.FileSize ?? 0, { binary: true })}`}
    />,
    <Item key="files" title="Files" value={statsQuery.data?.FileCount} />,
    <Item
      key="unrecognized-files"
      title="Unknown Files"
      value={statsQuery.data?.UnrecognizedFiles}
      link="/webui/utilities/unrecognized"
    />,
    <Item
      key="multiple-files"
      title="Duplicate Episodes"
      value={statsQuery.data?.EpisodesWithMultipleFiles}
      link="/webui/utilities/release-management"
    />,
    <Item key="duplicate-files" title="Duplicate Hashes" value={statsQuery.data?.FilesWithDuplicateLocations} />,
  ];

  const childrenThird = [
    <Item
      key="missing-links"
      title="Missing TMDB Links"
      value={statsQuery.data?.SeriesWithMissingLinks}
      filter="MissingTmdbLink"
    />,
    <Item
      key="missing-episodes-collecting"
      title="Missing Episodes (Collecting)"
      value={statsQuery.data?.MissingEpisodesCollecting}
      filter="HasMissingEpisodesCollecting"
    />,
    <Item
      key="missing-episodes"
      title="Missing Episodes (Total)"
      value={statsQuery.data?.MissingEpisodes}
      filter="HasMissingEpisodes"
    />,
  ];

  return (
    <ShokoPanel
      title="Collection Statistics"
      isFetching={statsQuery.isPending}
      editMode={layoutEditMode}
      contentClassName="flex gap-y-6"
    >
      <div className="flex flex-col gap-y-1">
        {childrenFirst}
      </div>
      <div className="flex flex-col gap-y-1">
        {childrenSecond}
      </div>
      <div className="flex flex-col gap-y-1">
        {childrenThird}
      </div>
    </ShokoPanel>
  );
}

export default CollectionStats;
