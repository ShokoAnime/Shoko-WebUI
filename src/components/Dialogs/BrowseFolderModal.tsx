import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../core/store';
import type { SelectedNodeType } from '../TreeView/TreeNode';
import Button from '../Buttons/Button';
import { setStatus } from '../../core/actions/modals/BrowseFolder';
import TreeView from '../TreeView/TreeView';
import FixedPanel from '../Panels/FixedPanel';

class BrowseFolderModal extends React.Component<Props> {
  handleClose = () => {
    const { status } = this.props;
    status(false);
  };

  handleSelect = () => {
    const { onSelect, status, selectedNode } = this.props;
    status(false);

    if (typeof onSelect === 'function') {
      onSelect(selectedNode.path);
    }
  };

  render() {
    const { show } = this.props;
    return (
      <div className="flex pointer-events-none fixed w-full inset-0 z-50">
        {show && (
          <div className="flex justify-center items-center h-full w-full bg-black bg-opacity-75">
            <div className="flex pointer-events-auto w-1/3">
              <FixedPanel title="Select import folder" className="flex-grow">
                <div className="flex h-auto overflow-y-auto">
                  <TreeView />
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={this.handleClose} className="bg-color-accent px-5 py-2 mr-2">Cancel</Button>
                  <Button onClick={this.handleSelect} className="bg-color-accent px-5 py-2">Select</Button>
                </div>
              </FixedPanel>
            </div>
          </div>
        )}
      </div>
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
