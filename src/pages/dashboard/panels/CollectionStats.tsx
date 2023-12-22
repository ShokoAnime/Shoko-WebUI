import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import prettyBytes from 'pretty-bytes';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashbordStatsQuery } from '@/core/react-query/dashboard/queries';

import type { RootState } from '@/core/store';

const Item = (
  { link, title, value = 0 }: { title: string, value?: string | number, link?: string },
) => (
  <div className="flex">
    <div className="mb-1 grow last:mb-0">
      {title}
    </div>
    {link ? <Link to={link} className="font-semibold text-panel-text-primary">{value}</Link> : <div>{value}</div>}
  </div>
);

function CollectionStats() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const statsQuery = useDashbordStatsQuery();

  const childrenFirst = [
    <Item key="series" title="Series" value={statsQuery.data?.SeriesCount} />,
    <Item key="series-completed" title="Series Completed" value={statsQuery.data?.FinishedSeries} />,
    <Item key="episodes-watched" title="Episodes Watched" value={statsQuery.data?.WatchedEpisodes} />,
    <Item key="hours-watched" title="Hours Watched" value={`${statsQuery.data?.WatchedHours || 0} H`} />,
  ];
  const childrenSecond = [
    <Item
      key="collection-size"
      title="Collection Size"
      value={`${prettyBytes(statsQuery.data?.FileSize || 0, { binary: true })}`}
    />,
    <Item key="files" title="Files" value={statsQuery.data?.FileCount} />,
    <Item
      key="unrecognized-files"
      title="Unknown Files"
      value={statsQuery.data?.UnrecognizedFiles}
      link="/webui/utilities/unrecognized"
    />,
    <Item key="multiple-files" title="Duplicate Episodes" value={statsQuery.data?.EpisodesWithMultipleFiles} />,
    <Item key="duplicate-files" title="Duplicate Hashes" value={statsQuery.data?.FilesWithDuplicateLocations} />,
  ];

  const childrenThird = [
    <Item key="missing-links" title="Missing TvDB/TMDB Links" value={statsQuery.data?.SeriesWithMissingLinks} />,
    <Item
      key="missing-episodes-collecting"
      title="Missing Episodes (Collecting)"
      value={statsQuery.data?.MissingEpisodesCollecting}
    />,
    <Item key="missing-episodes" title="Missing Episodes (Total)" value={statsQuery.data?.MissingEpisodes} />,
  ];

  return (
    <ShokoPanel title="Collection Statistics" isFetching={statsQuery.isPending} editMode={layoutEditMode}>
      <div className="flex flex-col leading-5">
        {childrenFirst}
      </div>
      <div className="mt-4 flex flex-col leading-5">
        {childrenSecond}
      </div>
      <div className="mt-4 flex flex-col leading-5">
        {childrenThird}
      </div>
    </ShokoPanel>
  );
}

export default CollectionStats;
