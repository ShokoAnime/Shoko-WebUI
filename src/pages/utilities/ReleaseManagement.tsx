import React, { useEffect, useState } from 'react';
import { mdiCloseCircleOutline, mdiFileDocumentMultipleOutline, mdiRefresh, mdiSelectMultiple } from '@mdi/js';
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
import {
  useDeleteFileLocationMutation,
  useDeleteFileMutation,
  useMarkVariationMutation,
} from '@/core/react-query/file/mutations';
import { invalidateQueries, resetQueries } from '@/core/react-query/queryClient';
import useEventCallback from '@/hooks/useEventCallback';

import type { ReleaseManagementOptionsType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';
import type { AxiosResponse } from 'axios';

type Props = {
  type: 'multiples' | 'duplicates';
};

const ReleaseManagement = ({ type }: Props) => {
  const [ignoreVariations, toggleIgnoreVariations] = useToggle(true);
  const [onlyFinishedSeries, toggleOnlyFinishedSeries] = useToggle(false);
  const [seriesCount, setSeriesCount] = useState(0);
  const [selectedSeries, setSelectedSeries] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeType>();
  const [operationsPending, setOperationsPending] = useState(false);
  const [fileOptions, setFileOptions] = useState<ReleaseManagementOptionsType>({});
  const [showQuickSelectModal, toggleShowQuickSelectModal] = useToggle(false);

  useEffect(() => () => {
    setSelectedSeries(0);
  }, []);

  const { mutateAsync: deleteFile } = useDeleteFileMutation();
  const { mutateAsync: markVariation } = useMarkVariationMutation();
  const { mutateAsync: deleteFileLocation } = useDeleteFileLocationMutation();

  const handleCheckboxChange = (checkboxType: 'variations' | 'series') => {
    if (checkboxType === 'variations') toggleIgnoreVariations();
    if (checkboxType === 'series') toggleOnlyFinishedSeries();
  };

  const confirmChanges = useEventCallback(() => {
    setOperationsPending(true);

    let operations: (Promise<AxiosResponse<unknown, unknown>> | null)[];

    if (type === 'multiples') {
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

    Promise.all(operations)
      .then(() => toast.success('Successful!'))
      .catch(() => toast.error('One or more operations failed!'))
      .finally(() => {
        setOperationsPending(false);
        resetQueries(['release-management']);
        setSelectedEpisode(undefined);
      });
  });

  return (
    <>
      <title>{`Utilities > ${type === 'multiples' ? 'Multiple Releases' : 'Duplicate Files'} | Shoko`}</title>
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

              {type === 'multiples' && (
                <Checkbox
                  id="ignore-variations"
                  isChecked={ignoreVariations}
                  onChange={() => handleCheckboxChange('variations')}
                  label="Ignore Variations"
                  labelRight
                />
              )}

              <Checkbox
                id="only-finished-series"
                isChecked={onlyFinishedSeries}
                onChange={() => handleCheckboxChange('series')}
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

            {(type === 'multiples' && !selectedEpisode) && (
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
              ignoreVariations={ignoreVariations}
              onlyFinishedSeries={onlyFinishedSeries}
              setSelectedEpisode={setSelectedEpisode}
              setSelectedSeriesId={setSelectedSeries}
              setSeriesCount={setSeriesCount}
            />
          </TransitionDiv>

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
        </div>

        <QuickSelectModal
          show={showQuickSelectModal}
          onClose={toggleShowQuickSelectModal}
          seriesId={selectedSeries}
        />
      </div>
    </>
  );
};

export default ReleaseManagement;
