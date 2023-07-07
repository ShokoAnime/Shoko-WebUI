import { get, map, toNumber } from 'lodash';
import React from 'react';
import prettyBytes from 'pretty-bytes';

const EpisodeFileInfo = ({ file }) => {
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
    <div className="flex flex-col gap-y-8">

      <div className="flex flex-col gap-y-4">
        <div className="opacity-65 font-semibold text-xl">File Details</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">File Name</div>
            {/* TODO: Only show filename */}
            {get(file, 'Locations.0.RelativePath', '<missing file path>')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">Location</div>
            {/* TODO: Show path not relative path */}
            {get(file, 'Locations.0.RelativePath', '<missing file path>')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">Size</div>
            {prettyBytes(toNumber(get(file, 'Size', '0')), { binary: true })}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">Group</div>
            {get(file, 'AniDB.ReleaseGroup.Name', '')} | v{get(file, 'AniDB.Version', '')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">Video</div>
            {VideoInfo.join(' | ')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">Audio</div>
            {AudioInfo.join(' | ')}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="opacity-65 font-semibold text-xl">File Hashes</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">Hash</div>
            {get(file, 'Hashes.ED2K', '')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">CRC</div>
            {get(file, 'Hashes.CRC32', '')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">SHA1</div>
            {get(file, 'Hashes.SHA1', '')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">MD5</div>
            {get(file, 'Hashes.MD5', '')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeFileInfo;
