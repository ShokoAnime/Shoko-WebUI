import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../core/store';
import type { SelectedNodeType } from '../TreeView/TreeNode';
import Button from '../Input/Button';
import { setStatus } from '../../core/slices/modals/browseFolder';
import TreeView from '../TreeView/TreeView';
import ModalPanel from '../Panels/ModalPanel';

class BrowseFolderModal extends React.Component<Props> {
  handleClose = () => {
    const { status } = this.props;
    status(false);
  };

  handleSelect = () => {
    const { onSelect, status, selectedNode } = this.props;
    status(false);

    if (typeof onSelect === 'function') {
      onSelect(selectedNode.Path);
    }
  };

  render() {
    const { show } = this.props;
    return (
      <ModalPanel show={show} className="p-5 browse-folder-modal" onRequestClose={() => this.handleClose()}>
        <div className="flex flex-col w-full">
          <span className="flex font-semibold text-xl2 uppercase">Select Import Folder</span>
          <div className="bg-color-highlight-2 my-2 h-1 w-10 flex-shrink-0" />
          <TreeView />
          <div className="flex justify-end mt-2">
            <Button onClick={this.handleClose} className="bg-color-highlight-1 px-5 py-2 mr-2">Cancel</Button>
            <Button onClick={this.handleSelect} className="bg-color-highlight-1 px-5 py-2">Select</Button>
          </div>
        </div>
      </ModalPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  show: state.modals.browseFolder.status,
  selectedNode: state.modals.browseFolder.selectedNode as SelectedNodeType,
});

const mapDispatch = {
  status: (value: boolean) => (setStatus(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  onSelect: (value: string) => void,
};

export default connector(BrowseFolderModal);
