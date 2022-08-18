import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { countBy, forEach } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiMagnify, mdiRestart,
  mdiPlusCircleOutline, mdiCloseCircleOutline,
} from '@mdi/js';

import Button from '../../../components/Input/Button';
import TransitionDiv from '../../../components/TransitionDiv';

import {
  useGetFileIgnoredQuery,
  usePutFileIgnoreMutation,
} from '../../../core/rtkQuery/fileApi';
import FileListPanel from './Components/FileListPanel';
import Input from '../../../components/Input/Input';

import type { ListResultType } from '../../../core/types/api';
import type { FileType } from '../../../core/types/api/file';

type Props = {
  show: boolean;
};

function IgnoredFilesTab({ show }: Props) {
  const filesQuery = useGetFileIgnoredQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? {} as ListResultType<FileType[]>;

  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();

  const [markedItems, setMarkedItems] = useState({} as { [key: number]: boolean });
  const [markedItemsCount, setMarkedItemsCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(1);

  useEffect(() => {
    const newMarkedItems = {} as { [key: number]: boolean };
    forEach(files.List, (file) => {
      newMarkedItems[file.ID] = false;
    });
    setMarkedItems(newMarkedItems);
    setMarkedItemsCount(0);
  }, [filesQuery.isFetching]);

  const changeSelectedFile = (operation: string) => {
    if (operation === 'prev') {
      if (selectedFile > 1) {
        setSelectedFile(selectedFile - 1);
      }
    } else {
      if (selectedFile < markedItemsCount) {
        setSelectedFile(selectedFile + 1);
      }
    }
  };

  const changeMarkedItems = (items: { [key: number]: boolean }) => {
    setMarkedItems(items);
    setMarkedItemsCount(countBy(items).true ?? 0);
    if (selectedFile >= markedItemsCount) changeSelectedFile('prev');
  };

  const restoreFiles = () => {
    forEach(markedItems, (marked, fileId) => {
      if (marked) {
        fileIgnoreTrigger({ fileId: parseInt(fileId), value: false }).catch(() => {});
      }
    });
  };

  const cancelSelection = () => {
    const tempMarkedItems = markedItems;
    forEach(tempMarkedItems, (_, key) => {
      tempMarkedItems[key] = false;
    });
    changeMarkedItems(tempMarkedItems);
  };

  const renderOperations = (common = false) => {
    const renderButton = (onClick: (...args: any) => void, icon: string, name: string, highlight = false) => (
      <Button onClick={onClick} className="flex items-center mr-4 font-normal text-font-main">
        <Icon path={icon} size={1} className={cx(['mr-1', highlight && 'text-highlight-1'])} />
        {name}
      </Button>
    );

    return (
      <>
        {renderButton(() => filesQuery.refetch(), mdiRestart, 'Refresh')}
        <TransitionDiv className="flex grow" show={!common}>
          {renderButton(() => restoreFiles(), mdiPlusCircleOutline, 'Restore', true)}
          {renderButton(() => cancelSelection(), mdiCloseCircleOutline, 'Cancel Selection', true)}
        </TransitionDiv>
      </>
    );
  };

  return (
    <TransitionDiv className="flex flex-col grow absolute h-full" show={show}>

      <div className="flex">
        <Input type="text" placeholder="Search..." className="bg-background-nav mr-2" startIcon={mdiMagnify} id="search" value="" onChange={() => {}} />
        <div className="box-border flex grow bg-background-nav border border-background-border items-center rounded-md px-3 py-2">
          {renderOperations(markedItemsCount === 0)}
          <div className="ml-auto text-highlight-2 font-semibold">{markedItemsCount} Files Selected</div>
        </div>
      </div>
      <FileListPanel markedItems={markedItems} setMarkedItems={changeMarkedItems} files={files} emptyMessage="No ignored file(s)!" />

    </TransitionDiv>
  );
}

export default IgnoredFilesTab;
