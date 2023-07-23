import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@/core/store';
import { setSelectedNode, setStatus } from '@/core/slices/modals/browseFolder';
import Button from '../Input/Button';
import TreeView from '../TreeView/TreeView';
import ModalPanel from '../Panels/ModalPanel';

type Props = {
  onSelect: (value: string) => void,
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
      className="p-8 flex-col drop-shadow-lg gap-y-8 !top-0"
      onRequestClose={() => handleClose()}
    >
      <div className="font-semibold text-xl">Select Import Folder</div>
      <div className="p-4 bg-panel-background-alt rounded">
        <TreeView />
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} className="bg-button-secondary hover:bg-button-secondary-hover px-6 py-2 text-font-main">Cancel</Button>
        <Button onClick={handleSelect} className="bg-button-primary hover:bg-button-primary-hover px-6 py-2">Select</Button>
      </div>
    </ModalPanel>
  );
}

export default BrowseFolderModal;
