import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiMagnify, mdiPlayCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import AddFilesSeriesList from '@/components/Utilities/Renamer/AddFilesSeriesList';
import { axios } from '@/core/axios';
import { useFilteredSeriesInfiniteQuery } from '@/core/react-query/filter/queries';
import queryClient from '@/core/react-query/queryClient';
import { addFiles } from '@/core/slices/utilities/renamer';
import store from '@/core/store';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { ListResultType } from '@/core/types/api';
import type { FileType } from '@/core/types/api/file';
import type { FilterCondition, FilterType } from '@/core/types/api/filter';

type Props = {
  show: boolean;
  onClose: () => void;
};

const addEntireCollection = () => {
  queryClient.fetchQuery<ListResultType<FileType>>(
    {
      queryKey: ['files', 'entire-collection'],
      queryFn: () => axios.get('File', { params: { pageSize: 0 } }),
    },
  )
    .then(result => store.dispatch(addFiles(result.List)))
    .catch(console.error);
};

const addRecentlyImportedFiles = (pageSize: number) => {
  queryClient.fetchQuery<ListResultType<FileType>>(
    {
      queryKey: ['files', 'recently-imported', pageSize],
      queryFn: () =>
        axios.get('File', {
          params: { pageSize, exclude: ['Unrecognized'], sortOrder: [-FileSortCriteriaEnum.CreatedAt] },
        }),
    },
  )
    .then(result => store.dispatch(addFiles(result.List)))
    .catch(console.error);
};

const getSearchFilter = (query: string, isSeries: boolean): FilterType => {
  if (!query) return {};

  let searchCondition: FilterCondition = {
    Type: 'StringContains',
    Left: {
      Type: 'NameSelector',
    },
    Parameter: query,
  };

  if (Number.isFinite(toNumber(query))) {
    searchCondition = {
      Type: 'Or',
      Left: searchCondition,
      Right: {
        Type: 'AnyEquals',
        Left: {
          Type: 'AniDBIDsSelector',
        },
        Parameter: query,
      },
    };
  }

  return {
    ApplyAtSeriesLevel: isSeries,
    Expression: searchCondition,
    Sorting: { Type: 'Name', IsInverted: false },
  };
};

const AddFilesModal = ({ onClose, show }: Props) => {
  const { t } = useTranslation('utilities');
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 200);

  const seriesQuery = useFilteredSeriesInfiniteQuery(
    {
      pageSize: 50,
      filterCriteria: getSearchFilter(debouncedSearch, true),
    },
    show,
  );
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={t('renamer.addFiles.title')}
      size="sm"
      noGap
    >
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-4">
          <div className="font-semibold">{t('renamer.addFiles.oneClick')}</div>
          <div className="border-b border-panel-border" />
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{t('renamer.addFiles.entireCollection')}</div>
              <Button
                onClick={addEntireCollection}
              >
                <Icon path={mdiPlayCircleOutline} size={1} className="text-panel-text-primary" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{t('renamer.addFiles.recentlyImported')}</div>
              <div className="flex items-center gap-x-2">
                <InputSmall
                  id="pageSize"
                  type="number"
                  value={pageSize}
                  onChange={event => setPageSize(toNumber(event.target.value))}
                  className="w-14 text-center"
                  max={1000}
                />
                <Button
                  onClick={() => addRecentlyImportedFiles(pageSize)}
                >
                  <Icon path={mdiPlayCircleOutline} size={1} className="text-panel-text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <div className="font-semibold">{t('renamer.addFiles.selectSeries')}</div>
          <div className="border-b border-panel-border" />
          <div className="flex flex-col gap-y-4">
            <Input
              id="search"
              type="text"
              placeholder={t('common.actions.searchPlaceholder')}
              startIcon={mdiMagnify}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            <AddFilesSeriesList
              series={series}
              seriesCount={seriesCount}
              isPending={seriesQuery.isPending}
              isFetchingNextPage={seriesQuery.isFetchingNextPage}
              fetchNextPage={() => seriesQuery.fetchNextPage()}
            />
          </div>
        </div>
      </div>
    </ModalPanel>
  );
};

export default AddFilesModal;
