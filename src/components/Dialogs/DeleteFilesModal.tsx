import React, { useEffect, useMemo } from 'react';
import { mdiMinusCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';

import type { FileType } from '@/core/types/api/file';

type Props = {
  selectedFiles: FileType[];
  show: boolean;
  removeFile(fileId: number): void;
  onConfirm(): void;
  onClose(): void;
};

function DeleteFilesModal(props: Props) {
  const { onClose, onConfirm, removeFile, selectedFiles, show: showModal } = props;

  const handleConfirm = useEventCallback(() => {
    onClose();
    onConfirm();
  });

  const fileList = useMemo(
    () =>
      selectedFiles.map(file => (
        <div
          key={`file-${file.ID}`}
          className="mt-2 flex gap-x-3 first:mt-0"
          onClick={() => removeFile(file.ID)}
        >
          <div className="grow">
            {file.Locations[0]?.RelativePath?.split(/[/\\]+/g).slice(-2).join('/')
              ?? `<missing file path for ${file.ID}>`}
          </div>
          <div className="cursor-pointer text-panel-danger">
            <Icon path={mdiMinusCircleOutline} size={1} />
          </div>
        </div>
      )),
    [selectedFiles, removeFile],
  );

  useEffect(() => {
    if (showModal && selectedFiles.length === 0) {
      onClose();
    }
  }, [showModal, selectedFiles, onClose]);

  return (
    <ModalPanel
      show={showModal}
      onRequestClose={onClose}
      className="w-[56.875rem] flex-col gap-y-8 p-8 drop-shadow-lg"
    >
      <div className="flex flex-row justify-between gap-x-0.5 text-xl font-semibold">
        <div>Delete Confirmation</div>
        <div className="flex gap-x-1">
          <div className="text-panel-important">{fileList.length}</div>
          &nbsp;Files
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <p>
          Please confirm you would like to delete the following files. This is a destructive process and cannot be
          undone.
        </p>
        <p>
          If you’ve added a file by mistake, click the icon to the right of the filename to remove it.
        </p>
      </div>
      <div className="flex flex-row">
        <div className="mt-2 w-full rounded-md border border-panel-border bg-panel-background-alt p-4">
          <div className="flex h-64 flex-col overflow-y-auto bg-panel-background-alt">
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
