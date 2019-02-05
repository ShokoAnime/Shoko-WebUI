// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { HTMLSelect, Button, ControlGroup } from '@blueprintjs/core';
import { Table, Panel } from 'react-bulma-components';
import { connect } from 'react-redux';
import { forEach, find } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFolderSeriesItem from './ImportFolderSeriesItem';
import type { FolderSeriesItemType } from './ImportFolderSeriesItem';
import Events from '../../core/events';

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
  items: Array<FolderSeriesItemType>,
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

  constructor() {
    super();
    this.folderSelect = React.createRef();
  }

  findFolder = (folders: Array<ImportFolder>, id: number): ?ImportFolder => find(folders, ['ImportFolderID', parseInt(id, 10)]);

  handleSelect = () => {
    const folderId = this.folderSelect.value;
    const { fetchImportFolderSeries, importFolders } = this.props;
    const folder = this.findFolder(importFolders, folderId);
    if (!folder) { return; }
    fetchImportFolderSeries({
      id: folderId,
      name: folder.ImportFolderLocation || '',
    });
  };

  folderSelect: ?HTMLButtonElement;

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
      folders.push(<option key={folder.ImportFolderID} value={folder.ImportFolderID}>{folder.ImportFolderLocation}</option>);
    });

    return (
      <FixedPanel
        nowrap
        title="Series In Import Folder"
        isFetching={isFetching}
      >
        <Panel.Block>
          <ControlGroup className="folder-select">
            <HTMLSelect
              fill
              defaultValue={selectedFolder.id}
              elementRef={(ref) => { this.folderSelect = ref; }}
            >
              {folders}
            </HTMLSelect>
            <Button intent="primary" onClick={this.handleSelect}>Calculate</Button>
          </ControlGroup>
        </Panel.Block>
        <Panel.Block>
          <Table>
            <tbody>
              {series}
            </tbody>
          </Table>
        </Panel.Block>
      </FixedPanel>
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
