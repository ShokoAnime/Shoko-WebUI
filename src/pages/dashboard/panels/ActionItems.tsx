import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import quickActions from '../../../core/quick-actions';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';

class ActionItems extends React.Component<Props> {
  renderRow = (key: string) => {
    const { runAction } = this.props;
    const action = quickActions[key];

    return (
      <div className="flex justify-between items-center mt-3 first:mt-0" key={key}>
        <span className="flex">{action.name}</span>
        <div className="flex">
          <Button onClick={() => runAction(action.function, action.data)} className="bg-color-accent font-exo text-xs font-bold px-6 py-1">
            Run
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { pinnedActions, isFetching } = this.props;
    const items: Array<any> = [];

    forEach(pinnedActions, (action) => {
      items.push(this.renderRow(action));
    });

    return (
      <FixedPanel title="Action Items" isFetching={isFetching}>
        {items}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  pinnedActions: state.webuiSettings.v3.actions,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  runAction: (key: string, data: any) => (
    { type: Events.QUICK_ACTION_RUN, payload: { key, data } }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ActionItems);
