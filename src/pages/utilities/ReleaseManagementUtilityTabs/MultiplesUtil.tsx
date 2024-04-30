import React, { useState } from 'react';
import { mdiCloseCircleOutline, mdiFileDocumentMultipleOutline, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { forEach, map, toNumber } from 'lodash';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import MultiplesUtilEpisode from '@/components/Utilities/ReleaseManagement/MultiplesUtilEpisode';
import MultiplesUtilList from '@/components/Utilities/ReleaseManagement/MultiplesUtilList';
import Title from '@/components/Utilities/ReleaseManagement/Title';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { useDeleteFileMutation, useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';
import useEventCallback from '@/hooks/useEventCallback';

import type { MultipleFileOptionsType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';

const MultiplesUtil = () => {
  const [ignoreVariations, toggleIgnoreVariations] = useToggle(true);
  const [onlyFinishedSeries, toggleOnlyFinishedSeries] = useToggle(true);
  const [seriesCount, setSeriesCount] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeType>();
  const [operationsPending, setOperationsPending] = useState(false);

  const { mutateAsync: deleteFile } = useDeleteFileMutation();
  const { mutateAsync: markVariation } = useMarkVariationMutation();

  const handleCheckboxChange = (type: 'variations' | 'series') => {
    if (type === 'variations') toggleIgnoreVariations();
    if (type === 'series') toggleOnlyFinishedSeries();
  };

  const [fileOptions, setFileOptions] = useState<MultipleFileOptionsType>(
    () => {
      const options: MultipleFileOptionsType = {};
      if (!selectedEpisode) return options;

      forEach(selectedEpisode.Files, (file) => {
        if (file.IsVariation) options[file.ID] = 'variation';
        else options[file.ID] = 'keep';
      });
      return options;
    },
  );

  const confirmChanges = useEventCallback(() => {
    setOperationsPending(true);

    const operations = map(fileOptions, (option, id) => {
      if (!selectedEpisode) return null;

      const file = selectedEpisode.Files!.find(item => item.ID === toNumber(id))!;
      if (option === 'delete') return deleteFile({ fileId: file.ID, removeFolder: false });
      if (option === 'variation' && !file.IsVariation) return markVariation({ fileId: file.ID, variation: true });
      if (option === 'keep' && file.IsVariation) return markVariation({ fileId: file.ID, variation: false });
      return null;
    });

    Promise.all(operations)
      .then(() => toast.success('Successful!'))
      .catch(() => toast.error('One or more operations failed!'))
      .finally(() => {
        setOperationsPending(false);
        invalidateQueries(['release-management', 'series']);
        setSelectedEpisode(undefined);
      });
  });

  const handleFileOptionChange = (fileId: number, value: 'keep' | 'variation' | 'delete') => {
    setFileOptions(options => (
      { ...options, [fileId]: value }
    ));
  };

  return (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto">
      <ShokoPanel title={<Title />} options={<ItemCount count={seriesCount} series />}>
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

            <Checkbox
              id="ignore-variations"
              isChecked={ignoreVariations}
              onChange={() => handleCheckboxChange('variations')}
              label="Ignore Variations"
              labelRight
            />

            <Checkbox
              id="only-finished-series"
              isChecked={onlyFinishedSeries}
              onChange={() => handleCheckboxChange('series')}
              label="Only Finished Series"
              labelRight
            />
          </div>

          {!selectedEpisode && (
            <Button
              buttonType="primary"
              className="flex gap-x-2.5 px-4 py-3 font-semibold"
              // disabled={seriesCount === 0}
              disabled
            >
              <Icon path={mdiFileDocumentMultipleOutline} size={0.8333} />
              Auto-Delete Multiples
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
          <MultiplesUtilList
            ignoreVariations={ignoreVariations}
            onlyFinishedSeries={onlyFinishedSeries}
            setSelectedEpisode={setSelectedEpisode}
            setSeriesCount={setSeriesCount}
          />
        </TransitionDiv>

        <TransitionDiv
          show={!!selectedEpisode}
          className="absolute flex size-full flex-col gap-y-6 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6"
        >
          <MultiplesUtilEpisode
            episode={selectedEpisode}
            fileOptions={fileOptions}
            handleOptionChange={handleFileOptionChange}
          />
        </TransitionDiv>
      </div>
    </div>
  );
};

export default MultiplesUtil;
