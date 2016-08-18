import React, { PropTypes } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { forEach, find } from 'lodash';
import store from '../../core/store';
import {
  importFolderSeriesAsync,
  selectImportFolderSeries,
} from '../../core/actions';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFolderSeriesItem from './ImportFolderSeriesItem';

class ImportFolderSeries extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.array,
    importFolders: PropTypes.object,
    selectedFolder: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleClick() {
    importFolderSeriesAsync(true, '/1');
  }

  handleSelect(folderId) {
    const { importFolders } = store.getState();
    const folder = find(importFolders.items, ['ImportFolderID', folderId]);
    store.dispatch(
      selectImportFolderSeries({ id: folderId, name: folder.ImportFolderLocation || '' })
    );
    importFolderSeriesAsync(true, `/${folderId}`);
  }

  render() {
    const { items, isFetching, lastUpdated, importFolders, selectedFolder } = this.props;
    let series = [];
    let folders = [];
    let i = 0;
    forEach(items, (item) => {
      i++;
      series.push(<ImportFolderSeriesItem key={i} index={i} {...item} />);
    });

    forEach(importFolders, (folder) => {
      folders.push(
        <MenuItem eventKey={folder.ImportFolderID}>{folder.ImportFolderLocation}</MenuItem>
      );
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
          lastUpdated={lastUpdated}
          isFetching={isFetching}
          actionName="Sort"
          onAction={this.handleClick}
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
    importFolders: importFolders.items || [],
  };
}

export default connect(mapStateToProps)(ImportFolderSeries);
