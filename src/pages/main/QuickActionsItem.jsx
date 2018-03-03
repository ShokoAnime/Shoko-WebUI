// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';

type Props = {
  index: number,
  name: string,
  action: string,
  onAction: (string) => void,
}

class QuickActionsItem extends React.Component<Props> {
  static propTypes = {
    index: PropTypes.number,
    name: PropTypes.string,
    action: PropTypes.string,
    onAction: PropTypes.func,
  };

  handleAction = () => {
    const { action, onAction } = this.props;
    onAction(action);
  };

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
