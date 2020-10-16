import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTasks, faListAlt, faImage, faTimes, faPause, faPlay,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';
import type { QueueItemType } from '../../../core/types/api';

const icons = { hasher: faTasks, general: faListAlt, images: faImage };
const names = { hasher: 'Hasher', general: 'General', images: 'Images' };

class CommandQueue extends React.Component<Props> {
  renderItem = (key: string, item: QueueItemType, count: number) => {
    const { handleOperation } = this.props;

    return (
      <div className="flex flex-col" key={key}>
        <div className="flex justify-between mt-3">
          <div className="flex items-center w-24">
            <FontAwesomeIcon icon={icons[key]} className="mr-4" />
            <span className="font-semibold">{names[key]}</span>
          </div>
          <div className="flex">{count ?? 0}</div>
          <div className="flex items-center">
            <Button className="color-accent mx-2" onClick={() => handleOperation!(`${names[key]}Clear`)} tooltip="Clear">
              <FontAwesomeIcon icon={faTimes} />
            </Button>
            {item?.state === 18 ? (
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
          {item?.description ?? 'Idle'}
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
      if (typeof item === 'number') return;
      paused = item?.state === 18;
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
      commands.push(this.renderItem('hasher', items.HasherQueueState, items.HasherQueueCount));
      commands.push(this.renderItem('general', items.GeneralQueueState, items.GeneralQueueCount));
      commands.push(this.renderItem('images', items.ImageQueueState, items.ImageQueueCount));
    }

    return (
      <FixedPanel title="Commands" options={this.renderOptions()} isFetching={!hasFetched}>
        {commands}
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
