import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { forEach, isEqual, isUndefined } from 'lodash';
import { omitDeepBy } from '../../core/util';

import { RootState } from '../../core/store';
import { defaultLayout } from '../../core/slices/webuiSettings';
import Events from '../../core/events';
import QuickActions from './panels/QuickActions';

const ResponsiveGridLayout = WidthProvider(Responsive);

const actions = {
  anidb: {
    title: 'AniDB',
    data: [
      'download-missing-anidb-data',
      'sync-votes',
      'sync-mylist',
      'update-all-anidb-info',
    ],
  },
  trakt: {
    title: 'Trakt',
    data: [
      'sync-trakt',
      'update-all-trakt-info',
    ],
  },
  tvdb: {
    title: 'The TvDB',
    data: [
      'regen-tvdb-links',
      'update-all-tvdb-info',
    ],
  },
  moviedb: {
    title: 'The MovieDB',
    data: [
      'update-all-moviedb-info',
    ],
  },
  shoko: {
    title: 'Shoko',
    data: [
      'avdump-mismatched-files',
      'recreate-all-groups',
      'sync-hashes',
      'update-all-mediainfo',
      'update-series-stats',
    ],
  },
  images: {
    title: 'Images',
    data: [
      'update-all-images',
      'validate-all-images',
    ],
  },
  plex: {
    title: 'Plex',
    data: [
      'plex-sync-all',
    ],
  },
  import: {
    title: 'Import',
    data: [
      'remove-missing-files-mylist',
      'remove-missing-files',
      'run-import',
    ],
  },
};

function ActionsPage() {
  const dispatch = useDispatch();

  const layout = useSelector((state: RootState) => state.webuiSettings.webui_v2.layout.actions);

  const [currentLayout, setCurrentLayout] = useState(defaultLayout.actions);

  useEffect(() => {
    setCurrentLayout(layout);
  }, []);

  const handleOnLayoutChange = (newLayout: ReactGridLayout.Layouts) => {
    if (!isEqual(currentLayout, omitDeepBy(newLayout, isUndefined))) {
      dispatch({
        type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
        payload: { actions: newLayout },
      });
    }
  };

  const renderPanel = (action: any, key: string) => (
    <div key={key}>
      <QuickActions actions={action.data} title={action.title} />
    </div>
  );

  const panels: Array<React.ReactNode> = [];

  forEach(actions, (action, key) => {
    panels.push(renderPanel(action, key));
  });

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
      {panels}
    </ResponsiveGridLayout>
  );
}

export default ActionsPage;
