// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bulma-components';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { setStatus } from '../../core/actions/modals/ImportFolder';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFoldersItem from './ImportFoldersItem';
import ImportModal from '../../components/Dialogs/ImportFolder/ImportModal';
import type { FolderItemType } from '../../components/Dialogs/ImportFolder/FolderItem';

type Props = {
  className: string,
  importModal: {},
  items: Array<FolderItemType>,
  description: string,
  importFolders: Array<FolderItemType>,
  updateStatus: (boolean) => void,
}

class ImportFolders extends React.Component<Props> {
  static propTypes = {
    className: PropTypes.string,
    importModal: PropTypes.object,
    items: PropTypes.object,
    description: PropTypes.string,
    importFolders: PropTypes.object,
    updateStatus: PropTypes.func.isRequired,
  };

  handleAction = () => {
    const { updateStatus } = this.props;
    updateStatus(true);
  };

  render() {
    const {
      items, importModal, importFolders,
    } = this.props;
    const folders = [];
    let i = 0;
    forEach(items, (item) => {
      i += 1;
      folders.push(<ImportFoldersItem key={i} index={i} {...item} />);
    });

    return [
      <FixedPanel
        title="Import Folders Overview"
        actionName="Manage"
        onAction={this.handleAction}
      >
        <Table>
          <tbody>
            {folders}
          </tbody>
        </Table>
      </FixedPanel>,
      <ImportModal {...importModal} importFolders={importFolders} />,
    ];
  }
}

function mapStateToProps(state) {
  const { importFolders, modals } = state;

  return {
    items: importFolders,
    importModal: modals.importFolder,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateStatus: value => dispatch(setStatus(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportFolders);
