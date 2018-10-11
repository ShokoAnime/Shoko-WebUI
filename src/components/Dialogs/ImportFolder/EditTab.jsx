// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { Button } from '@blueprintjs/core';
import FolderItem from './FolderItem';
import FolderForm from './Form';
import { setFormData, setStatus } from '../../../core/actions/modals/ImportFolder';
import StatusPanel from '../../Panels/StatusPanel';
import Events from '../../../core/events';
import type { FolderItemType } from './FolderItem';

type Props = {
  items: Array<FolderItemType>,
  form: FolderItemType,
  editFolder: {
    isFetching: boolean,
    lastUpdated: number,
  },
  handleEditFolder: (FolderItemType) => void,
  handleClose: () => void,
  handleCancel: () => void,
}

class EditTab extends React.Component<Props> {
  static propTypes = {
    items: PropTypes.object,
    form: PropTypes.object,
    editFolder: PropTypes.object,
    handleEditFolder: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  handleSubmit = () => {
    const { handleEditFolder, form } = this.props;
    handleEditFolder(form);
  };

  render() {
    const {
      items, form, editFolder, handleClose, handleCancel,
    } = this.props;
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
        <Button onClick={handleClose}>Cancel</Button>
      );
    } else {
      panel = [<StatusPanel {...editFolder} />, <FolderForm />];
      buttons = (
        <React.Fragment>
          <Button loading={isFetching} onClick={this.handleSubmit}>Update</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {panel}
        {buttons}
      </React.Fragment>
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
