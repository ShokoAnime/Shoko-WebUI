import React, { useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useParams, useSearchParams } from 'react-router';
import { mdiEyeOffOutline, mdiRefresh, mdiSelectMultiple } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useIsFetching } from '@tanstack/react-query';
import cx from 'classnames';
import { map } from 'lodash';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import ItemCount from '@/components/Utilities/ItemCount';
import QuickSelectModal from '@/components/Utilities/ReleaseManagement/QuickSelectModal';
import SeriesList from '@/components/Utilities/ReleaseManagement/SeriesList';
import Title from '@/components/Utilities/ReleaseManagement/Title';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { useHideEpisodeMutation } from '@/core/react-query/episode/mutations';
import { invalidateQueries, resetQueries } from '@/core/react-query/queryClient';

import type { ReleaseManagementItemType } from '@/core/react-query/release-management/types';
import type { EpisodeType } from '@/core/types/api/episode';

const titleMap = {
  MultipleReleases: 'Multiple Releases',
  DuplicateFiles: 'Duplicate Files',
  MissingEpisodes: 'Missing Episodes',
} as const;

const ReleaseManagement = () => {
  const { type = 'MultipleReleases' } = useParams() as { type?: ReleaseManagementItemType };
  const [searchParams, setSearchParams] = useSearchParams();

  const isSeriesQueryFetching = useIsFetching({ queryKey: ['release-management', 'series'] }) > 0;

  const filterOptions = useMemo(() => ({
    ignoreVariations: (searchParams.get('ignoreVariations') ?? 'true') === 'true',
    onlyCollecting: searchParams.get('onlyCollecting') === 'true',
    onlyFinishedSeries: searchParams.get('onlyFinishedSeries') === 'true',
  }), [searchParams]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set(event.target.id, String(event.target.checked));
      return newParams;
    });
  };

  const [seriesCount, setSeriesCount] = useState(0);
  const [selectedSeries, setSelectedSeries] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeType>();
  const [selectedEpisodes, setSelectedEpisodes] = useState<EpisodeType[]>([]);
  const [operationsPending, setOperationsPending] = useState(false);
  const [showQuickSelectModal, toggleShowQuickSelectModal] = useToggle(false);

  useEffect(() => {
    setSelectedSeries(0);
    setSelectedEpisode(undefined);
    setSelectedEpisodes([]);

    return () => invalidateQueries(['release-management', 'series', 'episodes']);
  }, [type]);

  const { mutateAsync: hideEpisode } = useHideEpisodeMutation();

  const hideEpisodes = () => {
    setOperationsPending(true);

    const operations = map(selectedEpisodes, episode => hideEpisode({ episodeId: episode.IDs.ID, hidden: true }));

    Promise.all(operations)
      .then(() => toast.success('Successful!'))
      .catch(() => toast.error('One or more operations failed!'))
      .finally(() => {
        setOperationsPending(false);
        resetQueries(['release-management']);
        setSelectedEpisodes([]);
      });
  };

  const handleRefresh = () => {
    if (isSeriesQueryFetching) return;
    invalidateQueries(['release-management', 'series']);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  return (
    <>
      <title>{`${titleMap[type]} | Shoko`}</title>
      <div className="flex grow flex-col gap-y-6 overflow-y-auto">
        <ShokoPanel title={<Title />} options={<ItemCount count={seriesCount} suffix="Series" />}>
          <div className="flex items-center gap-x-3">
            <div
              className={cx(
                'relative box-border flex grow items-center gap-x-4 rounded-md border border-panel-border bg-panel-background-alt px-4 py-2 transition-opacity',
                selectedEpisode && 'pointer-events-none opacity-65',
              )}
            >
              <MenuButton
                onClick={handleRefresh}
                icon={mdiRefresh}
                name="Refresh"
                loading={isSeriesQueryFetching}
                keybinding="R"
              />

              {type === 'MultipleReleases' && (
                <Checkbox
                  id="ignoreVariations"
                  isChecked={filterOptions.ignoreVariations}
                  onChange={handleFilterChange}
                  label="Ignore Variations"
                  labelRight
                />
              )}

              {type === 'MissingEpisodes' && (
                <Checkbox
                  id="onlyCollecting"
                  isChecked={filterOptions.onlyCollecting}
                  onChange={handleFilterChange}
                  label="Only Collecting"
                  labelRight
                />
              )}

              <Checkbox
                id="onlyFinishedSeries"
                isChecked={filterOptions.onlyFinishedSeries}
                onChange={handleFilterChange}
                label="Only Finished Series"
                labelRight
              />
            </div>

            {/* TODO: Add support for auto-delete */}
            {/* {!selectedEpisode && ( */}
            {/*   <Button */}
            {/*     buttonType="primary" */}
            {/*     className="flex gap-x-2.5 px-4 py-3 font-semibold" */}
            {/*     disabled={seriesCount === 0} */}
            {/*   > */}
            {/*     <Icon path={mdiFileDocumentMultipleOutline} size={0.8333} /> */}
            {/*     Auto-Delete Multiples */}
            {/*   </Button> */}
            {/* )} */}

            {(type !== 'MissingEpisodes') && (
              <Button
                buttonType="secondary"
                className="flex gap-x-2.5 px-4 py-3 font-semibold"
                disabled={!selectedSeries}
                onClick={toggleShowQuickSelectModal}
              >
                <Icon path={mdiSelectMultiple} size={0.8333} />
                Quick Select
              </Button>
            )}

            {(type === 'MissingEpisodes') && (
              <Button
                buttonType="primary"
                className="flex gap-x-2.5 px-4 py-3 font-semibold"
                onClick={hideEpisodes}
                loading={operationsPending}
              >
                <Icon path={mdiEyeOffOutline} size={0.8333} />
                Hide
              </Button>
            )}
          </div>
        </ShokoPanel>

        <SeriesList
          type={type}
          ignoreVariations={filterOptions.ignoreVariations}
          onlyCollecting={filterOptions.onlyCollecting}
          onlyFinishedSeries={filterOptions.onlyFinishedSeries}
          setSelectedEpisodes={setSelectedEpisodes}
          setSelectedSeriesId={setSelectedSeries}
          setSeriesCount={setSeriesCount}
        />

        <QuickSelectModal
          show={showQuickSelectModal}
          onClose={toggleShowQuickSelectModal}
          seriesId={selectedSeries}
          type={type}
        />
      </div>
    </>
  );
};

export default ReleaseManagement;
