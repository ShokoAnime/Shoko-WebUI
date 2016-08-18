import React, { PropTypes } from 'react';
import {
  Modal,
  Panel,
  Button,
  ButtonToolbar,
} from 'react-bootstrap';
import s from './ImportModal.css';
import { setModalsStatus } from '../../core/actions';
import store from '../../core/store';
import TreeView from '../TreeView/TreeView';

class BrowseFolderModal extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    store.dispatch(setModalsStatus({ browseFolders: false }));
  }

  render() {
    const { show } = this.props;
    return (
      <Modal show={show} className={s.modal}>
        <Panel header="Manage import folders">
          <TreeView />
          <ButtonToolbar className="pull-right">
            <Button bsStyle="primary">Select</Button>
            <Button onClick={this.handleClose}>Cancel</Button>
          </ButtonToolbar>
        </Panel>
      </Modal>
    );
  }
}

export default BrowseFolderModal;
