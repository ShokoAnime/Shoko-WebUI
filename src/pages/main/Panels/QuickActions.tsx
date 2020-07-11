import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import quickActions from '../../../core/quick-actions';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';

class QuickActions extends React.Component<Props> {
  renderRow = (key: string) => {
    const { pinnedActions, runAction, togglePinnedAction } = this.props;
    const action = quickActions[key];
    const pinned = pinnedActions.indexOf(key) === -1;

    return (
      <div className="flex mt-3 justify-between items-center">
        <span className="flex">{action.name}</span>
        <div className="flex">
          <Button onClick={() => togglePinnedAction(key)} tooltip={pinned ? 'Unpin Action' : 'Pin Action'} className={cx(['px-2 mr-2', pinned ? 'bg-color-unselected' : 'bg-color-accent'])}>
            <FontAwesomeIcon icon={faThumbtack} />
          </Button>
          <Button onClick={() => runAction(action.function, action.data)} className="bg-color-accent font-exo text-sm font-bold px-6 py-1">
            Run
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { title, actions } = this.props;
    const items: Array<any> = [];

    forEach(actions, (action) => {
      items.push(this.renderRow(action));
    });

    return (
      <FixedPanel title={title}>
        {items}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  pinnedActions: state.webuiSettings.v3.actions,
});

const mapDispatch = {
  runAction: (key: string, data: any) => (
    { type: Events.QUICK_ACTION_RUN, payload: { key, data } }
  ),
  togglePinnedAction: (payload: string) => (
    { type: Events.SETTINGS_TOGGLE_PINNED_ACTION, payload }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  title: string;
  actions: Array<string>;
};

export default connector(QuickActions);
