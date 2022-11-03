import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../core/store';
import Button from '../Input/Button';
import { setStatus } from '../../core/slices/modals/browseFolder';
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
    dispatch(setStatus(false));

    if (typeof props.onSelect === 'function') {
      props.onSelect(selectedNode.Path);
    }
  };

  return (
    <ModalPanel show={status} className="w-25 drop-shadow-[-4px_0_4px_rgba(0,0,0,0.25)]" onRequestClose={() => handleClose()}>
      <div className="flex flex-col w-full space-y-4">
        <div className="px-4 py-2 bg-background-alt self-stretch border-b border-background-border shadow">
          <p className="text-base font-semibold text-gray-300">Select Import Folder</p>
        </div>
        <div className="mx-4 px-3 py-2 bg-background-alt rounded border border-background-border text-sm">
          <TreeView />
        </div>
        <div className="flex justify-end mx-4">
          <Button onClick={handleClose} className="bg-background-alt px-6 py-2 mr-2">Cancel</Button>
          <Button onClick={handleSelect} className="bg-highlight-1 px-6 py-2">Select</Button>
        </div>
      </div>
    </ModalPanel>
  );
}

export default BrowseFolderModal;
