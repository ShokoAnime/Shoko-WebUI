import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { isEqual, isUndefined } from 'lodash';
import { omitDeepBy } from '../../core/util';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import type { layoutType } from '../../core/slices/webuiSettings';
import { defaultLayout } from '../../core/slices/webuiSettings';
import CollectionBreakdown from './panels/CollectionBreakdown';
import SeriesBreakdown from './panels/SeriesBreakdown';
import ImportBreakdown from './panels/ImportBreakdown';
import CollectionTypeBreakdown from './panels/CollectionTypeBreakdown';
import ActionItems from './panels/ActionItems';
import QueueProcessor from './panels/QueueProcessor';
import ShokoNews from './panels/ShokoNews';

const ResponsiveGridLayout = WidthProvider(Responsive);

type State = layoutType;

class DashboardPage extends React.Component<Props, State> {
  state = defaultLayout.dashboard;

  componentDidMount = () => {
    const { layout } = this.props;
    this.setState(layout);
  };

  componentDidUpdate = (prevProps) => {
    const { layout } = this.props;
    if (!isEqual(prevProps, this.props)) this.setState(layout);
  };

  handleOnLayoutChange = (layout: any) => {
    const { changeLayout } = this.props;
    if (!isEqual(this.state, omitDeepBy(layout, isUndefined))) {
      changeLayout(layout);
    }
  };

  render() {
    const cols = {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    return (
      <React.Fragment>
        <ResponsiveGridLayout
          layouts={this.state}
          cols={cols}
          rowHeight={0}
          containerPadding={[30, 30]}
          margin={[25, 25]}
          className="w-full"
          onLayoutChange={(_layout, layouts) => this.handleOnLayoutChange(layouts)}
        >
          <div key="collectionBreakdown">
            <CollectionBreakdown />
          </div>
          <div key="seriesBreakdown">
            <SeriesBreakdown />
          </div>
          <div key="queueProcessor">
            <QueueProcessor />
          </div>
          <div key="importBreakdown">
            <ImportBreakdown />
          </div>
          <div key="shokoNews">
            <ShokoNews />
          </div>
          <div key="actionItems">
            <ActionItems />
          </div>
          <div key="actionItems2">
            <ActionItems />
          </div>
          <div key="collectionTypeBreakdown">
            <CollectionTypeBreakdown />
          </div>
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  layout: state.webuiSettings.webui_v2.layout.dashboard,
});

const mapDispatch = {
  changeLayout: (layout: any) => ({
    type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
    payload: { dashboard: layout },
  }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(DashboardPage);
