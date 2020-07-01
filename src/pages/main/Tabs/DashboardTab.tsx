import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import CollectionBreakdown from '../Panels/CollectionBreakdown';
import SeriesBreakdown from '../Panels/SeriesBreakdown';
import ImportBreakdown from '../Panels/ImportBreakdown';
import FilesBreakdown from '../Panels/FilesBreakdown';
import ActionItems from '../Panels/ActionItems';
import ImportFolders from '../Panels/ImportFolders';
import CommandQueue from '../Panels/CommandQueue';

const ResponsiveGridLayout = WidthProvider(Responsive);

class DashboardTab extends React.Component<Props> {
  handleOnLayoutChange = (layout: any) => {
    const { fetched, changeLayout } = this.props;
    if (fetched) {
      changeLayout(layout);
    }
  };

  render() {
    const { layout } = this.props;

    const cols = {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    return (
      <React.Fragment>
        <ResponsiveGridLayout
          layouts={layout}
          cols={cols}
          rowHeight={0}
          containerPadding={[40, 40]}
          margin={[40, 40]}
          className="w-full"
          onLayoutChange={(_layout, layouts) => this.handleOnLayoutChange(layouts)}
        >
          <div key="collectionBreakdown">
            <CollectionBreakdown />
          </div>
          <div key="seriesBreakdown">
            <SeriesBreakdown />
          </div>
          <div key="commandQueue">
            <CommandQueue />
          </div>
          <div key="importFolders">
            <ImportFolders />
          </div>
          <div key="importBreakdown">
            <ImportBreakdown />
          </div>
          <div key="actionItems">
            <ActionItems />
          </div>
          <div key="filesBreakdown">
            <FilesBreakdown />
          </div>
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  layout: state.webuiSettings.layout.dashboard,
  fetched: state.mainpage.fetched.settings,
});

const mapDispatch = {
  changeLayout: (layout: any) => ({
    type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
    payload: { dashboard: layout },
  }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(DashboardTab);
