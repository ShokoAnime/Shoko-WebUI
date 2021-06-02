import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import quickActions from '../../../core/quick-actions';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Input/Button';

function ActionItems() {
  const dispatch = useDispatch();

  const isFetching = useSelector((state: RootState) => state.fetching.settings);
  const pinnedActions = useSelector((state: RootState) => state.webuiSettings.webui_v2.actions);

  const runAction = (key: string, data: any) => dispatch(
    { type: Events.QUICK_ACTION_RUN, payload: { key, data } },
  );

  const renderRow = (key: string) => {
    const action = quickActions[key];

    return (
      <div className="flex justify-between items-center mt-3 first:mt-0" key={key}>
        <span className="flex">{action.name}</span>
        <div className="flex">
          <Button onClick={() => runAction(action.function, action.data)} className="bg-color-highlight-1 font-exo text-xs font-bold px-6 py-1">
            Run
          </Button>
        </div>
      </div>
    );
  };

  return (
    <FixedPanel title="Action Items" isFetching={isFetching}>
      {pinnedActions.map(
        action => renderRow(action),
      )}
    </FixedPanel>
  );
}

export default ActionItems;
