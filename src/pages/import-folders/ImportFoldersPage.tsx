import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { isEqual, isUndefined } from 'lodash';
import { omitDeepBy } from '../../core/util';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { defaultLayout } from '../../core/slices/webuiSettings';
import ImportBreakdown from '../dashboard/panels/ImportBreakdown';
import ImportFolders from './panels/ImportFolders';
import SeriesInImportFolder from './panels/SeriesInImportFolder';

const ResponsiveGridLayout = WidthProvider(Responsive);

function ImportFoldersPage() {
  const dispatch = useDispatch();

  const layout = useSelector(
    (state: RootState) => state.webuiSettings.webui_v2.layout.importFolders,
  );

  const [currentLayout, setCurrentLayout] = useState(defaultLayout.importFolders);

  useEffect(() => {
    setCurrentLayout(layout);
  }, []);

  const handleOnLayoutChange = (newLayout: ReactGridLayout.Layouts) => {
    if (!isEqual(currentLayout, omitDeepBy(newLayout, isUndefined))) {
      dispatch({
        type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
        payload: { importFolders: newLayout },
      });
    }
  };

  return (
    <ResponsiveGridLayout
      layouts={currentLayout}
      cols={{
        lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
      }}
      rowHeight={0}
      containerPadding={[30, 30]}
      margin={[25, 25]}
      className="w-full"
      onLayoutChange={(_layout, layouts) => handleOnLayoutChange(layouts)}
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
  );
}

export default ImportFoldersPage;
