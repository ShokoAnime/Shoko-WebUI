import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Select from '../../../components/Input/Select';
import type { ImportFolderType } from '../../../core/types/api/import-folder';

class SeriesInImportFolders extends React.Component<Props> {
  renderItem = (series: any, idx: number) => {
    let paths = '';

    forEach(series.paths, (path, index) => {
      if (index) paths += `, ${path}`;
      else paths = path;
    });

    return (
      <tr key={idx}>
        <td className="p-2">{`${idx}.`}</td>
        <td className="w-4/12 p-2">{series.name}</td>
        <td className="w-4/12 p-2">{paths}</td>
        <td className="p-2">{series.type}</td>
        <td className="p-2">{series.size} Files</td>
        <td className="p-2">{prettyBytes(series.filesize)}</td>
      </tr>
    );
  };

  handleInputChange = (event: any) => {
    const { getSeries } = this.props;
    getSeries(event.target.value);
  };

  renderOptions = () => {
    const { importFolders, selectedFolder } = this.props;

    const folders: Array<any> = [];

    forEach(importFolders, (folder: ImportFolderType) => {
      folders.push(<option value={folder.ID}>{folder.Path}</option>);
    });

    return (
      <div className="font-muli font-bold">
        <Select id="selectedFolder" value={selectedFolder} onChange={this.handleInputChange}>
          {folders}
        </Select>
      </div>
    );
  };

  render() {
    const { seriesInFolder, isFetching } = this.props;

    const seriesItems: Array<any> = [];

    forEach(seriesInFolder, (series, idx) => {
      seriesItems.push(this.renderItem(series, idx + 1));
    });

    return (
      <FixedPanel title="Series In Import Folder" options={this.renderOptions()}>
        {isFetching ? (
          <div className="flex justify-center items-center h-full">
            <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-accent-secondary" />
          </div>
        ) : (
          <table className="table-auto">
            <tbody>
              {seriesItems}
            </tbody>
          </table>
        )}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  importFolders: state.mainpage.importFolders,
  selectedFolder: state.mainpage.selectedImportFolderSeries,
  isFetching: state.fetching.importFolderSeries,
  seriesInFolder: state.mainpage.importFolderSeries,
});

const mapDispatch = {
  getSeries: (id: number) => ({ type: Events.MAINPAGE_IMPORT_FOLDER_SERIES, payload: id }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(SeriesInImportFolders);
