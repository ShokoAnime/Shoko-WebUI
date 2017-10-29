import PropTypes from 'prop-types';
import React from 'react';
import {
  Modal,
  Panel,
  Button,
  ButtonToolbar,
} from 'react-bootstrap';
import s from './ImportModal.css';
import { setStatus } from '../../core/actions/modals/BrowseFolder';
import store from '../../core/store';
import TreeView from '../TreeView/TreeView';

class BrowseFolderModal extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    onSelect: PropTypes.func,
  };

  static handleClose() {
    store.dispatch(setStatus(false));
  }

  constructor(props) {
    super(props);
    this.state = { folder: '' };
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelectionChange(folder) {
    this.setState({ folder });
  }

  handleSelect() {
    const { onSelect } = this.props;
    store.dispatch(setStatus(false));

    if (typeof onSelect === 'function') {
      onSelect(this.state.folder);
    }
  }

  render() {
    const { show } = this.props;
    return (
      <Modal show={show} className={s.modal} backdrop={false} >
        <Panel header="Select import folder">
          <TreeView onSelect={this.handleSelectionChange} />
          <ButtonToolbar className="pull-right">
            <Button onClick={this.handleSelect} bsStyle="primary">Select</Button>
            <Button onClick={BrowseFolderModal.handleClose}>Cancel</Button>
          </ButtonToolbar>
        </Panel>
      </Modal>
    );
  }
}

export default BrowseFolderModal;
