import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiInformationOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { filter } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useRefreshAniDBSeriesMutation } from '@/core/react-query/series/mutations';
import { useSeriesAniDBSearchQuery } from '@/core/react-query/series/queries';

type Props = {
  show: boolean;
  onClose: () => void;
};

const AddSeriesModal = ({ onClose, show }: Props) => {
  const { t } = useTranslation('utilities');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const searchQuery = useSeriesAniDBSearchQuery(debouncedSearch, !!debouncedSearch);

  const {
    isPending: isRefreshPending,
    mutate: refreshSeries,
    variables: refreshParams,
  } = useRefreshAniDBSeriesMutation();

  const createSeries = (anidbId: number) => {
    refreshSeries({ anidbID: anidbId, immediate: true, createSeriesEntry: true, force: true }, {
      onSuccess: () => {
        toast.success(t('releaseManagement.addSeries.success'));
        invalidateQueries(['series', 'without-files']);
        onClose();
      },
      onError: (error) => {
        console.error(error);
        toast.error(t('releaseManagement.addSeries.error'));
      },
    });
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={t('releaseManagement.addSeries.title')}
      size="sm"
      noPadding
    >
      <div className="flex flex-col gap-y-4 p-6">
        <div className="flex justify-start gap-x-2">
          <Icon className="shrink-0" path={mdiInformationOutline} size={1} />
          <div className="flex">
            {t('releaseManagement.addSeries.info')}
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Input
            id="search"
            value={searchText}
            type="text"
            placeholder={t('releaseManagement.addSeries.searchPlaceholder')}
            onChange={event => setSearchText(event.target.value)}
            startIcon={mdiMagnify}
            disabled={isRefreshPending}
          />
          <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4 capitalize">
            <div className="flex h-60 flex-col gap-y-1 overflow-x-clip overflow-y-scroll rounded-lg bg-panel-input pr-2 ">
              {searchQuery.isError || searchQuery.isFetching
                ? (
                  <div className="flex h-full items-center justify-center">
                    <Icon path={mdiLoading} size={3} spin className="text-panel-text-primary" />
                  </div>
                )
                : filter(searchQuery.data, result => !result.ShokoID)
                  .map(result => (
                    <div
                      key={result.ID}
                      className={cx(
                        'flex cursor-pointer items-center justify-between',
                        isRefreshPending && 'pointer-events-none',
                        isRefreshPending && result.ID !== refreshParams?.anidbID && 'opacity-50',
                      )}
                      onClick={() => createSeries(result.ID)}
                    >
                      <div className="line-clamp-1">{result.Title}</div>
                      {(result.ID === refreshParams?.anidbID && isRefreshPending)
                        ? (
                          <div className="text-panel-text-primary">
                            <Icon path={mdiLoading} size={0.833} spin />
                          </div>
                        )
                        : (
                          <a
                            href={`https://anidb.net/anime/${result.ID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-panel-text-primary"
                            aria-label="Open AniDB series page"
                            onClick={event => event.stopPropagation()}
                          >
                            <Icon path={mdiOpenInNew} size={0.833} />
                          </a>
                        )}
                    </div>
                  ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            className="flex items-center justify-center"
            onClick={onClose}
          >
            {t('releaseManagement.addSeries.cancel')}
          </Button>
        </div>
      </div>
    </ModalPanel>
  );
};

export default AddSeriesModal;
