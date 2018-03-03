// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { forEach, find } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFolderSeriesItem from './ImportFolderSeriesItem';
import Events from '../../core/events';

type FolderSeries = {
  ImportFolderLocation: string,
  name: string,
  size: number,
  type: string,
}

type ImportFolder = {
  ImportFolderID: number,
  ImportFolderLocation: string,
}

type SelectedFolder = {
  id: number,
  name: string,
}

type Props = {
  className?: string,
  isFetching: boolean,
  items: Array<FolderSeries>,
  importFolders: Array<ImportFolder>,
  selectedFolder: SelectedFolder,
  fetchImportFolderSeries: (SelectedFolder) => void,
}

class ImportFolderSeries extends React.Component<Props> {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    items: PropTypes.array,
    importFolders: PropTypes.object,
    selectedFolder: PropTypes.object,
    fetchImportFolderSeries: PropTypes.func,
  };

  findFolder = (folders: Array<ImportFolder>, id: number): ?ImportFolder => find(folders, ['ImportFolderID', id]);

  handleSelect = (folderId) => {
    const { fetchImportFolderSeries, importFolders } = this.props;
    const folder = this.findFolder(importFolders, folderId);
    if (!folder) { return; }
    fetchImportFolderSeries({
      id: folderId,
      name: folder.ImportFolderLocation || '',
    });
  };

  render() {
    const {
      items, isFetching, importFolders, selectedFolder,
    } = this.props;
    const series = [];
    const folders = [];
    let i = 0;
    forEach(items, (item) => {
      i += 1;
      series.push(<ImportFolderSeriesItem key={i} index={i} {...item} />);
    });

    forEach(importFolders, (folder) => {
    // eslint-disable-next-line max-len
      folders.push(<MenuItem eventKey={folder.ImportFolderID}>{folder.ImportFolderLocation}</MenuItem>);
    });

    const importFoldersSelector = [
      <span>Series In Import Folder
        <DropdownButton
          bsStyle="link"
          onSelect={this.handleSelect}
          title={selectedFolder.name || ''}
        >
          {folders}
        </DropdownButton>
      </span>,
    ];

    return (
      <div className={this.props.className}>
        <FixedPanel
          title={importFoldersSelector}
          description="Use Import Folders section to manage"
          isFetching={isFetching}
        >
          <table className="table">
            <tbody>
              {series}
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const {
    importFolderSeries, importFolders, selectedImportFolderSeries, fetching,
  } = state;

  return {
    items: importFolderSeries,
    isFetching: fetching.importFolderSeries === true,
    selectedFolder: selectedImportFolderSeries,
    importFolders: importFolders || [],
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchImportFolderSeries: (payload: SelectedFolder) => {
      dispatch({ type: Events.FETCH_IMPORT_FOLDER_SERIES, payload });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportFolderSeries);
