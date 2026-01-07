import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiMinusCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

import type { FileType } from '@/core/types/api/file';

type Props = {
  selectedFiles: FileType[];
  show: boolean;
  removeFile(this: void, fileId: number): void;
  onConfirm(this: void): void;
  onClose(this: void): void;
};

const Title = ({ fileCount }: { fileCount: number }) => {
  const { t } = useTranslation('dialogs');
  return (
    <div className="flex flex-row justify-between gap-x-0.5 text-xl font-semibold">
      <div>{t('dialogs.deleteFilesModal.deleteConfirmation')}</div>
      <div>
        <span className="text-panel-text-important">{fileCount}</span>
        &nbsp;
        {t('dialogs.deleteFilesModal.filesCount', { count: fileCount })}
      </div>
    </div>
  );
};

function DeleteFilesModal(props: Props) {
  const { t } = useTranslation('dialogs');
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
              ?? t('dialogs.deleteFilesModal.missingPath', { id: file.ID })}
          </div>
          <div className="cursor-pointer text-panel-text-danger">
            <Icon path={mdiMinusCircleOutline} size={1} />
          </div>
        </div>
      )),
    [selectedFiles, removeFile, t],
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
      size="md"
      header={<Title fileCount={fileList.length} />}
    >
      <div className="flex flex-col gap-y-4">
        <p>{t('dialogs.deleteFilesModal.confirm1')}</p>
        <p>{t('dialogs.deleteFilesModal.confirm2')}</p>
      </div>
      <div className="flex flex-row">
        <div className="mt-2 w-full rounded-lg border border-panel-border bg-panel-background-alt p-4">
          <div className="flex h-64 flex-col overflow-y-auto bg-panel-background-alt">
            {fileList}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">{t('dialogs.common.cancel')}</Button>
        <Button onClick={handleConfirm} buttonType="danger" className="px-6 py-2">
          {t('dialogs.deleteFilesModal.deleteButton')}
        </Button>
      </div>
    </ModalPanel>
  );
}

export default DeleteFilesModal;
