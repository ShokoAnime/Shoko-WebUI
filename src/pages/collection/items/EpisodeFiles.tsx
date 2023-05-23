import React, { useEffect, useState } from 'react';
import { useGetEpisodeFilesQuery } from '@/core/rtkQuery/splitV3Api/episodeApi';
import { get, map } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight, mdiFileDocumentMultipleOutline, mdiOpenInNew, mdiRestart, mdiWeb } from '@mdi/js';
import Button from '@/components/Input/Button';
import { EpisodeFileInfo } from '@/pages/collection/items/EpisodeFileInfo';

type Props = {
  show: boolean;
  episodeId: string;
  resetHeight: () => void;
};

export const EpisodeFiles = ({ show, episodeId, resetHeight }: Props) => {
  if (!show) { return null; }
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  const episodeFilesData = useGetEpisodeFilesQuery({ episodeId, includeDataFrom: ['AniDB'], includeMediaInfo: true });
  const episodeFiles = episodeFilesData?.data || [];
  
  useEffect(() => {
    resetHeight();
  }, [episodeFiles.length]);

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
            <div className="flex mt-8 px-2 py-3 justify-between bg-background-nav border-background-border">
              <div className="flex space-x-3">
                <div className="space-x-2 flex">
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
                File <span className="ml-2 text-highlight-2">{selectedFileIdx + 1} / {episodeFiles.length}</span>
                <div className="flex">
                  <Button onClick={() => setSelectedFileIdx(selectedFileIdx <= 0 ? 0 : selectedFileIdx - 1)}>
                    <Icon path={mdiChevronLeft} size={1} className="opacity-75 text-highlight-1"/>
                  </Button>
                  <Button onClick={() => setSelectedFileIdx(selectedFileIdx + 1 >= episodeFiles.length ? episodeFiles.length - 1 : selectedFileIdx + 1)} className="ml-2">
                    <Icon path={mdiChevronRight} size={1} className="opacity-75 text-highlight-1"/>
                  </Button>
                </div>
              </div>}
            </div>
            <div className="mt-4">
              <EpisodeFileInfo file={episodeFiles[selectedFileIdx]} selectedFile={selectedFileIdx}/>
            </div>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};