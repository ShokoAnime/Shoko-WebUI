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
    <ModalPanel show={status} className="p-5 browse-folder-modal" onRequestClose={() => handleClose()}>
      <div className="flex flex-col w-full">
        <span className="flex font-semibold text-xl2 uppercase">Select Import Folder</span>
        <div className="bg-color-highlight-2 my-2 h-1 w-10 flex-shrink-0" />
        <TreeView />
        <div className="flex justify-end mt-2">
          <Button onClick={handleClose} className="bg-highlight-1 px-5 py-2 mr-2">Cancel</Button>
          <Button onClick={handleSelect} className="bg-highlight-1 px-5 py-2">Select</Button>
        </div>
      </div>
    </ModalPanel>
  );
}

export default BrowseFolderModal;
