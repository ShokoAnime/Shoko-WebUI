import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  Panel,
  Button,
  ButtonToolbar,
} from 'react-bootstrap';
import StatusPanel from '../../Panels/StatusPanel';
import { setStatus as setImportStatus,
  addFolderAsync } from '../../../core/actions/modals/ImportFolder';
import store from '../../../core/store';
import { importFoldersAsync } from '../../../core/actions';
import FolderForm from './Form';

class AddTab extends React.Component {
  static propTypes = {
    addFolder: PropTypes.object,
    form: PropTypes.object,
  };

  static handleClose() {
    store.dispatch(setImportStatus(false));
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    addFolderAsync(this.props.form)
      .then(() => importFoldersAsync(true))
      .then(() => {
        const { addFolder } = this.props;
        const { code } = addFolder.items;
        if (code === 200) {
          AddTab.handleClose();
        }
      }
    );
  }

  render() {
    const { addFolder } = this.props;
    const { isFetching } = addFolder;
    return (
      <Panel>
        <StatusPanel {...addFolder} />
        <FolderForm />
        <ButtonToolbar className="pull-right">
          <Button onClick={this.handleSubmit} bsStyle="primary">
            {isFetching ? [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : 'Add'}
          </Button>
          <Button onClick={AddTab.handleClose}>Cancel</Button>
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

export default connect(mapStateToProps)(AddTab);
