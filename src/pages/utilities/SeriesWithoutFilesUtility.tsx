import React, { useEffect, useState } from 'react';
import { forEach } from 'lodash';
import cx from 'classnames';
import moment from 'moment';
import { Icon } from '@mdi/react';
import { mdiCloseCircleOutline, mdiMagnify, mdiMinusCircleOutline, mdiOpenInNew, mdiRestart } from '@mdi/js';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import Input from '@/components/Input/Input';
import type { SeriesType } from '@/core/types/api/series';

import { useDeleteSeriesMutation, useGetSeriesWithoutFilesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { fuzzyFilter, fuzzySort } from '@/core/util';

import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import toast from '@/components/Toast';

const columnHelper = createColumnHelper<SeriesType>();

const columns = [
  columnHelper.accessor('IDs.AniDB', {
    header: 'AniDB ID',
    id: 'ID',
    cell: info => (
      <div className="flex justify-between">
        {info.getValue()}
        <span onClick={() => window.open(`https://anidb.net/anime/${info.getValue()}`, '_blank')} className="cursor-pointer mr-6 text-highlight-1">
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
    filterFn: 'fuzzy',
    sortingFn: fuzzySort,
  }),
  columnHelper.accessor('Created', {
    header: 'Date Added',
    cell: info => moment(info.getValue()).format('MMMM DD YYYY, HH:mm'),
    meta: {
      className: 'w-64',
    },
  }),
];

function SeriesWithoutFilesUtility() {
  const seriesQuery = useGetSeriesWithoutFilesQuery({ pageSize: 0 });
  const series = seriesQuery?.data ?? { Total: 0, List: [] };
  const [deleteSeriesTrigger] = useDeleteSeriesMutation();

  const [columnFilters, setColumnFilters] = useState([{ id: 'Name', value: '' }] as Array<{ id: string; value: string }>);

  const table = useReactTable({
    data: series.List,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    const renderButton = (onClick: (...args: any) => void, icon: string, name: string, highlight = false) => (
      <Button onClick={onClick} className="flex items-center font-normal text-font-main gap-x-2">
        <Icon path={icon} size={1} className={cx({ 'text-highlight-1': highlight })} />
        {name}
      </Button>
    );

    return (
      <>
        {renderButton(async () => {
          table.resetRowSelection();
          await seriesQuery.refetch();
        }, mdiRestart, 'Refresh')}
        <TransitionDiv className="flex grow gap-x-4" show={!common}>
          {renderButton(() => deleteSeries(), mdiMinusCircleOutline, 'Delete', true)}
          {renderButton(() => table.resetRowSelection(), mdiCloseCircleOutline, 'Cancel Selection', true)}
        </TransitionDiv>
      </>
    );
  };

  const renderPanelOptions = () => (
    <div className="flex font-semibold">
      <span className="text-highlight-2">{series.Total}</span>&nbsp;Empty Series
    </div>
  );

  return (
    <div className="flex flex-col grow gap-y-8">

      <div>
        <ShokoPanel title="Series Without Files" options={renderPanelOptions()}>
          <div className="flex items-center gap-x-3">
            <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={columnFilters[0].value} onChange={e => setColumnFilters([{ id: 'filename', value: e.target.value }])} inputClassName="px-4 py-3" />
            <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative gap-x-4">
              {renderOperations(table.getSelectedRowModel().rows.length === 0)}
              <div className="ml-auto text-highlight-2 font-semibold">{table.getSelectedRowModel().rows.length} Series Selected</div>
            </div>
          </div>
        </ShokoPanel>
      </div>

      <div className="flex grow overflow-y-auto rounded-md bg-background-alt border border-background-border p-8">
        {series.Total > 0 ? (
          <UtilitiesTable table={table} skipSort />
        ) : (
          <div className="flex items-center justify-center grow font-semibold">No series without files!</div>
        )}
      </div>
    </div>
  );
}

export default SeriesWithoutFilesUtility;
