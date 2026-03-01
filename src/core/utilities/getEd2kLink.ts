import type { FileType } from '@/core/types/api/file';

const getEd2kLink = (file: FileType) =>
  `ed2k://|file|${file.Locations[0]?.RelativePath?.split(/[\\/]+/g).pop() ?? ''}|${file.Size}|${
    file.Hashes.find(hash => hash.Type === 'ED2K')!.Value
  }|/`;

export default getEd2kLink;
