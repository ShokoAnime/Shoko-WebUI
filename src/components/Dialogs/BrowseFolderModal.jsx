// @flow
import PropTypes from 'prop-types';
import React from 'react';
import {
  Modal,
  Panel,
  Button,
  Grid,
  Row,
  Col,
  ButtonToolbar,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import s from './ImportModal.css';
import { setStatus } from '../../core/actions/modals/BrowseFolder';
import store from '../../core/store';
import TreeView from '../TreeView/TreeView';

type Props = {
  show: bool,
  onSelect: (string) => void,
}

type State = {
  folder: string,
}

class BrowseFolderModal extends React.Component<Props, State> {
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
  }

  handleSelectionChange = (folder) => {
    this.setState({ folder });
  };

  handleSelect = () => {
    const { onSelect } = this.props;
    store.dispatch(setStatus(false));

    if (typeof onSelect === 'function') {
      onSelect(this.state.folder);
    }
  };

  render() {
    const { show } = this.props;
    return (
      <Modal show={show} className={s.modal} backdrop={false} >
        <Panel header="Select import folder">
          <Grid fluid>
            <Row>
              <Col>
                <TreeView onSelect={this.handleSelectionChange} />
              </Col>
            </Row>
            <Row>
              <Col>
                <ButtonToolbar className="pull-right">
                  <Button onClick={this.handleSelect} bsStyle="primary">Select</Button>
                  <Button onClick={BrowseFolderModal.handleClose}>Cancel</Button>
                </ButtonToolbar>
              </Col>
            </Row>
          </Grid>
        </Panel>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const { modals } = state;

  return {
    show: modals.browseFolder.status,
  };
}

export default connect(mapStateToProps, () => {})(BrowseFolderModal);
