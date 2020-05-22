
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTasks, faListAlt, faImage, faTimes, faPause, faPlay,
} from '@fortawesome/free-solid-svg-icons';
import FixedPanel from '../../components/Panels/FixedPanel';
import Button from '../../components/Buttons/Button';
import Events from '../../core/events';

const icons = { hasher: faTasks, general: faListAlt, images: faImage };
const names = { hasher: 'Hasher', general: 'General', images: 'Images' };

type QueueItem = {
  count: number;
  state: string;
};

type StateProps = {
  items?: {
    hasher: QueueItem;
    general: QueueItem;
    images: QueueItem;
  }
};

type DispatchProps = {
  handleOperation?: (value: string) => void;
};

type Props = StateProps & DispatchProps;

class CommandQueue extends React.Component<Props> {
  static propTypes = {
    items: PropTypes.shape({
      hasher: PropTypes.shape({
        count: PropTypes.number.isRequired, state: PropTypes.string.isRequired,
      }).isRequired,
      general: PropTypes.shape({
        count: PropTypes.number.isRequired, state: PropTypes.string.isRequired,
      }).isRequired,
      images: PropTypes.shape({
        count: PropTypes.number.isRequired, state: PropTypes.string.isRequired,
      }).isRequired,
    }),
    handleOperation: PropTypes.func,
  };

  renderCount = (key = '', count = 0, status = 'Unknown') => {
    const { handleOperation } = this.props;

    return (
      <tr key={`count-${key}`}>
        <td className="w-1/12 py-2">
          <FontAwesomeIcon icon={icons[key]} />
        </td>
        <td className="w-5/12 py-2">{names[key]}</td>
        <td className="w-3/12 py-2">{count}</td>
        <td className="w-3/12 py-2" align="right">
          <Button className="color-accent mx-2" onClick={() => handleOperation!(`Queue${names[key]}Clear`)}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
          {status === 'Paused' ? (
            <Button className="color-accent mx-2" onClick={() => handleOperation!(`Queue${names[key]}Start`)}>
              <FontAwesomeIcon icon={faPlay} />
            </Button>
          ) : (
            <Button className="color-accent mx-2" onClick={() => handleOperation!(`Queue${names[key]}Pause`)}>
              <FontAwesomeIcon icon={faPause} />
            </Button>
          )}
        </td>
      </tr>
    );
  };

  renderStatus = (key = '', status = 'Unknown') => (
    <tr key={`status-${key}`}>
      <td />
      <td className="pb-2 break-words" colSpan={2}>{status}</td>
    </tr>
  );

  render() {
    const { items } = this.props;
    const commands: any[] = [];

    forEach(items, (item, key) => {
      commands.push(this.renderCount(key, item.count, item.state));
      commands.push(this.renderStatus(key, item.state));
    });

    return (
      <FixedPanel title="Commands">
        {commands}
      </FixedPanel>
    );
  }
}

function mapStateToProps(state): StateProps {
  const { queueStatus } = state;

  return {
    items: queueStatus,
  };
}

function mapDispatchToProps(dispatch): DispatchProps {
  return {
    handleOperation: (value) => {
      dispatch({ type: Events.QUEUE_OPERATION, payload: value });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommandQueue);
