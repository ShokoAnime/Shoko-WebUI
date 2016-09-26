import React, { PropTypes } from 'react';
import prettysize from 'prettysize';

class ImportFolderSeriesItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    AnimeSeriesName: PropTypes.string,
    FileCount: PropTypes.number,
    FileSize: PropTypes.number,
    Folders: PropTypes.array,
  };

  render() {
    const { index, AnimeSeriesName, FileCount, FileSize, Folders } = this.props;
    return (
      <tr>
        <td>{index}</td>
        <td>{AnimeSeriesName}</td>
        <td>{Folders.join(', ')}</td>
        <td>{FileCount}</td>
        <td>{prettysize(FileSize)}</td>
      </tr>
    );
  }
}

export default ImportFolderSeriesItem;
