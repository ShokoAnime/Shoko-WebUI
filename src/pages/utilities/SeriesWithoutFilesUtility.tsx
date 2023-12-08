import React, { useEffect } from 'react';
import { mdiCloseCircleOutline, mdiMagnify, mdiMinusCircleOutline, mdiOpenInNew, mdiRestart } from '@mdi/js';
import { Icon } from '@mdi/react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import cx from 'classnames';
import { forEach } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useDeleteSeriesMutation, useGetSeriesWithoutFilesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { dayjs } from '@/core/util';

import type { SeriesType } from '@/core/types/api/series';

const columnHelper = createColumnHelper<SeriesType>();

const columns = [
  columnHelper.accessor('IDs.AniDB', {
    header: 'AniDB ID',
    id: 'ID',
    cell: info => (
      <div className="flex justify-between">
        {info.getValue()}
        <span
          onClick={() => window.open(`https://anidb.net/anime/${info.getValue()}`, '_blank')}
          className="mr-6 cursor-pointer text-panel-text-primary"
        >
          <Icon path={mdiOpenInNew} size={1} />
        </span>
      </div>
    ),
    meta: {
      className: 'w-32',
    },
  }),
  columnHelper.accessor('Name', {
    cell: info => info.getValue(),
    meta: {
      className: 'w-auto',
    },
  }),
  columnHelper.accessor('Created', {
    header: 'Date Added',
    cell: info => dayjs(info.getValue()).format('MMMM DD YYYY, HH:mm'),
    meta: {
      className: 'w-64',
    },
  }),
];

function SeriesWithoutFilesUtility() {
  const seriesQuery = useGetSeriesWithoutFilesQuery({ pageSize: 0 });
  const series = seriesQuery?.data ?? { Total: 0, List: [] };
  const [deleteSeriesTrigger] = useDeleteSeriesMutation();

  const table = useReactTable({
    data: series.List,
    columns,
    getRowId(row) {
      return row.IDs.ID.toString();
    },
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    table.resetRowSelection();
  }, [series.List, table]);

  const deleteSeries = () => {
    let failedSeries = 0;
    forEach(table.getSelectedRowModel().rows, (row) => {
      deleteSeriesTrigger({ seriesId: row.original.IDs.ID, deleteFiles: false }).catch((error) => {
        failedSeries += 1;
        console.error(error);
      });
    });

    const selectedRowsLength = table.getSelectedRowModel().rows.length;
    if (failedSeries) toast.error(`Error deleting ${failedSeries} series!`);
    if (failedSeries !== selectedRowsLength) toast.success(`${selectedRowsLength} series deleted!`);
  };

  const renderOperations = (common = false) => {
    const renderButton = (
      onClick: React.MouseEventHandler<HTMLButtonElement>,
      icon: string,
      name: string,
      highlight = false,
    ) => (
      <Button onClick={onClick} className="flex items-center gap-x-2 font-normal text-panel-text">
        <Icon path={icon} size={1} className={cx({ 'text-panel-text-primary': highlight })} />
        {name}
      </Button>
    );

    return (
      <>
        {renderButton(
          async () => {
            table.resetRowSelection();
            await seriesQuery.refetch();
          },
          mdiRestart,
          'Refresh',
        )}
        <TransitionDiv className="flex grow gap-x-4" show={!common}>
          {renderButton(() => deleteSeries(), mdiMinusCircleOutline, 'Delete', true)}
          {renderButton(() => table.resetRowSelection(), mdiCloseCircleOutline, 'Cancel Selection', true)}
        </TransitionDiv>
      </>
    );
  };

  const renderPanelOptions = () => (
    <div className="flex font-semibold">
      <span className="text-panel-text-important">{series.Total}</span>
      &nbsp;Empty Series
    </div>
  );

  return (
    <div className="flex grow flex-col gap-y-8">
      <div>
        <ShokoPanel title="Series Without Files" options={renderPanelOptions()}>
          <div className="flex items-center gap-x-3">
            <Input
              type="text"
              placeholder="Search..."
              startIcon={mdiMagnify}
              id="search"
              value=""
              onChange={() => {}}
              inputClassName="px-4 py-3"
            />
            <div className="relative box-border flex grow items-center gap-x-4 rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
              {renderOperations(table.getSelectedRowModel().rows.length === 0)}
              <div className="ml-auto font-semibold text-panel-text-important">
                {table.getSelectedRowModel().rows.length}
                <span className="text-panel-text">Series Selected</span>
              </div>
            </div>
          </div>
        </ShokoPanel>
      </div>

      <div className="flex grow overflow-y-auto rounded-md border border-panel-border bg-panel-background p-8">
        {series.Total > 0
          ? <UtilitiesTable table={table} skipSort />
          : <div className="flex grow items-center justify-center font-semibold">No series without files!</div>}
      </div>
    </div>
  );
}

export default SeriesWithoutFilesUtility;
