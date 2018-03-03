// @flow
import PropTypes from 'prop-types';
import React from 'react';
import type { FolderItemType } from '../../components/Dialogs/ImportFolder/FolderItem';

type Props = FolderItemType & {
  index: number,
}

class ImportFoldersItem extends React.Component<Props> {
  static propTypes = {
    index: PropTypes.number,
    ImportFolderLocation: PropTypes.string,
    ImportFolderType: PropTypes.number,
    IsDropSource: PropTypes.number,
    IsDropDestination: PropTypes.number,
    IsWatched: PropTypes.number,
  };

  render() {
    const {
      index, ImportFolderLocation, ImportFolderType, IsDropSource,
      IsDropDestination, IsWatched,
    } = this.props;
    const flags = [];
    if (IsDropSource === 1) flags.push('Drop Source');
    if (IsDropDestination === 1) flags.push('Drop Destination');
    if (IsWatched === 1) flags.push('Watched');

    return (
      <tr>
        <td>{index}</td>
        <td>{ImportFolderLocation}</td>
        <td>{flags.join(' ')}</td>
        <td>{ImportFolderType === 0 ? 'Local' : '??'}</td>
        <td className="text-right">
          <span className="badge bg-success">Online</span>
        </td>
      </tr>
    );
  }
}

export default ImportFoldersItem;
