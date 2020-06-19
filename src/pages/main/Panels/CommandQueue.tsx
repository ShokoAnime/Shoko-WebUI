import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTasks, faListAlt, faImage, faTimes, faPause, faPlay, faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';

const icons = { hasher: faTasks, general: faListAlt, images: faImage };
const names = { hasher: 'Hasher', general: 'General', images: 'Images' };

class CommandQueue extends React.Component<Props> {
  renderItem = (key = '', count = 0, status = 'Unknown') => {
    const { handleOperation } = this.props;

    return (
      <div className="flex justify-between my-2">
        <div className="flex w-1/12 items-center">
          <FontAwesomeIcon icon={icons[key]} className="mr-4" />
          <span className="font-semibold">{names[key]}</span>
        </div>
        <div className="flex">{count}</div>
        <div className="flex">
          <Button className="color-accent mx-2" onClick={() => handleOperation!(`${names[key]}Clear`)}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
          {status === 'Paused' ? (
            <Button className="color-accent mx-2" onClick={() => handleOperation!(`${names[key]}Start`)}>
              <FontAwesomeIcon icon={faPlay} />
            </Button>
          ) : (
            <Button className="color-accent mx-2" onClick={() => handleOperation!(`${names[key]}Pause`)}>
              <FontAwesomeIcon icon={faPause} />
            </Button>
          )}
        </div>
      </div>
    );
  };

  renderStatus = (status = 'Unknown') => (
    <div className="flex mb-2 break-all">{status}</div>
  );

  renderOptions = () => {
    const { items, handleOperation } = this.props;
    let paused = true;

    forEach(items, (item) => {
      paused = paused && item.state === 'Paused';
    });

    return (
      <div>
        {paused ? (
          <Button className="color-accent mx-2" onClick={() => handleOperation!('Start')}>
            <FontAwesomeIcon icon={faPlay} />
          </Button>
        ) : (
          <Button className="color-accent mx-2" onClick={() => handleOperation!('Pause')}>
            <FontAwesomeIcon icon={faPause} />
          </Button>
        )}
      </div>
    );
  };

  render() {
    const { items, hasFetched } = this.props;
    const commands: Array<any> = [];

    forEach(items, (item, key) => {
      commands.push(this.renderItem(key, item.count, item.state));
      commands.push(this.renderStatus(item.state));
    });

    return (
      <FixedPanel title="Commands" options={this.renderOptions()}>
        {!hasFetched ? (
          <div className="flex justify-center items-center h-full">
            <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-accent-secondary" />
          </div>
        ) : (commands)}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  items: state.mainpage.queueStatus,
  hasFetched: state.mainpage.fetched.queueStatus,
});

const mapDispatch = {
  handleOperation: (value: string) => ({ type: Events.MAINPAGE_QUEUE_OPERATION, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(CommandQueue);
