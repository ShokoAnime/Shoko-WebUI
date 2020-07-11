import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { isEqual, isUndefined } from 'lodash';
import { omitDeepBy } from '../../../core/util';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import type { layoutType } from '../../../core/slices/webuiSettings';
import { defaultLayout } from '../../../core/slices/webuiSettings';
import ImportBreakdown from '../Panels/ImportBreakdown';
import ImportFolders from '../Panels/ImportFolders';
import SeriesInImportFolder from '../Panels/SeriesInImportFolder';

const ResponsiveGridLayout = WidthProvider(Responsive);

type State = layoutType;
class ImportFoldersTab extends React.Component<Props, State> {
  state = defaultLayout.importFolders;

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
          containerPadding={[40, 40]}
          margin={[40, 40]}
          className="w-full"
          onLayoutChange={(_layout, layouts) => this.handleOnLayoutChange(layouts)}
        >
          <div key="importBreakdown">
            <ImportBreakdown />
          </div>
          <div key="importFolders">
            <ImportFolders />
          </div>
          <div key="seriesInImportFolder">
            <SeriesInImportFolder />
          </div>
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  layout: state.webuiSettings.v3.layout.importFolders,
  fetched: state.mainpage.fetched.settings,
});

const mapDispatch = {
  changeLayout: (layout: any) => ({
    type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
    payload: { importFolders: layout },
  }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportFoldersTab);
