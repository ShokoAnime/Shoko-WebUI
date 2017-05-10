// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFoldersItem from './ImportFoldersItem';
import ImportModal from '../../components/Dialogs/ImportFolder/ImportModal';

import { setStatus } from '../../core/actions/modals/ImportFolder';
import store from '../../core/store';

class ImportFolders extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    importModal: PropTypes.object,
    items: PropTypes.object,
    description: PropTypes.string,
    importFolders: PropTypes.object,
  };

  static handleAction() {
    store.dispatch(setStatus(true));
  }

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
          onAction={ImportFolders.handleAction}
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

export default connect(mapStateToProps)(ImportFolders);
