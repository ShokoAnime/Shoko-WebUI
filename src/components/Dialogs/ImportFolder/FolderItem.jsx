import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import store from '../../../core/store';
import { setFormData } from '../../../core/actions/modals/ImportFolder';

class FolderItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    ImportFolderID: PropTypes.number,
    ImportFolderName: PropTypes.string,
    ImportFolderLocation: PropTypes.string,
    ImportFolderType: PropTypes.number,
    IsDropSource: PropTypes.number,
    IsDropDestination: PropTypes.number,
    IsWatched: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.onEdit = this.onEdit.bind(this);
  }

  onEdit() {
    store.dispatch(setFormData({
      ImportFolderID: this.props.ImportFolderID,
      ImportFolderType: this.props.ImportFolderType,
      ImportFolderName: this.props.ImportFolderName,
      ImportFolderLocation: this.props.ImportFolderLocation,
      IsDropSource: this.props.IsDropSource,
      IsDropDestination: this.props.IsDropDestination,
      IsWatched: this.props.IsWatched,
    }));
  }

  render() {
    const { index, ImportFolderLocation, ImportFolderType, IsDropSource,
      IsDropDestination, IsWatched } = this.props;
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

export default FolderItem;
