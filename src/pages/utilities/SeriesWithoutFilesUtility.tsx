import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  mdiCloseCircleOutline,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiPlusCircleOutline,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy } from 'lodash';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import AddSeriesModal from '@/components/Utilities/SeriesWithoutFiles/AddSeriesModal';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useDeleteSeriesMutation } from '@/core/react-query/series/mutations';
import { useSeriesWithoutFilesInfiniteQuery } from '@/core/react-query/series/queries';
import { dayjs } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useRowSelection from '@/hooks/useRowSelection';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { SeriesType } from '@/core/types/api/series';
import type { Updater } from 'use-immer';

const columns: UtilityHeaderType<SeriesType>[] = [
  {
    id: 'id',
    name: 'Shoko ID',
    className: 'w-32',
    item: series => (
      <Link
        to={`/webui/collection/series/${series.IDs.ID}`}
        className="flex gap-x-2 text-panel-text-primary"
      >
        {series.IDs.ID}
        <Icon path={mdiOpenInNew} size={1} />
      </Link>
    ),
  },
  {
    id: 'name',
    name: 'Name',
    className: 'grow basis-0 overflow-hidden',
    item: series => (
      <div className="line-clamp-2 flex gap-x-1" data-tooltip-id="tooltip" data-tooltip-content={series.Name}>
        {series.Name}
        <a
          href={`https://anidb.net/anime/${series.IDs.AniDB}`}
          target="_blank"
          rel="noreferrer noopener"
          className="flex gap-x-1 font-semibold"
          aria-label="Open AniDB series page"
          onClick={event =>
            event.stopPropagation()}
        >
          <div>
            (
            <span className="text-panel-text-primary">{series.IDs.AniDB}</span>
            )
          </div>
          <div className="text-panel-text-primary">
            <Icon path={mdiOpenInNew} size={1} />
          </div>
        </a>
      </div>
    ),
  },
  {
    id: 'created',
    name: 'Date Added',
    className: 'w-64',
    item: series => dayjs(series.Created).format('MMMM DD YYYY, HH:mm'),
  },
];

const Menu = (props: { selectedRows: SeriesType[], setSelectedRows: Updater<Record<number, boolean>> }) => {
  const { selectedRows, setSelectedRows } = props;

  const [showAddSeriesModal, toggleAddSeriesModal] = useToggle(false);

  const { mutateAsync: deleteSeries } = useDeleteSeriesMutation();

  const handleDeleteSeries = () => {
    const promises = selectedRows.map(
      row => deleteSeries({ seriesId: row.IDs.ID, deleteFiles: false }),
    );

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Error deleting ${failedCount} series!`);
        if (failedCount !== selectedRows.length) toast.success(`${selectedRows.length} series deleted!`);
      })
      .catch(console.error);
  };

  return (
    <>
      <div className="relative box-border flex h-13 grow items-center rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
        <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length === 0}>
          <MenuButton
            onClick={() => {
              setSelectedRows([]);
              invalidateQueries(['series', 'without-files']);
            }}
            icon={mdiRefresh}
            name="Refresh"
          />
        </TransitionDiv>
        <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length !== 0}>
          <MenuButton onClick={() => handleDeleteSeries()} icon={mdiMinusCircleOutline} name="Delete" highlight />
          <MenuButton
            onClick={() => setSelectedRows([])}
            icon={mdiCloseCircleOutline}
            name="Cancel Selection"
            highlight
          />
        </TransitionDiv>
      </div>
      <Button
        buttonType="primary"
        buttonSize="normal"
        className="flex flex-row flex-wrap items-center gap-x-2 py-3"
        onClick={toggleAddSeriesModal}
      >
        <Icon path={mdiPlusCircleOutline} size={1} />
        Add Series
      </Button>
      <AddSeriesModal show={showAddSeriesModal} onClose={toggleAddSeriesModal} />
    </>
  );
};

const SeriesWithoutFilesUtility = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 200);

  const seriesQuery = useSeriesWithoutFilesInfiniteQuery({ pageSize: 25, search: debouncedSearch });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection<SeriesType>(series);

  return (
    <>
      <title>Series Without Files | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <div>
          <ShokoPanel
            title="Series Without Files"
            options={<ItemCount count={seriesCount} selected={selectedRows?.length} suffix="Series" />}
          >
            <div className="flex items-center gap-x-3">
              <Input
                type="text"
                placeholder="Search..."
                startIcon={mdiMagnify}
                id="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                inputClassName="px-4 py-3"
              />
              <Menu selectedRows={selectedRows} setSelectedRows={setRowSelection} />
            </div>
          </ShokoPanel>
        </div>

        <div className="flex grow overflow-y-auto rounded-lg border border-panel-border bg-panel-background px-4 py-6">
          {seriesQuery.isPending && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

          {!seriesQuery.isPending && seriesCount === 0 && (
            <div className="flex grow items-center justify-center font-semibold">No series without files!</div>
          )}

          {seriesQuery.isSuccess && seriesCount > 0 && (
            <UtilitiesTable
              columns={columns}
              count={seriesCount}
              fetchNextPage={seriesQuery.fetchNextPage}
              handleRowSelect={handleRowSelect}
              isFetchingNextPage={seriesQuery.isFetchingNextPage}
              rows={series}
              rowSelection={rowSelection}
              setSelectedRows={setRowSelection}
              skipSort
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SeriesWithoutFilesUtility;
