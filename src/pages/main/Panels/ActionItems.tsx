import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';
import Events from '../../../core/events';

class ActionItems extends React.Component<Props> {
  renderRow = (name: string, action: string) => {
    const { handleAction } = this.props;

    return (
      <div className="flex py-2 justify-between items-center">
        <span className="flex">{name}</span>
        <Button onClick={() => handleAction(action)} className="bg-color-accent font-exo text-sm font-bold px-6 py-1">
          Run
        </Button>
      </div>
    );
  };

  render() {
    const items: Array<any> = [];

    items.push(this.renderRow('Run Import', 'folder-import'));
    items.push(this.renderRow('Remove Missing Files', 'remove-missing-files'));
    items.push(this.renderRow('Update All Stats', 'update-all-stats'));
    items.push(this.renderRow('Update All Media Info', 'update-all-media-info'));
    items.push(this.renderRow('Plex Sync All', 'plex-sync'));

    return (
      <FixedPanel title="Action Items">
        {items}
      </FixedPanel>
    );
  }
}

const mapDispatch = {
  handleAction: (payload: string) => ({ type: Events.RUN_QUICK_ACTION, payload }),
};

const connector = connect(() => ({}), mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ActionItems);
