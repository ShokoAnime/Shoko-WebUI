import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import TreeView from '@/components/TreeView/TreeView';
import { setSelectedNode, setStatus } from '@/core/slices/modals/browseFolder';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';

type Props = {
  onSelect: (value: string) => void;
};

const BrowseFolderModal = ({ onSelect }: Props) => {
  const dispatch = useDispatch();

  const status = useSelector((state: RootState) => state.modals.browseFolder.status);
  const selectedNode = useSelector((state: RootState) => state.modals.browseFolder.selectedNode);

  const handleClose = useEventCallback(() => dispatch(setStatus(false)));

  const handleSelect = useEventCallback(() => {
    if (typeof onSelect === 'function') {
      onSelect(selectedNode.path);
    }
    dispatch(setStatus(false));
    dispatch(setSelectedNode({ id: -1, path: '' }));
  });

  return (
    <ModalPanel
      show={status}
      onRequestClose={() => handleClose()}
      header="Select Import Folder"
      size="sm"
      overlayClassName="!z-[90]"
    >
      <div className="rounded-sm border border-panel-border bg-panel-input p-4">
        <TreeView />
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button onClick={handleSelect} buttonType="primary" className="px-6 py-2">Select</Button>
      </div>
    </ModalPanel>
  );
};

export default BrowseFolderModal;
