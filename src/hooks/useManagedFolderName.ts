import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { getManagedFolderName } from '@/core/util';

const useManagedFolderName = (managedFolderID?: number) => {
  const managedFoldersQuery = useManagedFoldersQuery(managedFolderID != null);
  return getManagedFolderName(managedFoldersQuery.data ?? [], managedFolderID);
};

export default useManagedFolderName;
