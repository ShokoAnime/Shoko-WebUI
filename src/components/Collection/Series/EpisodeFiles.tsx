import React from 'react';
import { mdiEyeOutline, mdiOpenInNew, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import { get, map } from 'lodash';

import toast from '@/components/Toast';
import { usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';

import EpisodeFileInfo from './EpisodeFileInfo';

import type { FileType } from '@/core/types/api/file';

type Props = {
  episodeFiles: FileType[];
};

const EpisodeFiles = ({ episodeFiles }: Props) => {
  const [fileRescanTrigger] = usePostFileRescanMutation();

  const rescanFile = async (id) => {
    try {
      await fileRescanTrigger(id).unwrap();
      toast.success('Rescanning file!');
    } catch (error) {
      toast.error(`Rescan failed for file! ${error}`);
    }
  };

  if (!episodeFiles.length || episodeFiles.length < 1) {
    return <div className="flex grow items-center justify-center p-8 pt-4 font-semibold">No files found!</div>;
  }

  return (
    <div className="flex flex-col gap-y-8 p-8 pt-4">
      {map(episodeFiles, (selectedFile) => {
        const ReleaseGroupID = get(selectedFile, 'AniDB.ReleaseGroup.ID', 0);
        const ReleaseGroupName = get(selectedFile, 'AniDB.ReleaseGroup.Name', null);

        return (
          <div className="flex flex-col gap-y-8" key={selectedFile.ID}>
            <div className="flex grow gap-x-3 rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
              <div
                className="flex cursor-pointer items-center gap-x-2"
                onClick={async () => {
                  await rescanFile(selectedFile.ID);
                }}
              >
                <Icon path={mdiRefresh} size={1} />
                Force Update File Info
              </div>
              <div className="flex items-center gap-x-2">
                <Icon path={mdiEyeOutline} size={1} />
                {selectedFile.IsVariation ? 'Unmark' : 'Mark'}
                &nbsp;File as Variation
              </div>
              {selectedFile.AniDB && (
                <a href={`https://anidb.net/file/${selectedFile.AniDB.ID}`} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                    <div className="metadata-link-icon anidb" />
                    {`${selectedFile.AniDB.ID} (AniDB)`}
                    <Icon path={mdiOpenInNew} size={1} />
                  </div>
                </a>
              )}
              {ReleaseGroupID > 0 && (
                <a href={`https://anidb.net/group/${ReleaseGroupID}`} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                    <div className="metadata-link-icon anidb" />
                    {ReleaseGroupName === null ? 'Unknown' : ReleaseGroupName}
                    <Icon path={mdiOpenInNew} size={1} />
                  </div>
                </a>
              )}

              {selectedFile.IsVariation && (
                <span className="ml-auto font-semibold text-panel-text-important">Variation</span>
              )}
            </div>

            <EpisodeFileInfo file={selectedFile} />
          </div>
        );
      })}
    </div>
  );
};

export default EpisodeFiles;
