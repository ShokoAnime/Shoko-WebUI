import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  Panel,
  Button,
  ButtonToolbar,
} from 'react-bootstrap';
import StatusPanel from '../../Panels/StatusPanel';
import { setStatus as setImportStatus } from '../../../core/actions/modals/ImportFolder';
import FolderForm from './Form';
import Events from '../../../core/events';

class AddTab extends React.Component {
  static propTypes = {
    addFolder: PropTypes.object,
    handleAddFolder: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    form: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    const { handleAddFolder, form } = this.props;
    handleAddFolder(form);
  }

  render() {
    const { addFolder, handleClose } = this.props;
    const { isFetching } = addFolder;
    return (
      <Panel>
        <StatusPanel {...addFolder} />
        <FolderForm />
        <ButtonToolbar className="pull-right">
          <Button onClick={this.handleSubmit} bsStyle="primary">
            {isFetching ? [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : 'Add'}
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ButtonToolbar>
      </Panel>
    );
  }
}

function mapStateToProps(state) {
  const { modals } = state;
  const { form, addFolder } = modals.importFolder;

  return {
    addFolder,
    form,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleAddFolder: value => dispatch({ type: Events.ADD_FOLDER, payload: value }),
    handleClose: () => dispatch(setImportStatus(false)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddTab);
