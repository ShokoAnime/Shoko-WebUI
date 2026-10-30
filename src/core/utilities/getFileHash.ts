import type { FileType } from '@/core/types/api/file';

const getFileHash = (
  file: FileType,
  type: string,
) => (Array.isArray(file.Hashes) ? file.Hashes.find(hash => hash.Type === type)?.Value : undefined);

export default getFileHash;
