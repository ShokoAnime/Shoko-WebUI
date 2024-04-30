import { useMemo } from 'react';
import { get, map, toNumber } from 'lodash';

import type { FileType } from '@/core/types/api/file';
import type { FileInfo } from '@/core/types/models/file';

export const useVideoInfo = <T extends FileType>(file?: T) => {
  const videoInfo: string[] = useMemo(() => {
    if (!file) return [];

    const info: string[] = [];
    const VideoSource = get(file, 'AniDB.Source');
    if (VideoSource) {
      info.push(VideoSource);
    }

    const VideoBitDepth = file?.MediaInfo?.Video?.[0]?.BitDepth;
    if (VideoBitDepth) {
      info.push(`${VideoBitDepth}-bit`);
    }

    const VideoBitRate = file?.MediaInfo?.Video?.[0]?.BitRate;
    if (VideoBitRate) {
      info.push(`${Math.round(toNumber(VideoBitRate) / 1024)} kb/s`);
    }

    const VideoResolution = file?.MediaInfo?.Video?.[0]?.Resolution;
    if (VideoResolution) {
      info.push(VideoResolution);
    }

    const VideoWidth = file?.MediaInfo?.Video?.[0]?.Width;
    const VideoHeight = file?.MediaInfo?.Video?.[0]?.Height;
    if (VideoWidth && VideoHeight) {
      info.push(`${VideoWidth}x${VideoHeight}`);
    }

    return info;
  }, [file]);
  return videoInfo;
};

export const useAudioInfo = <T extends FileType>(file?: T) => {
  const audioInfo: string[] = useMemo(() => {
    if (!file) return [];

    const info: string[] = [];
    const AudioFormat = file?.MediaInfo?.Audio?.[0]?.Format.Name;
    const AudioLanguages = map(file?.MediaInfo?.Audio, item => item.LanguageCode).filter(item => !!item);

    if (AudioFormat) {
      info.push(AudioFormat);
    }

    if (AudioLanguages && AudioLanguages.length > 0) {
      info.push(`${AudioLanguages.length > 1 ? 'Multi Audio' : 'Audio'} (${AudioLanguages.join(',')})`);
    }

    const SubtitleLanguages = map(file?.MediaInfo?.Subtitles, item => item.LanguageCode).filter(item => !!item);
    if (SubtitleLanguages && SubtitleLanguages.length > 0) {
      info.push(`${SubtitleLanguages.length > 1 ? 'Multi Subs' : 'Subs'} (${SubtitleLanguages.join(',')})`);
    }

    return info;
  }, [file]);
  return audioInfo;
};

const useMediaInfo = <T extends FileType>(file?: T): FileInfo => {
  const videoInfo = useVideoInfo(file);
  const audioInfo = useAudioInfo(file);
  const { fileName, folderPath } = useMemo(() => {
    const absolutePath = file?.Locations?.[0]?.AbsolutePath ?? '??';
    return {
      fileName: absolutePath.split(/[/\\]+/).pop(),
      folderPath: absolutePath.slice(0, absolutePath.replaceAll('\\', '/').lastIndexOf('/') + 1),
    };
  }, [file]);

  return {
    Name: fileName ?? '',
    Location: folderPath ?? '',
    Size: file?.Size ?? 0,
    Group: `${file?.AniDB?.ReleaseGroup?.Name ?? 'Unknown'}${
      file?.AniDB?.Version ? (` | v${file?.AniDB?.Version}`) : ''
    }`,
    Hashes: {
      ED2K: file?.Hashes?.ED2K ?? '',
      SHA1: file?.Hashes?.SHA1 ?? '',
      CRC32: file?.Hashes?.CRC32 ?? '',
      MD5: file?.Hashes?.MD5 ?? '',
    },
    VideoInfo: videoInfo,
    AudioInfo: audioInfo,
    Chapters: file?.AniDB?.Chaptered ?? false,
  };
};

export default useMediaInfo;
