import PropTypes from 'prop-types';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { forEach, find } from 'lodash';
import store from '../../core/store';
import {
  selectImportFolderSeries,
} from '../../core/actions';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFolderSeriesItem from './ImportFolderSeriesItem';
import { importFolderSeriesAsync } from '../../core/legacy-actions';

class ImportFolderSeries extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.array,
    importFolders: PropTypes.object,
    selectedFolder: PropTypes.object,
  };

  static handleClick() {
    importFolderSeriesAsync(true, '/1');
  }

  static handleSelect(folderId) {
    const { importFolders } = store.getState();
    const folder = find(importFolders, ['ImportFolderID', folderId]);
    store.dispatch(
      selectImportFolderSeries({ id: folderId, name: folder.ImportFolderLocation || '' }),
    );
    importFolderSeriesAsync(true, `?id=${folderId}`);
  }

  render() {
    const { items, isFetching, lastUpdated, importFolders, selectedFolder } = this.props;
    const series = [];
    const folders = [];
    let i = 0;
    forEach(items, (item) => {
      i += 1;
      series.push(<ImportFolderSeriesItem key={i} index={i} {...item} />);
    });

    forEach(importFolders, (folder) => {
      folders.push(
        <MenuItem key={folder.ImportFolderID} eventKey={folder.ImportFolderID}>
          {folder.ImportFolderLocation}
        </MenuItem>,
      );
    });

    const importFoldersSelector = [
      <span>Series In Import Folder
        <DropdownButton
          id="import-folder-select"
          bsStyle="link"
          onSelect={ImportFolderSeries.handleSelect}
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
          lastUpdated={lastUpdated}
          isFetching={isFetching}
          actionName="Sort"
          onAction={ImportFolderSeries.handleClick}
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
  const { importFolderSeries, importFolders, selectedImportFolderSeries } = state;
  const {
    isFetching,
    lastUpdated,
    items,
  } = importFolderSeries || {
    isFetching: true,
    items: [],
  };

  return {
    items,
    isFetching,
    lastUpdated,
    selectedFolder: selectedImportFolderSeries,
    importFolders: importFolders || [],
  };
}

export default connect(mapStateToProps)(ImportFolderSeries);
