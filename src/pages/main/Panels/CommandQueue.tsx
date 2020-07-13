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
import type { QueueItemType } from '../../../core/types/api';

const icons = { hasher: faTasks, general: faListAlt, images: faImage };
const names = { hasher: 'Hasher', general: 'General', images: 'Images' };

class CommandQueue extends React.Component<Props> {
  renderItem = (key: string, item: QueueItemType) => {
    const { handleOperation } = this.props;

    return (
      <div className="flex flex-col">
        <div className="flex justify-between mt-3">
          <div className="flex items-center w-24">
            <FontAwesomeIcon icon={icons[key]} className="mr-4" />
            <span className="font-semibold">{names[key]}</span>
          </div>
          <div className="flex">{item?.count ?? 0}</div>
          <div className="flex items-center">
            <Button className="color-accent mx-2" onClick={() => handleOperation!(`${names[key]}Clear`)} tooltip="Clear">
              <FontAwesomeIcon icon={faTimes} />
            </Button>
            {item?.state === 'Paused' ? (
              <Button className="color-accent mx-2" onClick={() => handleOperation!(`${names[key]}Start`)} tooltip="Resume">
                <FontAwesomeIcon icon={faPlay} />
              </Button>
            ) : (
              <Button className="color-accent mx-2" onClick={() => handleOperation!(`${names[key]}Pause`)} tooltip="Pause">
                <FontAwesomeIcon icon={faPause} />
              </Button>
            )}
          </div>
        </div>
        <div className="flex break-all queue-item mt-2">
          {item?.state ?? 'Idle'}
        </div>
      </div>
    );
  };

  renderStatus = (key: string, status = 'Unknown') => (
    <div key={`${key}-status`} className="flex mb-2 break-all">{status}</div>
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
          <Button className="color-accent mx-2" onClick={() => handleOperation!('Start')} tooltip="Resume All">
            <FontAwesomeIcon icon={faPlay} />
          </Button>
        ) : (
          <Button className="color-accent mx-2" onClick={() => handleOperation!('Pause')} tooltip="Pause All">
            <FontAwesomeIcon icon={faPause} />
          </Button>
        )}
      </div>
    );
  };

  render() {
    const { items, hasFetched } = this.props;
    const commands: Array<any> = [];

    if (items) {
      commands.push(this.renderItem('hasher', items.hasher));
      commands.push(this.renderItem('general', items.general));
      commands.push(this.renderItem('images', items.images));
    }

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
