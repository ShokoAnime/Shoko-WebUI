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
import Checkbox from '@/components/Input/Checkbox';
import type { SeriesType } from '@/core/types/api/series';

import { useDeleteSeriesMutation, useGetSeriesWithoutFilesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { fuzzyFilter, fuzzySort } from '@/core/util';

import UtilitiesTable from './UnrecognizedUtilityTabs/Components/UtilitiesTable';

const columnHelper = createColumnHelper<SeriesType>();

const columns = [
  columnHelper.display({
    id: 'checkbox',
    header: ({ table }) => (
      <div className="flex items-center justify-center mr-6">
        <Checkbox id="checkbox-all" isChecked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()} intermediate={table.getIsSomeRowsSelected()}/>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox id={`checkbox-${row.id}`} isChecked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}/>
      </div>
    ),
    meta: {
      className: 'w-20',
    },
  }),
  columnHelper.accessor('IDs.AniDB', {
    header: 'AniDB ID',
    id: 'ID',
    cell: info => <div className="flex justify-between">
      {info.getValue()}
      <span onClick={() => window.open(`https://anidb.net/anime/${info.getValue()}`, '_blank')} className="cursor-pointer mr-6 text-highlight-1">
        <Icon path={mdiOpenInNew} size={1} />
      </span>
    </div>,
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
  }, [series.List]);

  const deleteSeries = () => {
    forEach(table.getSelectedRowModel().rows, (row) => {
      deleteSeriesTrigger({ seriesId: row.original.IDs.ID, deleteFiles: false }).catch(() => {});
    });
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
      <span className="text-highlight-2">{series.Total} Empty</span>&nbsp;Series
    </div>
  );

  return (
    <ShokoPanel title="Series Without Files" options={renderPanelOptions()}>
      <div className="flex items-center gap-x-3">
        {/*TODO: Fix search bar height*/}
        <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={columnFilters[0].value} onChange={e => setColumnFilters([{ id: 'filename', value: e.target.value }])} />
        <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative gap-x-4">
          {renderOperations(table.getSelectedRowModel().rows.length === 0)}
          <div className="ml-auto text-highlight-2 font-semibold">{table.getSelectedRowModel().rows.length} Series Selected</div>
        </div>
      </div>
      <div className="grow w-full h-full overflow-y-auto rounded-lg bg-background-alt border border-background-border mt-8 p-8">
        {series.Total > 0 ? (
          <UtilitiesTable table={table} />
        ) : (
          <div className="flex items-center justify-center h-full font-semibold">No series without files!</div>
        )}
      </div>
    </ShokoPanel>
  );
}

export default SeriesWithoutFilesUtility;
