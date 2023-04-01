import React, { useEffect, useState } from 'react';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useGetEpisodeFilesQuery, useGetEpisodeQuery } from '../../../core/rtkQuery/splitV3Api/episodeApi';
import { get, map, toNumber } from 'lodash';
import BackgroundImagePlaceholderDiv from '../../../components/BackgroundImagePlaceholderDiv';
import { Icon } from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight, mdiFileDocumentMultipleOutline, mdiOpenInNew, mdiRestart, mdiWeb } from '@mdi/js';
import { EpisodeTvDBType } from '../../../core/types/api/episode';
import { ImageType } from '../../../core/types/api/common';
import Button from '../../../components/Input/Button';
import { EpisodeDetails } from '../items/EpisodeDetails';

const Heading = episode => (
  <React.Fragment>
    <Link className="text-highlight-1" to="../episodes">Episodes</Link>
    <span className="px-2">&gt;</span>
    <span>Episode {episode.AniDB.EpisodeNumber} - {episode.Name}</span>
  </React.Fragment>
);

const getThumbnailUrl = (episode: EpisodeTvDBType[]) => {
  const thumbnail = get<EpisodeTvDBType[], string, ImageType | null>(episode, '0.Thumbnail', null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
};

const EpisodeFileInfo = ({ file, selectedFile }) => {
  const VideoInfo:string[] = [];
  const VideoSource = get(file, 'AniDB.Source');
  if (VideoSource) { VideoInfo.push(VideoSource); }
  const VideoBitDepth = get(file, 'MediaInfo.Video.0.BitDepth');
  if (VideoBitDepth) { VideoInfo.push(`${VideoBitDepth}-bit`); }
  const VideoBitRate = get(file, 'MediaInfo.Video.0.BitRate');
  if (VideoBitRate) { VideoInfo.push(`${Math.round(toNumber(VideoBitRate) / 1024)} kb/s`); }
  const VideoResolution = get(file, 'MediaInfo.Video.0.Resolution');
  if (VideoResolution) { VideoInfo.push(VideoResolution); }
  const VideoWidth = get(file, 'MediaInfo.Video.0.Width');
  const VideoHeight = get(file, 'MediaInfo.Video.0.Height');
  if (VideoWidth && VideoHeight) { VideoInfo.push(`${VideoWidth}x${VideoHeight}`); }

  const AudioInfo:string[] = [];
  const AudioFormat = get(file, 'MediaInfo.Audio.0.Format.Name');
  const AudioLanguages = map(file.MediaInfo.Audio, item => item.LanguageCode);
  if (AudioFormat) { AudioInfo.push(AudioFormat); }
  if (AudioLanguages && AudioLanguages.length > 0) { AudioInfo.push(`${AudioLanguages.length > 1 ? 'Multi Audio' : 'Audio'} (${AudioLanguages.join(',')})`); }
  const SubtitleLanguages = map(file.MediaInfo.Subtitles, item => item.LanguageCode);
  if (SubtitleLanguages && SubtitleLanguages.length > 0) { AudioInfo.push(`${SubtitleLanguages.length > 1 ? 'Multi Subs' : 'Subs'} (${SubtitleLanguages.join(',')})`); }
  
  return (
    <React.Fragment>
      <ShokoPanel title="File Details">
        <div className="flex flex-col space-y-1">
          <div className="font-semibold">File {selectedFile + 1}</div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">File Name</div>
            {get(file, 'Locations.0.RelativePath', '')}
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">Location</div>
            {get(file, 'Locations.0.RelativePath', '')}
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">Size</div>
            {(toNumber(get(file, 'Size', '')) / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">Group</div>
            {get(file, 'AniDB.ReleaseGroup.Name', '')} | v{get(file, 'AniDB.Version', '')}
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">Video</div>
            {VideoInfo.join(' | ')}
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">Audio</div>
            {AudioInfo.join(' | ')}
          </div>
        </div>
      </ShokoPanel>
      <ShokoPanel title="File Hashes" className="mt-4">
        <div className="flex flex-col space-y-1">
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">Hash</div>
            {get(file, 'Hashes.ED2K', '')}
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">CRC</div>
            {get(file, 'Hashes.CRC32', '')}
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">SHA1</div>
            {get(file, 'Hashes.SHA1', '')}
          </div>
          <div className="flex">
            <div className=" min-w-[9.375rem] font-semibold">MD5</div>
            {get(file, 'Hashes.MD5', '')}
          </div>
        </div>
      </ShokoPanel>
    </React.Fragment>
  );
};

const EpisodeFiles = ({ episodeId }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  const episodeFilesData = useGetEpisodeFilesQuery({ episodeId, includeDataFrom: ['AniDB'], includeMediaInfo: true });
  const episodeFiles = episodeFilesData?.data || [];
  
  if (!episodeFiles.length || episodeFiles.length < 1) {
    return <div className="flex grow justify-center items-center font-semibold">No files found!</div>;
  }

  const selectedFile = get(episodeFiles, selectedFileIdx, false);
  const ReleaseGroupID = get(episodeFiles, `${selectedFileIdx}.AniDB.ReleaseGroup.ID`, 0);
  const ReleaseGroupName = get(episodeFiles, `${selectedFileIdx}.AniDB.ReleaseGroup.Name`, null);
  
  return (
    <React.Fragment>
      <div className="flex mt-8 px-2 py-3 justify-between bg-background-nav border-background-border">
        <div className="flex space-x-3">
          <div className="space-x-2 flex">
            <Icon path={mdiRestart} size={1} />
            <span>Force Update File Info</span>
          </div>
          <div className="space-x-2 flex">
            <Icon path={mdiFileDocumentMultipleOutline} size={1} />
            <span>Unmark File as Variation</span>
          </div>
          {selectedFile && <a href={`https://anidb.net/file/${selectedFile.ID}`} target="_blank" rel="noopener noreferrer">
              <div className="space-x-2 flex text-highlight-1">
                  <div className="metadata-link-icon anidb"/>
                  <span>{selectedFile.ID}</span>
                  <span>AniDB</span>
                  <Icon path={mdiOpenInNew} size={1} className="cursor-pointer" />
              </div>
          </a>}
          {ReleaseGroupID > 0 && <a href={`https://anidb.net/group/${ReleaseGroupID}`} target="_blank" rel="noopener noreferrer">
              <div className="space-x-2 flex text-highlight-1">
                  <Icon className="text-font-main" path={mdiWeb} size={1} />
                  <span>{ReleaseGroupName === null ? 'Unknown' : ReleaseGroupName}</span>
                  <Icon path={mdiOpenInNew} size={1} />
              </div>
          </a>}
        </div>
        {episodeFiles && episodeFiles.length > 1 && <div className="flex space-x-2">
            File <span className="ml-2 text-highlight-2">{selectedFileIdx + 1} / {episodeFiles.length}</span>
            <div className="flex">
                <Button onClick={() => setSelectedFileIdx(selectedFileIdx <= 0 ? 0 : selectedFileIdx - 1)}>
                    <Icon path={mdiChevronLeft} size={1} className="opacity-75 text-highlight-1" />
                </Button>
                <Button onClick={() => setSelectedFileIdx(selectedFileIdx + 1 >= episodeFiles.length ? episodeFiles.length - 1 : selectedFileIdx + 1)} className="ml-2">
                    <Icon path={mdiChevronRight} size={1} className="opacity-75 text-highlight-1" />
                </Button>
            </div>
        </div>}
      </div>
      <div className="mt-4">
          <EpisodeFileInfo file={episodeFiles[selectedFileIdx]} selectedFile={selectedFileIdx} />
      </div>
    </React.Fragment>
  );
};

const SeriesEpisodeDetails = () => {
  const { episodeId } = useParams();
  if (!episodeId) { return null; }
  
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  const episodeData = useGetEpisodeQuery({ episodeId, includeDataFrom: ['AniDB', 'TvDB'] });
  const episode = episodeData.data;
  
  
  useEffect(() => {
    if (!episode || !episode.TvDB) { return; }
    if (get(episode, 'TvDB.0.Thumbnail', null) === null) { return; }
    setThumbnailUrl(getThumbnailUrl(episode.TvDB));
  }, [episode]);
  
  if (!episode) { return null; }
  
  return (
    <div className="flex flex-col">
      <ShokoPanel title={Heading(episode)} className="flex flex-col grow">
        <div className="flex space-x-8">
          <BackgroundImagePlaceholderDiv imageSrc={thumbnailUrl}
                                         className="h-[15.8125rem] min-w-[28.125rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2"/>
          <EpisodeDetails episode={episode}/>
        </div>
      </ShokoPanel>
      <EpisodeFiles episodeId={episodeId}/>
    </div>
  );
};

export default SeriesEpisodeDetails;