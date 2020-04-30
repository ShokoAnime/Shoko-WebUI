// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { Table } from 'react-bulma-components';
import { Button } from '@blueprintjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTasks,
  faListAlt,
  faImage,
  faTimes,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import FixedPanel from '../../components/Panels/FixedPanel';
import Events from '../../core/events';

const icons = { hasher: faTasks, general: faListAlt, images: faImage };
const names = { hasher: 'Hasher', general: 'General', images: 'Images' };

type Props = {
  items: {
    count: number,
    state: string,
  },
  handleOperation: (value: string) => void,
}

class Commands extends React.Component<Props> {
  static propTypes = {
    items: PropTypes.object,
    handleOperation: PropTypes.func.isRequired,
  };

  renderCount = (key, count, status) => {
    const { handleOperation } = this.props;
    return (
      <tr key={`count-${key}`}>
        <td className="icon-column command-item">
          <FontAwesomeIcon icon={icons[key]} />
        </td>
        <td className="command-item">{names[key]}</td>
        <td className="command-item">{count}</td>
        <td className="operations-column command-item">
          <Button className="operation-button-1">
            <FontAwesomeIcon
              icon={faTimes}
              onClick={() => handleOperation(`Queue${names[key]}Clear`)}
            />
          </Button>
          {status === 'Paused' ? (
            <Button onClick={() => handleOperation(`Queue${names[key]}Start`)}>
              <FontAwesomeIcon icon={faPlay} />
            </Button>
          ) : (
            <Button onClick={() => handleOperation(`Queue${names[key]}Pause`)}>
              <FontAwesomeIcon icon={faPause} />
            </Button>
          )}
        </td>
      </tr>
    );
  }

  renderStatus = (key, status) => (
    <tr key={`status-${key}`}>
      <td />
      <td colSpan="3">
        <div className="status">{status}</div>
      </td>
    </tr>
  );

  render() {
    const { items } = this.props;
    const commands = [];
    forEach(items, (item, key) => {
      commands.push(this.renderCount(key, item.count, item.state));
      commands.push(this.renderStatus(key, item.state));
    });

    return (
      <FixedPanel
        className="commands"
        title="Commands"
        description="Commands currently being processed"
      >
        <Table>
          <tbody>
            {commands}
          </tbody>
        </Table>
      </FixedPanel>
    );
  }
}

function mapStateToProps(state) {
  const { queueStatus } = state;

  return {
    items: queueStatus,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleOperation: (value) => { dispatch({ type: Events.QUEUE_OPERATION, payload: value }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Commands);
