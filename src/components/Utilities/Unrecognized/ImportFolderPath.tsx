import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';

type ImportFolderNameProps = {
  file: {
    Locations: {
      ImportFolderID: number;
      RelativePath: string;
    }[];
  };
};

export const ImportFolderPath = ({ file }: ImportFolderNameProps) => {
  const { data: importFolders = [] } = useImportFoldersQuery();
  const folderName = importFolders.find(({ ID }) => ID === file.Locations[0]?.ImportFolderID)?.Name ?? 'Unknown';
  const match = file.Locations[0]?.RelativePath.match(/^(.*)([/\\])[^/\\]*$/);
  return match ? `${folderName}${match[2]}${match[1]}` : folderName;
};
