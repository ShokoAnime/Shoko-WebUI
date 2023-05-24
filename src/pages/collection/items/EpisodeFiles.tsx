import React, { useEffect } from 'react';
import { useGetEpisodeFilesQuery } from '@/core/rtkQuery/splitV3Api/episodeApi';
import { get, map } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiFileDocumentMultipleOutline, mdiOpenInNew, mdiRestart, mdiWeb } from '@mdi/js';
import { EpisodeFileInfo } from '@/pages/collection/items/EpisodeFileInfo';
import { usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import toast from '@/components/Toast';

type Props = {
  show: boolean;
  episodeId: string;
  resetHeight: () => void;
};

export const EpisodeFiles = ({ show, episodeId, resetHeight }: Props) => {
  if (!show) { return null; }

  const episodeFilesData = useGetEpisodeFilesQuery({ episodeId, includeDataFrom: ['AniDB'], includeMediaInfo: true });
  const episodeFiles = episodeFilesData?.data || [];

  const [fileRescanTrigger] = usePostFileRescanMutation();
  
  useEffect(() => {
    resetHeight();
  }, [episodeFiles.length]);
  
  const rescanFile = async (id) => {
    try {
      await fileRescanTrigger(id).unwrap();
      toast.success('Rescanning file!');
    } catch (error) {
      toast.error(`Rescan failed for file! ${error}`);
    }
  };

  if (!episodeFiles.length || episodeFiles.length < 1) {
    return <div className="flex grow justify-center items-center font-semibold">No files found!</div>;
  }

  return (
    <React.Fragment>
      {map(episodeFiles, (selectedFile) => {
        const ReleaseGroupID = get(selectedFile, 'AniDB.ReleaseGroup.ID', 0);
        const ReleaseGroupName = get(selectedFile, 'AniDB.ReleaseGroup.Name', null);

        return (
          <React.Fragment>
            <div className="flex mx-8 px-2 py-3 justify-between bg-background-nav border-background-border">
              <div className="flex space-x-3">
                <div className="space-x-2 flex cursor-pointer" onClick={async () => { await rescanFile(selectedFile.ID); }}>
                  <Icon path={mdiRestart} size={1}/>
                  <span>Force Update File Info</span>
                </div>
                <div className="space-x-2 flex">
                  <Icon path={mdiFileDocumentMultipleOutline} size={1}/>
                  <span>Unmark File as Variation</span>
                </div>
                {selectedFile && selectedFile.AniDB && <a href={`https://anidb.net/file/${selectedFile.AniDB.ID}`} target="_blank" rel="noopener noreferrer">
                  <div className="space-x-2 flex text-highlight-1">
                    <div className="metadata-link-icon anidb"/>
                    <span>{selectedFile.AniDB.ID}</span>
                    <span>AniDB</span>
                    <Icon path={mdiOpenInNew} size={1} className="cursor-pointer"/>
                  </div>
                </a>}
                {ReleaseGroupID > 0 && <a href={`https://anidb.net/group/${ReleaseGroupID}`} target="_blank" rel="noopener noreferrer">
                  <div className="space-x-2 flex text-highlight-1">
                    <Icon className="text-font-main" path={mdiWeb} size={1}/>
                    <span>{ReleaseGroupName === null ? 'Unknown' : ReleaseGroupName}</span>
                    <Icon path={mdiOpenInNew} size={1}/>
                  </div>
                </a>}
              </div>
              {episodeFiles && episodeFiles.length > 1 && <div className="flex space-x-2">
                {selectedFile?.IsVariation && <span className="text-highlight-2">Variation</span>}
                
              </div>}
            </div>
            <div className="mt-4 mx-8">
              <EpisodeFileInfo file={selectedFile} />
            </div>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};