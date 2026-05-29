import React from 'react';
import { mdiDownloadCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import ShokoMarkdown from '@/components/ShokoMarkdown';

type Props = {
  children: string;
  currentVersion?: string;
  handleUpdate: () => void;
  latestVersion?: string;
  onClose: () => void;
  show: boolean;
  type: 'WebUI' | 'Server';
  updatePending: boolean;
  updateSuccess: boolean;
};

const UpdateModal = (props: Props) => {
  const {
    children,
    currentVersion,
    handleUpdate,
    latestVersion,
    onClose,
    show,
    type,
    updatePending,
    updateSuccess,
  } = props;

  return (
    <ModalPanel
      onRequestClose={onClose}
      show={show}
      size="sm"
      header={
        <div className="flex items-center gap-x-2">
          <Icon path={mdiDownloadCircleOutline} size={1} className="text-header-text-important" />
          {`${type} Update Available!`}
        </div>
      }
      footer={
        <div className="flex justify-end gap-x-2">
          <Button buttonType="secondary" buttonSize="normal" onClick={onClose}>
            {type === 'WebUI' ? 'Cancel' : 'Close'}
          </Button>

          {type === 'WebUI' && (
            <Button
              buttonType="primary"
              buttonSize="normal"
              onClick={handleUpdate}
              loading={updatePending}
              disabled={updateSuccess}
              tooltip={updateSuccess ? 'Update is already completed! Please refresh the page.' : ''}
            >
              Update
            </Button>
          )}
        </div>
      }
    >
      <div className="grid w-74 grid-cols-2">
        <div>Current Version:</div>
        <div className="font-bold">{currentVersion ?? 'Unknown'}</div>
        <div>Latest Version:</div>
        <div className="font-bold">{latestVersion ?? 'Unknown'}</div>
      </div>
      <div className="flex flex-col gap-y-6 rounded-lg border border-panel-border bg-panel-input p-4">
        <ShokoMarkdown>
          {children}
        </ShokoMarkdown>
      </div>
    </ModalPanel>
  );
};

export default UpdateModal;
