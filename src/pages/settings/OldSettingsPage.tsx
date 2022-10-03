import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { isEqual, isUndefined } from 'lodash';
import { omitDeepBy } from '../../core/util';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { defaultLayout } from '../../core/slices/webuiSettings';

import AniDBSettings from './panels/AniDBSettings';
import AniDBLoginSettings from './panels/AniDBLoginSettings';
import GeneralSettings from './panels/GeneralSettings';
import ImportSettings from './panels/ImportSettings';
import LanguageSettings from './panels/LanguageSettings';
import MovieDBSettings from './panels/MovieDBSettings';
import PlexSettings from './panels/PlexSettings';
import RelationSettings from './panels/RelationSettings';
import TraktSettings from './panels/TraktSettings';
import TvDBSettings from './panels/TvDBSettings';

const ResponsiveGridLayout = WidthProvider(Responsive);

function OldSettingsPage() {
  const dispatch = useDispatch();

  const layout = useSelector((state: RootState) => state.webuiSettings.webui_v2.layout.settings);

  const [currentLayout, setCurrentLayout] = useState(defaultLayout.settings);

  const checkWebUIUpdate = () => dispatch({ type: Events.WEBUI_CHECK_UPDATES });

  useEffect(() => {
    setCurrentLayout(layout);
    checkWebUIUpdate();
  }, []);

  const handleOnLayoutChange = (newLayout: ReactGridLayout.Layouts) => {
    if (!isEqual(currentLayout, omitDeepBy(newLayout, isUndefined))) {
      dispatch({
        type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
        payload: { settings: newLayout },
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
      <div key="general">
        <GeneralSettings />
      </div>
      <div key="anidb">
        <AniDBSettings />
      </div>
      <div key="relation">
        <RelationSettings />
      </div>
      <div key="tvdb">
        <TvDBSettings />
      </div>
      <div key="moviedb">
        <MovieDBSettings />
      </div>
      <div key="anidb-login">
        <AniDBLoginSettings />
      </div>
      <div key="plex">
        <PlexSettings />
      </div>
      <div key="trakt">
        <TraktSettings />
      </div>
      <div key="language">
        <LanguageSettings />
      </div>
      <div key="import">
        <ImportSettings />
      </div>
    </ResponsiveGridLayout>
  );
}

export default OldSettingsPage;
