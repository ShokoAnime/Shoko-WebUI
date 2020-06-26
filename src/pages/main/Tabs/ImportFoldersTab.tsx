import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import CollectionBreakdown from '../Panels/CollectionBreakdown';
import SeriesBreakdown from '../Panels/SeriesBreakdown';
import ImportBreakdown from '../Panels/ImportBreakdown';
import ImportFolders from '../Panels/ImportFolders';
import SeriesInImportFolder from '../Panels/SeriesInImportFolder';

const ResponsiveGridLayout = WidthProvider(Responsive);

class ImportFoldersPage extends React.Component {
  render() {
    const layout = {
      lg: [{
        i: 'collectionBreakdown', x: 0, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8,
      }, {
        i: 'seriesBreakdown', x: 6, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8,
      }, {
        i: 'importBreakdown', x: 0, y: 6, w: 6, h: 11,
      }, {
        i: 'importFolders', x: 6, y: 6, w: 6, h: 11,
      }, {
        i: 'seriesInImportFolder', x: 0, y: 17, w: 12, h: 11,
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

export default ImportFoldersPage;
