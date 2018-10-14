// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, Container } from 'react-bulma-components';
import { Button } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { setStatus } from '../../core/actions/modals/BrowseFolder';
import TreeView from '../TreeView/TreeView';
import FixedPanel from '../Panels/FixedPanel';

import type { SelectedNodeType } from '../TreeView/TreeNode';

type Props = {
  show: boolean,
  onSelect: (string) => void,
  status: (boolean) => void,
  selectedNode: SelectedNodeType,
}

class BrowseFolderModal extends React.Component<Props> {
  static propTypes = {
    show: PropTypes.bool,
    onSelect: PropTypes.func,
    status: PropTypes.func.isRequired,
  };

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
      <Modal show={show}>
        <Modal.Content>
          <FixedPanel title="Select import folder">
            <Container>
              <TreeView />
              <Button onClick={this.handleSelect} bsStyle="primary">Select</Button>
              <Button onClick={this.handleClose}>Cancel</Button>
            </Container>
          </FixedPanel>
        </Modal.Content>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const { modals } = state;
  const { browseFolder } = modals;
  const { status, selectedNode } = browseFolder;

  return {
    show: status,
    selectedNode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    status: value => dispatch(setStatus(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowseFolderModal);
