// @flow
import PropTypes from 'prop-types';
import React from 'react';
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
      items, className, description, importModal, importFolders,
    } = this.props;
    const folders = [];
    let i = 0;
    forEach(items, (item) => {
      i += 1;
      folders.push(<ImportFoldersItem key={i} index={i} {...item} />);
    });

    return (
      <div className={className}>
        <FixedPanel
          title="Import Folders Overview"
          description={description || 'Use Import Folders section to manage'}
          actionName="Manage"
          onAction={this.handleAction}
        >
          <table className="table">
            <tbody>
              {folders}
            </tbody>
          </table>
        </FixedPanel>
        <ImportModal {...importModal} importFolders={importFolders} />
      </div>
    );
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
