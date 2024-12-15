import React, { useEffect, useMemo, useState } from 'react';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, flatMap, forEach, map, toNumber } from 'lodash';

import FileInfo from '@/components/FileInfo';
import Select from '@/components/Input/Select';
import { ReleaseManagementItemType } from '@/core/react-query/release-management/types';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';

import type { ReleaseManagementOptionsType } from '@/components/Utilities/constants';
import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  type: ReleaseManagementItemType;
  episode: EpisodeType | undefined;
  setFileOptions: (options: ReleaseManagementOptionsType) => void;
};

const Episode = ({ episode, setFileOptions, type }: Props) => {
  const [options, setOptions] = useState<ReleaseManagementOptionsType>(
    () => {
      const tempOptions: ReleaseManagementOptionsType = {};
      if (!episode) return tempOptions;

      if (type === ReleaseManagementItemType.MultipleReleases) {
        forEach(episode.Files, (file) => {
          if (file.IsVariation) tempOptions[file.ID] = 'variation';
          else tempOptions[file.ID] = 'keep';
        });
        return tempOptions;
      }

      forEach(
        flatMap(episode.Files, file => file.Locations),
        (location) => {
          tempOptions[location.ID] = 'keep';
        },
      );
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
          {type === ReleaseManagementItemType.MultipleReleases && (
            <>
              <span className="text-panel-text-warning">{optionCounts.variation ?? 0}</span>
              &nbsp;Variation |&nbsp;
            </>
          )}
          <span className="text-panel-text-danger">{optionCounts.delete ?? 0}</span>
          &nbsp;Delete
        </div>
      </div>

      {type === ReleaseManagementItemType.DuplicateFiles && flatMap(episode.Files, file =>
        map(file.Locations, (location, index) => {
          const absolutePath = location.AbsolutePath ?? '??';
          const fileName = absolutePath.split(/[/\\]+/).pop();
          const folderPath = absolutePath.slice(0, absolutePath.replaceAll('\\', '/').lastIndexOf('/') + 1);

          return (
            <div
              key={location.ID}
              className="flex justify-between gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt p-4"
            >
              <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                  <div className="flex">
                    <div className="min-w-[9.375rem] font-semibold">File Name</div>
                    {fileName}
                  </div>
                  <div className="flex">
                    <div className="min-w-[9.375rem] font-semibold">Location</div>
                    {folderPath}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <Select
                  id="mark-variation"
                  value={options[toNumber(`${file.ID}${index}`)]}
                  onChange={event =>
                    handleOptionChange(
                      location.ID,
                      event.target.value as 'keep' | 'delete',
                    )}
                >
                  <option value="keep">Will be kept</option>
                  <option value="delete">Will be deleted</option>
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
          );
        }))}

      {type === ReleaseManagementItemType.MultipleReleases && episode.Files?.map(file => (
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

export default Episode;
