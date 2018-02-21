import PropTypes from 'prop-types';
import React from 'react';
import prettysize from 'prettysize';

class ImportFolderSeriesItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    name: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.number,
  };

  render() {
    const {
      index, name, size, type,
    } = this.props;
    return (
      <tr>
        <td>{index}</td>
        <td>{name}</td>
        <td>{type}</td>
        <td>{prettysize(size)}</td>
      </tr>
    );
  }
}

export default ImportFolderSeriesItem;
