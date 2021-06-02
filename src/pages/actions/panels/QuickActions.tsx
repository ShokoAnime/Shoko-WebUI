import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import quickActions from '../../../core/quick-actions';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Input/Button';

type Props = {
  title: string;
  actions: Array<string>;
};

function QuickActions(props: Props) {
  const dispatch = useDispatch();

  const pinnedActions = useSelector((state: RootState) => state.webuiSettings.webui_v2.actions);

  const runAction = (key: string, data: any) => dispatch(
    { type: Events.QUICK_ACTION_RUN, payload: { key, data } },
  );

  const togglePinnedAction = (payload: string) => dispatch(
    { type: Events.SETTINGS_TOGGLE_PINNED_ACTION, payload },
  );

  const renderRow = (key: string) => {
    const action = quickActions[key];
    const pinned = pinnedActions.indexOf(key) === -1;

    return (
      <div className="flex justify-between items-center mt-3 first:mt-0" key={key}>
        <span className="flex">{action.name}</span>
        <div className="flex">
          <Button onClick={() => togglePinnedAction(key)} tooltip={pinned ? 'Unpin Action' : 'Pin Action'} className={cx(['px-2 mr-2', pinned ? 'bg-color-unselected' : 'bg-color-highlight-1'])}>
            <FontAwesomeIcon icon={faThumbtack} className="text-xs" />
          </Button>
          <Button onClick={() => runAction(action.function, action.data)} className="bg-color-highlight-1 font-exo text-xs font-bold px-6 py-1">
            Run
          </Button>
        </div>
      </div>
    );
  };

  const { title, actions } = props;

  return (
    <FixedPanel title={title}>
      {actions.map(action => renderRow(action))}
    </FixedPanel>
  );
}

export default QuickActions;
