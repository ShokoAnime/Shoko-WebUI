export type FileInfo = {
  Name: string;
  Location: string;
  Size: number;
  Group: string;
  Hashes: {
    ED2K: string;
    SHA1: string;
    CRC32: string;
    MD5: string;
  };
  VideoInfo: string[];
  AudioInfo: string[];
};
