
import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import CollectionBreakdown from '../Panels/CollectionBreakdown';
import SeriesBreakdown from '../Panels/SeriesBreakdown';
import ImportBreakdown from '../Panels/ImportBreakdown';
import FilesBreakdown from '../Panels/FilesBreakdown';
import ActionItems from '../Panels/ActionItems';
import ImportFolders from '../Panels/ImportFolders';
import CommandQueue from '../Panels/CommandQueue';

const ResponsiveGridLayout = WidthProvider(Responsive);

class DashboardTab extends React.Component {
  render() {
    const layout = {
      lg: [{
        i: 'collectionBreakdown', x: 0, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8,
      }, {
        i: 'seriesBreakdown', x: 6, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8,
      }, {
        i: 'commandQueue', x: 0, y: 6, w: 5, h: 9, minW: 5, minH: 5,
      }, {
        i: 'importFolders', x: 5, y: 6, w: 4, h: 9,
      }, {
        i: 'importBreakdown', x: 0, y: 15, w: 9, h: 11,
      }, {
        i: 'actionItems', x: 9, y: 11, w: 3, h: 9,
      }, {
        i: 'filesBreakdown', x: 9, y: 15, w: 3, h: 11,
      }],
    };

    const cols = {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    const containerPadding = [40, 40] as [number, number];

    const margin = [40, 40] as [number, number];

    return (
      <React.Fragment>
        <ResponsiveGridLayout
          layouts={layout}
          cols={cols}
          rowHeight={0}
          containerPadding={containerPadding}
          margin={margin}
          className="w-full"
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

export default DashboardTab;
