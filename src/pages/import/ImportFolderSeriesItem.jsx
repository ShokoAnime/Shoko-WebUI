// @flow
import PropTypes from 'prop-types';
import React from 'react';
import prettysize from 'prettysize';

export type FolderSeriesItemType = {
  name: string,
  id: number,
  filesize: number,
  size: number,
  paths: Array<string>,
}

type Props = FolderSeriesItemType & {
  index: number,
}

class ImportFolderSeriesItem extends React.Component<Props> {
  static propTypes = {
    index: PropTypes.number,
    name: PropTypes.string,
    filesize: PropTypes.number,
    size: PropTypes.number,
    paths: PropTypes.arrayOf(PropTypes.string),
  };

  render() {
    const {
      index, name, filesize, paths, size,
    } = this.props;
    return (
      <tr>
        <td>{index}</td>
        <td>{name}</td>
        <td>{paths.map(path => <span>{path}</span>)}</td>
        <td>{size}</td>
        <td className="text-nowrap">{prettysize(filesize)}</td>
      </tr>
    );
  }
}

export default ImportFolderSeriesItem;
