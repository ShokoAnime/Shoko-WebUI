import type { DriveType, FolderType } from '@/core/types/api/folder';

let id = 0;

const getNextId = () => {
  id += 1;
  return id;
};

export const transformNode = <T extends DriveType | FolderType>(response: T[]) =>
  response.map((item: T) => ({ ...item, nodeId: getNextId() } as T));
