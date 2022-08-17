import React from 'react';
import { countBy, find, forEach } from 'lodash';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';

import TransitionDiv from '../../../../components/TransitionDiv';
import Checkbox from '../../../../components/Input/Checkbox';

import { useGetImportFoldersQuery } from '../../../../core/rtkQuery/importFolderApi';
import type { ImportFolderType } from '../../../../core/types/api/import-folder';
import type { FileType } from '../../../../core/types/api/file';
import type { ListResultType } from '../../../../core/types/api';

type Props = {
  files: ListResultType<FileType[]>;
  markedItems: { [key: number]: boolean };
  setMarkedItems: (items: { [key: number]: boolean }) => void;
  emptyMessage: string;
};

function FileListPanel(props: Props) {
  const { files, markedItems, setMarkedItems, emptyMessage } = props;

  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const isSelectAllChecked = files.Total > 0 && (countBy(markedItems).true ?? 0) === (files.Total);

  const handleInputChange = (event: any) => {
    const { id, checked } = event.target;
    setMarkedItems({ ...markedItems, [id]: checked });
  };

  const renderRow = (Id: number, importFolder: string, filename: string, size: number, date: string) => (
    <tr className="box-border border-y border-background-border" key={Id}>
      <td className="w-20 py-3.5">
        <div className="flex items-center justify-center">
          <Checkbox id={Id.toString()} isChecked={markedItems[Id] ?? false} onChange={handleInputChange} />
        </div>
      </td>
      <td className="w-52 py-3.5">{importFolder}</td>
      <td className="w-auto py-3.5">{filename}</td>
      <td className="w-32 py-3.5">{prettyBytes(size, { binary: true })}</td>
      <td className="w-56 py-3.5">{moment(date).format('MMMM DD YYYY, HH:mm')}</td>
    </tr>
  );

  const rows: Array<React.ReactNode> = [];
  forEach(files.List, (file) => {
    const importFolderId = file.Locations[0].ImportFolderID;
    const importFolder = find(importFolders, { ID: importFolderId })?.Name ?? '';
    rows.push(renderRow(file.ID, importFolder, file.Locations[0].RelativePath, file.Size, file.Created));
  });

  const handleSelectAll = () => {
    const tempMarkedItems: { [id: number]: boolean } = {};
    forEach(files.List, file => tempMarkedItems[file.ID] = !isSelectAllChecked);
    setMarkedItems(tempMarkedItems);
  };

  return (
    <TransitionDiv className="flex flex-col mt-4 overflow-y-auto grow basis-0 items-start">
      <div className="border border-b-0 border-background-border rounded-t-md">
        <table className="table-fixed text-left w-full">
          <tr className="box-border bg-background-nav">
            <th className="w-20 py-3.5">
              <div className="flex items-center justify-center">
                <Checkbox id='all' isChecked={isSelectAllChecked} onChange={handleSelectAll} />
              </div>
            </th>
            <th className="w-52 py-3.5 font-semibold">Import Folder</th>
            <th className="w-auto py-3.5 font-semibold">Filename</th>
            <th className="w-32 py-3.5 font-semibold">Size</th>
            <th className="w-56 py-3.5 font-semibold">Date</th>
            <th className="w-2.5" />
          </tr>
        </table>
      </div>
      <div className="overflow-y-auto border border-background-border rounded-b-md grow bg-background-nav w-full">
        {files.Total > 0 ? (
          <table className="table-fixed text-left w-full">
            {rows}
          </table>
        ) : (
          <div className="flex items-center justify-center h-full font-semibold">{emptyMessage}</div>
        )}
      </div>
    </TransitionDiv>
  );
}

export default FileListPanel;
