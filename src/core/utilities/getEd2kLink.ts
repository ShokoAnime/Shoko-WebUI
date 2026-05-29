import type { FileType } from '@/core/types/api/file';

const getEd2kLink = (file: FileType) =>
  `ed2k://|file|${file.Locations[0]?.RelativePath?.split(/[\\/]+/g).pop() ?? ''}|${file.Size}|${file.Hashes.ED2K}|/`;

export default getEd2kLink;
