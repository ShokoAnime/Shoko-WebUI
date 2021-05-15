import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';

class ShokoNews extends React.Component<Props> {
  renderRow = (key: string) => (
    <div className="flex justify-between items-center mt-3 first:mt-0" key={key}>
      {key}
    </div>
  );

  render() {
    const { isFetching } = this.props;
    const items: Array<any> = [];

    forEach(['Shoko Released', 'Shoko Released', 'Shoko Released', 'Shoko Released'], (action) => {
      items.push(this.renderRow(action));
    });

    return (
      <FixedPanel title="Shoko News" isFetching={isFetching}>
        {items}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  runAction: (key: string, data: any) => (
    { type: Events.QUICK_ACTION_RUN, payload: { key, data } }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ShokoNews);
