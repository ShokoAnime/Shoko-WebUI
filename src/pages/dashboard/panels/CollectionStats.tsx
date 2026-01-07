import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import prettyBytes from 'pretty-bytes';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useDashbordStatsQuery } from '@/core/react-query/dashboard/queries';
import { resetFilter } from '@/core/slices/collection';
import { addFilterCriteriaToStore } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { RootState } from '@/core/store';

const Item = (
  { filter, link, title, value = 0 }: { title: string, value?: string | number, link?: string, filter?: string },
) => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();
  const handleMissingFilter = useEventCallback((filterName: string) => {
    dispatch(resetFilter());
    addFilterCriteriaToStore(filterName).then(() => {
      navigate('/webui/collection/filter/live');
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
  const { t } = useTranslation('panels');
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const statsQuery = useDashbordStatsQuery();

  const childrenFirst = [
    <Item key="series" title={t('collectionStats.series')} value={statsQuery.data?.SeriesCount} />,
    <Item
      key="series-completed"
      title={t('collectionStats.seriesCompleted')}
      value={statsQuery.data?.FinishedSeries}
    />,
    <Item
      key="episodes-watched"
      title={t('collectionStats.episodesWatched')}
      value={statsQuery.data?.WatchedEpisodes}
    />,
    <Item
      key="hours-watched"
      title={t('collectionStats.hoursWatched')}
      value={`${statsQuery.data?.WatchedHours ?? 0} H`}
    />,
  ];
  const childrenSecond = [
    <Item
      key="collection-size"
      title={t('collectionStats.collectionSize')}
      value={`${prettyBytes(statsQuery.data?.FileSize ?? 0, { binary: true })}`}
    />,
    <Item
      key="files"
      title={t('collectionStats.files')}
      value={statsQuery.data?.FileCount}
      link="/webui/utilities/file-search"
    />,
    <Item
      key="unrecognized-files"
      title={t('collectionStats.unrecognizedFiles')}
      value={statsQuery.data?.UnrecognizedFiles}
      link="/webui/utilities/unrecognized"
    />,
    <Item
      key="multiple-files"
      title={t('collectionStats.duplicateEpisodes')}
      value={statsQuery.data?.EpisodesWithMultipleFiles}
      link="/webui/utilities/release-management/multiples"
    />,
    <Item
      key="duplicate-files"
      title={t('collectionStats.duplicateHashes')}
      value={statsQuery.data?.FilesWithDuplicateLocations}
      link="/webui/utilities/release-management/duplicates"
    />,
  ];

  const childrenThird = [
    <Item
      key="missing-links"
      title={t('collectionStats.missingTmdbLinks')}
      value={statsQuery.data?.SeriesWithMissingLinks}
      filter="MissingTmdbLink"
    />,
    <Item
      key="missing-episodes-collecting"
      title={t('collectionStats.missingEpisodesCollecting')}
      value={statsQuery.data?.MissingEpisodesCollecting}
      link="/webui/utilities/release-management/missing-episodes?onlyCollecting=true"
    />,
    <Item
      key="missing-episodes"
      title={t('collectionStats.missingEpisodesTotal')}
      value={statsQuery.data?.MissingEpisodes}
      link="/webui/utilities/release-management/missing-episodes"
    />,
  ];

  return (
    <ShokoPanel
      title={t('collectionStats.panelTitle')}
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
