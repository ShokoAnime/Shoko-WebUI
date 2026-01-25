import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import {
  mdiCloseCircleOutline,
  mdiEyeOffOutline,
  mdiFileDocumentMultipleOutline,
  mdiRefresh,
  mdiSelectMultiple,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map, toNumber } from 'lodash';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import Episode from '@/components/Utilities/ReleaseManagement/Episode';
import QuickSelectModal from '@/components/Utilities/ReleaseManagement/QuickSelectModal';
import SeriesList from '@/components/Utilities/ReleaseManagement/SeriesList';
import Title from '@/components/Utilities/ReleaseManagement/Title';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { useHideEpisodeMutation } from '@/core/react-query/episode/mutations';
import {
  useDeleteFileLocationMutation,
  useDeleteFileMutation,
  useMarkVariationMutation,
} from '@/core/react-query/file/mutations';
import { invalidateQueries, resetQueries } from '@/core/react-query/queryClient';
import { ReleaseManagementItemType } from '@/core/react-query/release-management/types';

import type { ReleaseManagementOptionsType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';
import type { AxiosResponse } from 'axios';

const titleMap = {
  [ReleaseManagementItemType.MultipleReleases]: 'Multiple Releases',
  [ReleaseManagementItemType.DuplicateFiles]: 'Duplicate Files',
  [ReleaseManagementItemType.MissingEpisodes]: 'Missing Episodes',
} as const;

const ReleaseManagement = () => {
  const { itemType } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const type = useMemo(() => {
    if (itemType === 'duplicates') return ReleaseManagementItemType.DuplicateFiles;
    if (itemType === 'missing-episodes') return ReleaseManagementItemType.MissingEpisodes;
    return ReleaseManagementItemType.MultipleReleases;
  }, [itemType]);

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
  const [fileOptions, setFileOptions] = useState<ReleaseManagementOptionsType>({});
  const [showQuickSelectModal, toggleShowQuickSelectModal] = useToggle(false);

  useEffect(() => {
    setSelectedSeries(0);
    setSelectedEpisode(undefined);
    setSelectedEpisodes([]);
  }, [itemType]);

  const { mutateAsync: deleteFile } = useDeleteFileMutation();
  const { mutateAsync: markVariation } = useMarkVariationMutation();
  const { mutateAsync: deleteFileLocation } = useDeleteFileLocationMutation();
  const { mutateAsync: hideEpisode } = useHideEpisodeMutation();

  const confirmChanges = () => {
    setOperationsPending(true);

    let operations: (Promise<AxiosResponse<unknown, unknown>> | null)[];

    if (type === ReleaseManagementItemType.MultipleReleases) {
      operations = map(fileOptions, (option, id) => {
        if (!selectedEpisode) return null;

        const file = selectedEpisode.Files!.find(item => item.ID === toNumber(id))!;
        if (!file) return null;
        if (option === 'delete') return deleteFile({ fileId: file.ID, removeFolder: false });
        if (option === 'variation' && !file.IsVariation) return markVariation({ fileId: file.ID, variation: true });
        if (option === 'keep' && file.IsVariation) return markVariation({ fileId: file.ID, variation: false });
        return null;
      });
    } else {
      operations = map(fileOptions, (option, id) => {
        if (!selectedEpisode || option !== 'delete') return null;
        return deleteFileLocation({ locationId: toNumber(id) });
      });
    }

    Promise.all(operations.filter(operation => !!operation))
      .then(() => toast.success('Successful!'))
      .catch(() => toast.error('One or more operations failed!'))
      .finally(() => {
        setOperationsPending(false);
        resetQueries(['release-management']);
        setSelectedEpisode(undefined);
      });
  };

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
                onClick={() => invalidateQueries(['release-management', 'series'])}
                icon={mdiRefresh}
                name="Refresh"
              />

              {type === ReleaseManagementItemType.MultipleReleases && (
                <Checkbox
                  id="ignoreVariations"
                  isChecked={filterOptions.ignoreVariations}
                  onChange={handleFilterChange}
                  label="Ignore Variations"
                  labelRight
                />
              )}

              {type === ReleaseManagementItemType.MissingEpisodes && (
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

            {!selectedEpisode && (
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

            {(type === ReleaseManagementItemType.MissingEpisodes) && (
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

            {selectedEpisode && (
              <div className="flex items-center justify-end gap-x-3">
                <Button
                  buttonType="secondary"
                  className="flex gap-x-2.5 px-4 py-3 font-semibold"
                  onClick={() => setSelectedEpisode(undefined)}
                >
                  <Icon path={mdiCloseCircleOutline} size={0.8333} />
                  Cancel
                </Button>
                <Button
                  buttonType="primary"
                  className="flex gap-x-2.5 px-4 py-3 font-semibold"
                  onClick={confirmChanges}
                  loading={operationsPending}
                >
                  <Icon path={mdiFileDocumentMultipleOutline} size={0.8333} />
                  Confirm
                </Button>
              </div>
            )}
          </div>
        </ShokoPanel>

        <div className="relative flex grow">
          <TransitionDiv show={!selectedEpisode} className="absolute flex size-full gap-x-3">
            <SeriesList
              type={type}
              ignoreVariations={filterOptions.ignoreVariations}
              onlyCollecting={filterOptions.onlyCollecting}
              onlyFinishedSeries={filterOptions.onlyFinishedSeries}
              setSelectedEpisode={setSelectedEpisode}
              setSelectedEpisodes={setSelectedEpisodes}
              setSelectedSeriesId={setSelectedSeries}
              setSeriesCount={setSeriesCount}
            />
          </TransitionDiv>

          {type !== ReleaseManagementItemType.MissingEpisodes && (
            <TransitionDiv
              show={!!selectedEpisode}
              className="absolute flex size-full flex-col gap-y-6 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6"
            >
              <Episode
                type={type}
                episode={selectedEpisode}
                setFileOptions={setFileOptions}
              />
            </TransitionDiv>
          )}
        </div>

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
