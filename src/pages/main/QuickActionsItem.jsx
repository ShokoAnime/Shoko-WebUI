import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';

class QuickActionsItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    name: PropTypes.string,
    action: PropTypes.string,
    onAction: PropTypes.func,
  };

  constructor() {
    super();
    this.handleAction = this.handleAction.bind(this);
  }

  handleAction() {
    const { action, onAction } = this.props;
    onAction(action);
  }

  render() {
    const { index, name } = this.props;
    return (
      <tr>
        <td>{index}</td>
        <td>{name}</td>
        <td className="text-right">
          <Button bsStyle="primary" bsSize="small" onClick={this.handleAction}>Run</Button>
        </td>
      </tr>
    );
  }
}

export default QuickActionsItem;
