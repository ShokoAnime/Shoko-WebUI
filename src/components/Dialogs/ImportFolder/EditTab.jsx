import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import {
  Panel,
  Button,
  ButtonToolbar,
} from 'react-bootstrap';
import FolderItem from './FolderItem';
import FolderForm from './Form';
import { setFormData, setStatus } from '../../../core/actions/modals/ImportFolder';
import StatusPanel from '../../Panels/StatusPanel';
import Events from '../../../core/events';

class EditTab extends React.Component {
  static propTypes = {
    items: PropTypes.object,
    form: PropTypes.object,
    editFolder: PropTypes.object,
    handleEditFolder: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    const { handleEditFolder, form } = this.props;
    handleEditFolder(form);
  }

  render() {
    const { items, form, editFolder, handleClose, handleCancel } = this.props;
    const { isFetching } = editFolder;
    let panel;
    let buttons;

    if (!form.ImportFolderID) {
      const folders = [];
      let i = 0;
      forEach(items, (item) => {
        i += 1;
        folders.push(<FolderItem key={i} index={i} {...item} />);
      });

      panel = (
        <table className="table">
          <tbody>{folders}</tbody>
        </table>
      );
      buttons = (
        <ButtonToolbar className="pull-right">
          <Button onClick={handleClose}>Cancel</Button>
        </ButtonToolbar>
      );
    } else {
      panel = [<StatusPanel {...editFolder} />, <FolderForm />];
      buttons = (
        <ButtonToolbar className="pull-right">
          <Button onClick={this.handleSubmit} bsStyle="primary">
            {isFetching ? [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : 'Update'}
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </ButtonToolbar>
      );
    }

    return (
      <Panel>
        {panel}
        {buttons}
      </Panel>
    );
  }
}

function mapStateToProps(state) {
  const { importFolders, modals } = state;
  const { form, editFolder } = modals.importFolder;

  return {
    items: importFolders || [],
    form,
    editFolder,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleEditFolder: value => dispatch({ type: Events.EDIT_FOLDER, payload: value }),
    handleClose: () => dispatch(setStatus(false)),
    handleCancel: () => dispatch(setFormData()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTab);
