import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import TreeView from '@/components/TreeView/TreeView';
import { setSelectedNode, setStatus } from '@/core/slices/modals/browseFolder';

import type { RootState } from '@/core/store';

type Props = {
  onSelect: (value: string) => void;
};

function BrowseFolderModal(props: Props) {
  const dispatch = useDispatch();

  const status = useSelector((state: RootState) => state.modals.browseFolder.status);
  const selectedNode = useSelector((state: RootState) => state.modals.browseFolder.selectedNode);

  const handleClose = () => dispatch(setStatus(false));

  const handleSelect = () => {
    if (typeof props.onSelect === 'function') {
      props.onSelect(selectedNode.Path);
    }
    dispatch(setStatus(false));
    dispatch(setSelectedNode({ id: -1, Path: '' }));
  };

  return (
    <ModalPanel
      show={status}
      onRequestClose={() => handleClose()}
      title="Select Import Folder"
    >
      <div className="rounded border border-panel-border bg-panel-background-alt p-4">
        <TreeView />
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button onClick={handleSelect} buttonType="primary" className="px-6 py-2">Select</Button>
      </div>
    </ModalPanel>
  );
}

export default BrowseFolderModal;
