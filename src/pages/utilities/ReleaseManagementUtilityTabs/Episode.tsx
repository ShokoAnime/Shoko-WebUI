import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mdiCloseCircleOutline, mdiFileDocumentMultipleOutline, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, forEach } from 'lodash';

import FileInfo from '@/components/FileInfo';
import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Title from '@/components/Utilities/ReleaseManagement/Title';

import type { EpisodeType } from '@/core/types/api/episode';

type FileOptionsType = Record<number, 'keep' | 'variation' | 'delete'>;

const Menu = () => (
  <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
    Placeholder
  </div>
);

const Episode = () => {
  const navigate = useNavigate();
  const locationState = useLocation()?.state as { episode: EpisodeType };

  if (!locationState) navigate('../release-management', { replace: true });
  const { episode } = locationState;

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

  return (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto">
      <ShokoPanel title={<Title />}>
        <div className="flex items-center justify-end gap-x-3">
          <Menu />
          <Button
            buttonType="secondary"
            className="flex gap-x-2.5 px-4 py-3 font-semibold"
            onClick={() => navigate('../release-management')}
          >
            <Icon path={mdiCloseCircleOutline} size={0.8333} />
            Cancel
          </Button>
          <Button buttonType="primary" className="flex gap-x-2.5 px-4 py-3 font-semibold">
            <Icon path={mdiFileDocumentMultipleOutline} size={0.8333} />
            Confirm
          </Button>
        </div>
      </ShokoPanel>
      <div className="flex grow flex-col gap-y-6 overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
        <div className="flex justify-between rounded-lg border border-panel-border bg-panel-table-header p-4 font-semibold">
          {`${episode.AniDB?.EpisodeNumber} - ${episode.Name}`}
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
                className="flex items-center"
                id="mark-variation"
                value={fileOptions[file.ID]}
                onChange={event => handleOptionChange(event, file.ID)}
              >
                <option value="keep">Will be kept</option>
                <option value="delete">Will be deleted</option>
                <option value="variation">Marked as a Variation</option>
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

export default Episode;
