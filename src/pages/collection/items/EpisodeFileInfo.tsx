import { get, map, toNumber } from 'lodash';
import React from 'react';
import ShokoPanel from '@/components/Panels/ShokoPanel';

export const EpisodeFileInfo = ({ file, selectedFile }) => {
  const VideoInfo: string[] = [];
  const VideoSource = get(file, 'AniDB.Source');
  if (VideoSource) {
    VideoInfo.push(VideoSource);
  }
  const VideoBitDepth = get(file, 'MediaInfo.Video.0.BitDepth');
  if (VideoBitDepth) {
    VideoInfo.push(`${VideoBitDepth}-bit`);
  }
  const VideoBitRate = get(file, 'MediaInfo.Video.0.BitRate');
  if (VideoBitRate) {
    VideoInfo.push(`${Math.round(toNumber(VideoBitRate) / 1024)} kb/s`);
  }
  const VideoResolution = get(file, 'MediaInfo.Video.0.Resolution');
  if (VideoResolution) {
    VideoInfo.push(VideoResolution);
  }
  const VideoWidth = get(file, 'MediaInfo.Video.0.Width');
  const VideoHeight = get(file, 'MediaInfo.Video.0.Height');
  if (VideoWidth && VideoHeight) {
    VideoInfo.push(`${VideoWidth}x${VideoHeight}`);
  }

  const AudioInfo: string[] = [];
  const AudioFormat = get(file, 'MediaInfo.Audio.0.Format.Name');
  const AudioLanguages = map(file.MediaInfo.Audio, item => item.LanguageCode);
  if (AudioFormat) {
    AudioInfo.push(AudioFormat);
  }
  if (AudioLanguages && AudioLanguages.length > 0) {
    AudioInfo.push(`${AudioLanguages.length > 1 ? 'Multi Audio' : 'Audio'} (${AudioLanguages.join(',')})`);
  }
  const SubtitleLanguages = map(file.MediaInfo.Subtitles, item => item.LanguageCode);
  if (SubtitleLanguages && SubtitleLanguages.length > 0) {
    AudioInfo.push(`${SubtitleLanguages.length > 1 ? 'Multi Subs' : 'Subs'} (${SubtitleLanguages.join(',')})`);
  }

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