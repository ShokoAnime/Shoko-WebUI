import React, { useState } from 'react';
import { mdiFileDocumentMultipleOutline, mdiLoading, mdiOpenInNew, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
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

const MultiplesUtil = () => {
  const [selectedSeries, setSelectedSeries] = useState(0);
  const [ignoreVariations, setIgnoreVariations] = useState(true);
  const [onlyFinishedSeries, setOnlyFinishedSeries] = useState(true);

  const seriesQuery = useSeriesWithMultipleReleases({ ignoreVariations, onlyFinishedSeries, pageSize: 25 });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const handleCheckboxChange = (type: 'variations' | 'series', checked: boolean) => {
    setSelectedSeries(0);
    if (type === 'variations') setIgnoreVariations(checked);
    if (type === 'series') setOnlyFinishedSeries(checked);
  };

  return (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto">
      <ShokoPanel title={<Title />} options={<ItemCount count={seriesCount} series />}>
        <div className="flex items-center gap-x-3">
          <div className="relative box-border flex grow items-center gap-x-4 rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
            <MenuButton
              onClick={() => invalidateQueries(['release-management', 'series'])}
              icon={mdiRefresh}
              name="Refresh"
            />

            <Checkbox
              id="ignore-variations"
              isChecked={ignoreVariations}
              onChange={event => handleCheckboxChange('variations', event.target.checked)}
              label="Ignore Variations"
              labelRight
            />

            <Checkbox
              id="only-finished-series"
              isChecked={onlyFinishedSeries}
              onChange={event => handleCheckboxChange('series', event.target.checked)}
              label="Only Finished Series"
              labelRight
            />
          </div>

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

        <EpisodeList seriesId={selectedSeries} ignoreVariations={ignoreVariations} />
      </div>
    </div>
  );
};

export default MultiplesUtil;
