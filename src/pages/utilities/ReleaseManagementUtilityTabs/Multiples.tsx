import React, { useState } from 'react';
import { mdiFileDocumentMultipleOutline, mdiLoading, mdiOpenInNew, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import EpisodeList from '@/components/Utilities/ReleaseManagement/EpisodeList';
import Title from '@/components/Utilities/ReleaseManagement/Title';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useSeriesWithMultipleReleases } from '@/core/react-query/release-management/queries';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { SeriesWithMultipleReleasesType } from '@/core/types/api/series';

const columns: UtilityHeaderType<SeriesWithMultipleReleasesType>[] = [
  {
    id: 'series',
    name: 'Series (AniDB ID)',
    className: 'grow basis-0 overflow-hidden',
    item: series => (
      <div title={series.Name} className="flex items-center gap-x-1">
        <span className="line-clamp-1">{series.Name}</span>
        <div>
          (
          <span className="text-panel-text-primary">{series.IDs.AniDB}</span>
          )
        </div>
        <a
          href={`https://anidb.net/anime/${series.IDs.AniDB}`}
          target="_blank"
          rel="noreferrer noopener"
          className="cursor-pointer text-panel-text-primary"
          aria-label="Open AniDB series page"
        >
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      </div>
    ),
  },
  {
    id: 'entry-count',
    name: 'Entry Count',
    className: 'w-32',
    item: (series) => {
      const count = series.EpisodeCount;
      return (
        <>
          <span className="text-panel-text-important">{count}</span>
          {count === 1 ? ' Entry' : ' Entries'}
        </>
      );
    },
  },
];

const Menu = () => (
  <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
    <MenuButton onClick={() => invalidateQueries(['release-management', 'series'])} icon={mdiRefresh} name="Refresh" />
  </div>
);

const Multiples = () => {
  const seriesQuery = useSeriesWithMultipleReleases({ pageSize: 25 });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const [selectedSeries, setSelectedSeries] = useState(0);

  return (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto">
      <ShokoPanel title={<Title />} options={<ItemCount count={seriesCount} series />}>
        <div className="flex items-center gap-x-3">
          <Menu />
          <Button buttonType="primary" className="flex gap-x-2.5 px-4 py-3 font-semibold" disabled={seriesCount === 0}>
            <Icon path={mdiFileDocumentMultipleOutline} size={0.8333} />
            Auto-Delete Multiples
          </Button>
        </div>
      </ShokoPanel>

      <div className="flex grow gap-x-3">
        <div className="flex w-1/2 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
          {seriesQuery.isPending && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

          {!seriesQuery.isPending && seriesCount === 0 && (
            <div className="flex grow items-center justify-center font-semibold">
              No series with multiple files!
            </div>
          )}

          {seriesQuery.isSuccess && seriesCount > 0 && (
            <UtilitiesTable
              columns={columns}
              count={seriesCount}
              fetchNextPage={seriesQuery.fetchNextPage}
              isFetchingNextPage={seriesQuery.isFetchingNextPage}
              rows={series}
              skipSort
              handleRowSelect={(id, _) => setSelectedSeries(id)}
              rowSelection={{ [selectedSeries]: true }}
            />
          )}
        </div>

        <EpisodeList seriesId={selectedSeries} />
      </div>
    </div>
  );
};

export default Multiples;
