// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import StatusPanel from '../../Panels/StatusPanel';
import { setStatus as setImportStatus } from '../../../core/actions/modals/ImportFolder';
import FolderForm from './Form';
import Events from '../../../core/events';
import type { FormType } from './Form';

type Props = {
  addFolder: {
    isFetching: boolean,
    lastUpdated: number,
  },
  handleAddFolder: (FormType) => void,
  handleClose: () => void,
  form: FormType
}

class AddTab extends React.Component<Props> {
  static propTypes = {
    addFolder: PropTypes.object,
    handleAddFolder: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    form: PropTypes.object,
  };

  handleSubmit = () => {
    const { handleAddFolder, form } = this.props;
    handleAddFolder(form);
  };

  render() {
    const { addFolder, handleClose } = this.props;
    const { isFetching } = addFolder;
    return (
      <React.Fragment>
        <StatusPanel {...addFolder} />
        <FolderForm />
        <Button loading={isFetching} onClick={this.handleSubmit}>
          Add
        </Button>
        <Button onClick={handleClose}>
          Cancel
        </Button>
      </React.Fragment>
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
