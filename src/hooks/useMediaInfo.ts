import { useMemo } from 'react';
import { toNumber } from 'lodash';

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

  if (file.AudioLanguages.length > 0) {
    info.push(`${file.AudioLanguages.length > 1 ? 'Multi Audio' : 'Audio'} (${file.AudioLanguages.join(', ')})`);
  }

  return info;
};

const useMediaInfo = (file: FileType): FileInfo =>
  useMemo(() => {
    const videoInfo = getVideoInfo(file);
    const audioInfo = getAudioInfo(file);
    const subtitleInfo = file.SubtitleLanguages.join(', ');

    const absolutePath = file.Locations?.[0]?.AbsolutePath ?? '??';
    const fileName = absolutePath.split(/[/\\]+/).pop();
    const folderPath = absolutePath.slice(0, absolutePath.replaceAll('\\', '/').lastIndexOf('/') + 1);

    const groupInfo = [file.Release?.Group?.Name ?? 'Unknown'];
    if (file.Release?.Source) groupInfo.push(file.Release.Source);
    if (file.Release?.Version) groupInfo.push(`v${file.Release.Version}`);

    return {
      Name: fileName ?? '',
      Location: folderPath ?? '',
      Size: file.Size ?? 0,
      Group: groupInfo.join(' | '),
      Hashes: {
        ED2K: file.Hashes?.find(hash => hash.Type === 'ED2K')?.Value ?? '',
        SHA1: file.Hashes?.find(hash => hash.Type === 'SHA1')?.Value ?? '',
        CRC32: file.Hashes?.find(hash => hash.Type === 'CRC32')?.Value ?? '',
        MD5: file.Hashes?.find(hash => hash.Type === 'MD5')?.Value ?? '',
      },
      VideoInfo: videoInfo,
      AudioInfo: audioInfo,
      SubtitleInfo: subtitleInfo,
      Chapters: file.Release?.IsChaptered ?? false,
    };
  }, [file]);

export default useMediaInfo;
