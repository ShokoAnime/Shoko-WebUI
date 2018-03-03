// @flow
import PropTypes from 'prop-types';
import React from 'react';
import prettysize from 'prettysize';

type Props = {
  index: number,
  name: string,
  type: string,
  size: number,
}

class ImportFolderSeriesItem extends React.Component<Props> {
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
