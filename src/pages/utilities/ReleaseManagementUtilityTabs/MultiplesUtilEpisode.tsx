import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mdiCloseCircleOutline, mdiFileDocumentMultipleOutline, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, forEach, map, toNumber } from 'lodash';

import FileInfo from '@/components/FileInfo';
import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import Title from '@/components/Utilities/ReleaseManagement/Title';
import { useDeleteFileMutation, useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { invalidateQueries } from '@/core/react-query/queryClient';
import getEpisodePrefix from '@/core/utilities/getEpisodePrefix';
import useEventCallback from '@/hooks/useEventCallback';

import type { EpisodeType } from '@/core/types/api/episode';

type FileOptionsType = Record<number, 'keep' | 'variation' | 'delete'>;

const Menu = () => (
  <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
    Placeholder
  </div>
);

const MultiplesUtilEpisode = () => {
  const navigate = useNavigate();
  const locationState = useLocation()?.state as { episode: EpisodeType };

  if (!locationState) navigate('../release-management', { replace: true });
  const { episode } = locationState;

  const { mutateAsync: deleteFile } = useDeleteFileMutation();
  const { mutateAsync: markVariation } = useMarkVariationMutation();

  const [operationsPending, setOperationsPending] = useState(false);

  const [
    fileOptions,
    setFileOptions,
  ] = useState<FileOptionsType>(() => {
    const options: FileOptionsType = {};
    forEach(episode.Files, (file) => {
      if (file.IsVariation) options[file.ID] = 'variation';
      else options[file.ID] = 'keep';
    });
    return options;
  });

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>, fileId: number) => {
    setFileOptions(options => (
      { ...options, [fileId]: event.target.value as 'keep' | 'variation' | 'delete' }
    ));
  };

  const optionCounts = useMemo(() => countBy(fileOptions), [fileOptions]);

  const confirmChanges = useEventCallback(() => {
    setOperationsPending(true);

    const operations = map(fileOptions, (option, id) => {
      const file = episode.Files!.find(item => item.ID === toNumber(id))!;
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
        navigate('../release-management', { replace: true });
      });
  });

  return (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto">
      <ShokoPanel title={<Title />}>
        <div className="flex items-center justify-end gap-x-3">
          <Menu />
          <Button
            buttonType="secondary"
            className="flex gap-x-2.5 px-4 py-3 font-semibold"
            onClick={() => navigate(-1)}
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
      </ShokoPanel>
      <div className="flex grow flex-col gap-y-6 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
        <div className="flex justify-between rounded-lg border border-panel-border bg-panel-table-header p-4 font-semibold">
          {`${getEpisodePrefix(episode.AniDB?.Type)}${episode.AniDB?.EpisodeNumber} - ${episode.Name}`}
          <div>
            <span className="text-panel-text-important">{optionCounts.keep ?? 0}</span>
            &nbsp;Kept |&nbsp;
            <span className="text-panel-text-warning">{optionCounts.variation ?? 0}</span>
            &nbsp;Variation |&nbsp;
            <span className="text-panel-text-danger">{optionCounts.delete ?? 0}</span>
            &nbsp;Delete
          </div>
        </div>

        {episode.Files?.map(file => (
          <div
            key={file.ID}
            className="flex justify-between gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt p-4"
          >
            <FileInfo file={file} compact />

            <div className="flex flex-col gap-y-4">
              <Select
                id="mark-variation"
                value={fileOptions[file.ID]}
                onChange={event => handleOptionChange(event, file.ID)}
              >
                <option value="keep">Will be kept</option>
                <option value="delete">Will be deleted</option>
                <option value="variation">Marked as Variation</option>
              </Select>

              {file.AniDB?.ID && (
                <div className="flex gap-x-2">
                  <div className="metadata-link-icon AniDB" />
                  <a
                    href={`https://anidb.net/file/${file.AniDB.ID}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex cursor-pointer gap-x-1 font-semibold text-panel-text-primary"
                    aria-label="Open AniDB file page"
                  >
                    {file.AniDB.ID}
                    <span>(AniDB)</span>
                    <Icon path={mdiOpenInNew} size={1} />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiplesUtilEpisode;
