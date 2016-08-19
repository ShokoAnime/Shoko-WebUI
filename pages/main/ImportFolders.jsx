import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFoldersItem from './ImportFoldersItem';
import ImportModal from '../../components/Dialogs/ImportModal';
import BrowseFolderModal from '../../components/Dialogs/BrowseFolderModal';
import { setModalsStatus } from '../../core/actions';
import store from '../../core/store';

class ImportFolders extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    show: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.object,
    description: PropTypes.string,
    showBrowse: PropTypes.bool,
    browseFolder: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.handleAction = this.handleAction.bind(this);
  }

  handleAction() {
    store.dispatch(setModalsStatus({ importFolders: { status: true } }));
  }

  render() {
    const { items, isFetching, lastUpdated, className, description, show, showBrowse,
      browseFolder } = this.props;
    let folders = [];
    let i = 0;
    forEach(items, (item) => {
      i++;
      folders.push(<ImportFoldersItem index={i} {...item} />);
    });

    return (
      <div className={className}>
        <FixedPanel
          title="Import Folders Overview"
          description={description || 'Use Import Folders section to manage'}
          lastUpdated={lastUpdated}
          isFetching={isFetching}
          actionName="Manage"
          onAction={this.handleAction}
        >
          <table className="table">
            <tbody>
            {folders}
            </tbody>
          </table>
        </FixedPanel>
        <ImportModal show={show} folder={browseFolder} />
        <BrowseFolderModal show={showBrowse} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { importFolders, modalsStatus } = state;
  const {
    isFetching,
    lastUpdated,
    items,
  } = importFolders || {
    isFetching: true,
    items: [],
  };

  return {
    items,
    isFetching,
    lastUpdated,
    show: modalsStatus.importFolders.status,
    showBrowse: modalsStatus.browseFolders.status,
    browseFolder: modalsStatus.browseFolders.folder || '',
  };
}

export default connect(mapStateToProps)(ImportFolders);
