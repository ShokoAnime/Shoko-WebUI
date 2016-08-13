import React, { PropTypes } from 'react';

class QuickActionsItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    name: PropTypes.string,
  };

  render() {
    const { index, name } = this.props;
    return (
      <tr>
        <td>{index}</td>
        <td>{name}</td>
        <td className="text-right">
          <span className="badge bg-success">Coming soon...</span>
        </td>
      </tr>
    );
  }
}

export default QuickActionsItem;
