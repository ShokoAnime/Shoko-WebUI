// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
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
    this.props.formData({
      ImportFolderID: this.props.ImportFolderID,
      ImportFolderType: this.props.ImportFolderType,
      ImportFolderName: this.props.ImportFolderName,
      ImportFolderLocation: this.props.ImportFolderLocation,
      IsDropSource: this.props.IsDropSource,
      IsDropDestination: this.props.IsDropDestination,
      IsWatched: this.props.IsWatched,
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
          <Button bsSize="xsmall" onClick={this.onEdit}>Edit</Button>
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
