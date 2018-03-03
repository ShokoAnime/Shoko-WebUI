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
import TreeView from '../TreeView/TreeView';

type Props = {
  show: boolean,
  onSelect: (string) => void,
  status: (boolean) => void,
}

type State = {
  folder: string,
}

class BrowseFolderModal extends React.Component<Props, State> {
  static propTypes = {
    show: PropTypes.bool,
    onSelect: PropTypes.func,
    status: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { folder: '' };
  }

  handleClose = () => {
    this.props.status(false);
  };

  handleSelectionChange = (folder) => {
    this.setState({ folder });
  };

  handleSelect = () => {
    const { onSelect } = this.props;
    this.props.status(false);

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
                  <Button onClick={this.handleClose}>Cancel</Button>
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

function mapDispatchToProps(dispatch) {
  return {
    status: value => dispatch(setStatus(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowseFolderModal);
