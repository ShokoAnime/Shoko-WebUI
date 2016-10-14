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
import { setFormData, editFolderAsync, setStatus } from '../../../core/actions/modals/ImportFolder';
import { importFoldersAsync } from '../../../core/actions';
import store from '../../../core/store';
import StatusPanel from '../../Panels/StatusPanel';

class EditTab extends React.Component {
  static propTypes = {
    items: PropTypes.array,
    form: PropTypes.object,
    editFolder: PropTypes.object,
  };

  static handleClose() {
    store.dispatch(setFormData());
  }

  static handleCloseModal() {
    store.dispatch(setStatus(false));
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const newForm = this.props.editFolder;
    const curForm = newProps.editFolder;
    if (curForm.isFetching === true && newForm.isFetching === false
      && newProps.form.ImportFolderID) {
      importFoldersAsync(true)
        .then(() => store.dispatch(setFormData()));
    }
  }

  handleSubmit() {
    editFolderAsync(this.props.form)
      .then(() => importFoldersAsync(true));
  }

  render() {
    const { items, form, editFolder } = this.props;
    const { isFetching } = editFolder;
    let panel;
    let buttons;

    if (!form.ImportFolderID) {
      const folders = [];
      let i = 0;
      forEach(items, (item) => {
        i += 1;
        folders.push(<FolderItem index={i} {...item} />);
      });

      panel = (
        <table className="table">
          <tbody>{folders}</tbody>
        </table>
      );
      buttons = (
        <ButtonToolbar className="pull-right">
          <Button onClick={EditTab.handleCloseModal}>Cancel</Button>
        </ButtonToolbar>
      );
    } else {
      panel = [<StatusPanel {...editFolder} />, <FolderForm />];
      buttons = (
        <ButtonToolbar className="pull-right">
          <Button onClick={this.handleSubmit} bsStyle="primary">
            {isFetching ? [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : 'Update'}
          </Button>
          <Button onClick={EditTab.handleClose}>Cancel</Button>
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
    items: importFolders.items || [],
    form,
    editFolder,
  };
}

export default connect(mapStateToProps)(EditTab);
