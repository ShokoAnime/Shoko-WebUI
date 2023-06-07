import React from 'react';
import { get, map } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiEyeOutline, mdiOpenInNew, mdiRefresh } from '@mdi/js';

import { usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import toast from '@/components/Toast';
import type { FileType } from '@/core/types/api/file';
import { EpisodeFileInfo } from './EpisodeFileInfo';

type Props = {
  episodeFiles: FileType[];
};

export const EpisodeFiles = ({ episodeFiles }: Props) => {
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
    return <div className="flex grow justify-center items-center font-semibold p-8 pt-4">No files found!</div>;
  }

  return (
    <div className="flex flex-col gap-y-8 p-8 pt-4">
      {map(episodeFiles, (selectedFile) => {
        const ReleaseGroupID = get(selectedFile, 'AniDB.ReleaseGroup.ID', 0);
        const ReleaseGroupName = get(selectedFile, 'AniDB.ReleaseGroup.Name', null);

        return (
          <div className="flex flex-col gap-y-8" key={selectedFile.ID}>

            <div className="flex px-4 py-3 bg-background border border-background-border rounded-md gap-x-3 grow">
              <div className="gap-x-2 flex cursor-pointer items-center" onClick={async () => { await rescanFile(selectedFile.ID); }}>
                <Icon path={mdiRefresh} size={1} />
                Force Update File Info
              </div>
              <div className="gap-x-2 flex items-center">
                <Icon path={mdiEyeOutline} size={1} />
                {selectedFile.IsVariation ? 'Unmark' : 'Mark'} File as Variation
              </div>
              {selectedFile.AniDB && (
              <a href={`https://anidb.net/file/${selectedFile.AniDB.ID}`} target="_blank" rel="noopener noreferrer">
                <div className="gap-x-2 flex text-highlight-1 font-semibold items-center">
                  <div className="metadata-link-icon anidb" />
                  {`${selectedFile.AniDB.ID} (AniDB)`}
                  <Icon path={mdiOpenInNew} size={1} />
                </div>
              </a>
              )}
              {ReleaseGroupID > 0 && (
              <a href={`https://anidb.net/group/${ReleaseGroupID}`} target="_blank" rel="noopener noreferrer">
                <div className="gap-x-2 flex text-highlight-1 font-semibold items-center">
                  <div className="metadata-link-icon anidb" />
                  {ReleaseGroupName === null ? 'Unknown' : ReleaseGroupName}
                  <Icon path={mdiOpenInNew} size={1} />
                </div>
              </a>
              )}

              {selectedFile.IsVariation && <span className="text-highlight-2 ml-auto font-semibold">Variation</span>}
            </div>

            <EpisodeFileInfo file={selectedFile} />

          </div>
        );
      })}
    </div>
  );
};
