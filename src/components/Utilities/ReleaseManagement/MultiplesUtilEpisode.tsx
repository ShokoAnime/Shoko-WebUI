import React, { useEffect, useMemo, useState } from 'react';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, forEach } from 'lodash';

import FileInfo from '@/components/FileInfo';
import Select from '@/components/Input/Select';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';

import type { MultipleFileOptionsType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  episode: EpisodeType | undefined;
  setFileOptions: (options: MultipleFileOptionsType) => void;
};

const MultiplesUtilEpisode = ({ episode, setFileOptions }: Props) => {
  const [options, setOptions] = useState<MultipleFileOptionsType>(
    () => {
      const tempOptions: MultipleFileOptionsType = {};
      if (!episode) return tempOptions;

      forEach(episode.Files, (file) => {
        if (file.IsVariation) tempOptions[file.ID] = 'variation';
        else tempOptions[file.ID] = 'keep';
      });
      return tempOptions;
    },
  );

  const optionCounts = useMemo(() => countBy(options), [options]);

  useEffect(() => {
    setFileOptions(options);
  }, [options, setFileOptions]);

  if (!episode) return null;

  const handleOptionChange = (fileId: number, value: 'keep' | 'variation' | 'delete') => {
    setOptions(tempOptions => (
      { ...tempOptions, [fileId]: value }
    ));
  };

  return (
    <>
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
              value={options[file.ID]}
              onChange={event => handleOptionChange(file.ID, event.target.value as 'keep' | 'variation' | 'delete')}
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
    </>
  );
};

export default MultiplesUtilEpisode;
