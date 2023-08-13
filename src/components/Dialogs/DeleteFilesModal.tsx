import React, { useEffect, useMemo } from 'react';
import { useEventCallback } from 'usehooks-ts';
import Icon from '@mdi/react';
import { mdiMinusCircleOutline } from '@mdi/js';

import { FileType } from '@/core/types/api/file';

import Button from '../Input/Button';
import ModalPanel from '../Panels/ModalPanel';

interface Props {
  selectedFiles: FileType[];
  show: boolean;
  removeFile(fileId: number): void;
  onConfirm(): void;
  onClose(): void;
}

function DeleteFilesModal(props: Props) {
  const { onClose, onConfirm, selectedFiles, show: showModal, removeFile } = props;

  const handleConfirm = useEventCallback(() => {
    onClose();
    onConfirm();
  });

  const fileList = useMemo(() => selectedFiles.map(file => (
    <div key={`file-${file.ID}`} className="first:mt-0 mt-2 flex gap-x-3" onClick={() => removeFile(file.ID)}>
      <div className="flex-grow">
        {file.Locations[0]?.RelativePath?.split(/[/\\]+/g).slice(-2).join('/') ?? `<missing file path for ${file.ID}>`}
      </div>
      <div className="cursor-pointer text-panel-danger">
        <Icon path={mdiMinusCircleOutline} size={1} />
      </div>
    </div>
  )), [selectedFiles, removeFile]);

  useEffect(() => {
    if (showModal && selectedFiles.length === 0) {
      onClose();
    }
  }, [showModal, selectedFiles, onClose]);

  return (
    <ModalPanel
      show={showModal}
      onRequestClose={onClose}
      className="p-8 flex-col drop-shadow-lg gap-y-8 w-[56.875rem]"
    >
      <div className="flex text-xl flex-row justify-between font-semibold gap-x-0.5">
        <div>Delete Confirmation</div>
        <div className="flex gap-x-1"><div className="text-panel-important">{fileList.length}</div> Files</div>
      </div>
      <div className="flex flex-col gap-y-4">
        <p>
          Please confirm you would like to delete the following files. This is a destructive process and cannot be undone.
        </p>
        <p>
          If you’ve added a file by mistake, click the icon to the right of the filename to remove it.
        </p>
      </div>
      <div className="flex flex-row">
        <div className="bg-panel-background-alt border border-panel-border mt-2 p-4 w-full rounded-md">
          <div className="flex flex-col bg-panel-background-alt overflow-y-auto h-64">
            {fileList}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button onClick={handleConfirm} buttonType="danger" className="px-6 py-2">Delete Files</Button>
      </div>
    </ModalPanel>
  );
}

export default DeleteFilesModal;
