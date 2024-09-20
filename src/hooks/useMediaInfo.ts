import { useMemo } from 'react';
import { map, toNumber } from 'lodash';

import type { FileType } from '@/core/types/api/file';
import type { FileInfo } from '@/core/types/models/file';

const getVideoInfo = (file: FileType) => {
  const videoInfo = file.MediaInfo?.Video?.[0];
  if (!videoInfo) return [];

  const info = [
    videoInfo.Codec.Simplified.toUpperCase(),
    videoInfo.Resolution,
  ];

  const VideoBitDepth = file.MediaInfo?.Video?.[0]?.BitDepth;
  if (VideoBitDepth) {
    info.push(`${VideoBitDepth}-bit`);
  }

  if (videoInfo.BitRate) {
    info.push(`${Math.round(toNumber(videoInfo.BitRate) / 1024)} kb/s`);
  }

  if (videoInfo.Width && videoInfo.Height) {
    info.push(`${videoInfo.Width}x${videoInfo.Height}`);
  }

  return info;
};

const getAudioInfo = (file: FileType) => {
  const info: string[] = [];

  if (file.MediaInfo?.Audio?.[0]?.Format?.Name) {
    info.push(file.MediaInfo.Audio[0].Format.Name);
  }

  const audioLanguages = map(file.MediaInfo?.Audio, item => item.LanguageCode).filter(item => !!item);
  if (audioLanguages && audioLanguages.length > 0) {
    info.push(`${audioLanguages.length > 1 ? 'Multi Audio' : 'Audio'} (${audioLanguages.join(', ')})`);
  }

  const subtitleLanguages = map(file.MediaInfo?.Subtitles, item => item.LanguageCode).filter(item => !!item);
  if (subtitleLanguages && subtitleLanguages.length > 0) {
    info.push(`${subtitleLanguages.length > 1 ? 'Multi Subs' : 'Subs'} (${subtitleLanguages.join(', ')})`);
  }

  return info;
};

const useMediaInfo = (file: FileType): FileInfo =>
  useMemo(() => {
    const videoInfo = getVideoInfo(file);
    const audioInfo = getAudioInfo(file);

    const absolutePath = file.Locations?.[0]?.AbsolutePath ?? '??';
    const fileName = absolutePath.split(/[/\\]+/).pop();
    const folderPath = absolutePath.slice(0, absolutePath.replaceAll('\\', '/').lastIndexOf('/') + 1);

    const groupInfo = [file.AniDB?.ReleaseGroup?.Name ?? 'Unknown'];
    if (file.AniDB?.Source) groupInfo.push(file.AniDB.Source);
    if (file.AniDB?.Version) groupInfo.push(`v${file.AniDB.Version}`);

    return {
      Name: fileName ?? '',
      Location: folderPath ?? '',
      Size: file.Size ?? 0,
      Group: groupInfo.join(' | '),
      Hashes: {
        ED2K: file.Hashes?.ED2K ?? '',
        SHA1: file.Hashes?.SHA1 ?? '',
        CRC32: file.Hashes?.CRC32 ?? '',
        MD5: file.Hashes?.MD5 ?? '',
      },
      VideoInfo: videoInfo,
      AudioInfo: audioInfo,
      Chapters: file.AniDB?.Chaptered ?? false,
    };
  }, [file]);

export default useMediaInfo;
