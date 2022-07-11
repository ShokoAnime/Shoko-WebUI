import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactGridLayout, { Responsive, WidthProvider } from 'react-grid-layout';
import { isEqual, isUndefined } from 'lodash';
import { omitDeepBy } from '../../core/util';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { defaultLayout } from '../../core/slices/webuiSettings';
import CollectionBreakdown from './panels/CollectionBreakdown';
import ImportBreakdown from './panels/ImportBreakdown';
import CollectionTypeBreakdown from './panels/CollectionTypeBreakdown';
import QueueProcessor from './panels/QueueProcessor';
import ShokoNews from './panels/ShokoNews';
import RecentlyImported from './panels/RecentlyImported';
import ImportFolders from './panels/ImportFolders';
import ContinueWatching from './panels/ContinueWatching';
import UpcomingAnime from './panels/UpcomingAnime';

const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardPage() {
  const dispatch = useDispatch();

  const layout = useSelector((state: RootState) => state.webuiSettings.webui_v2.layout.dashboard);

  const [currentLayout, setCurrentLayout] = useState(defaultLayout.dashboard);

  useEffect(() => {
    setCurrentLayout(layout);
  }, []);

  const handleOnLayoutChange = (newLayout: ReactGridLayout.Layouts) => {
    if (!isEqual(currentLayout, omitDeepBy(newLayout, isUndefined))) {
      dispatch({
        type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
        payload: { dashboard: newLayout },
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
      <div key="collectionBreakdown">
        <CollectionBreakdown />
      </div>
      <div key="collectionTypeBreakdown">
        <CollectionTypeBreakdown />
      </div>
      <div key="queueProcessor">
        <QueueProcessor />
      </div>
      <div key="recentlyImported">
        <RecentlyImported />
      </div>
      <div key="shokoNews">
        <ShokoNews />
      </div>
      <div key="importFolders">
        <ImportFolders />
      </div>
      <div key="importBreakdown">
        <ImportBreakdown />
      </div>
      <div key="continueWatching">
        <ContinueWatching />
      </div>
      <div key="upcomingAnime">
        <UpcomingAnime />
      </div>
    </ResponsiveGridLayout>
  );
}

export default DashboardPage;
