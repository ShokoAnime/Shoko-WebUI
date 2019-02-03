// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import { setFormData } from '../../../core/actions/modals/ImportFolder';

export type FolderItemType = {
  ImportFolderID: number,
  ImportFolderName: string,
  ImportFolderLocation: string,
  ImportFolderType: number,
  IsDropSource: number,
  IsDropDestination: number,
  IsWatched: number,
}

type Props = FolderItemType & {
  index: number,
  formData: (FolderItemType) => void,
}

class FolderItem extends React.Component<Props> {
  static propTypes = {
    index: PropTypes.number,
    ImportFolderID: PropTypes.number,
    ImportFolderName: PropTypes.string,
    ImportFolderLocation: PropTypes.string,
    ImportFolderType: PropTypes.number,
    IsDropSource: PropTypes.number,
    IsDropDestination: PropTypes.number,
    IsWatched: PropTypes.number,
    formData: PropTypes.func.isRequired,
  };

  onEdit = () => {
    const { formData, ...props } = this.props;
    formData({
      ImportFolderID: props.ImportFolderID,
      ImportFolderType: props.ImportFolderType,
      ImportFolderName: props.ImportFolderName,
      ImportFolderLocation: props.ImportFolderLocation,
      IsDropSource: props.IsDropSource,
      IsDropDestination: props.IsDropDestination,
      IsWatched: props.IsWatched,
    });
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
          <Button size="small" onClick={this.onEdit}>Edit</Button>
        </td>
      </tr>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    formData: (data: FolderItemType) => dispatch(setFormData(data)),
  };
}

export default connect(undefined, mapDispatchToProps)(FolderItem);
