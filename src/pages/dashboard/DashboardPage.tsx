import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Icon } from '@mdi/react';
import { mdiMenuDown } from '@mdi/js';

import { RootState } from '../../core/store';
import toast from '../../components/Toast';
import CollectionBreakdown from './panels/CollectionBreakdown';
import ImportBreakdown from './panels/ImportBreakdown';
import SeriesBreakdown from './panels/SeriesBreakdown';
import QueueProcessor from './panels/QueueProcessor';
import ShokoNews from './panels/ShokoNews';
import RecentlyImported from './panels/RecentlyImported';
import ImportFolders from './panels/ImportFolders';
import ContinueWatching from './panels/ContinueWatching';
import NextUp from './panels/NextUp';
import UpcomingAnime from './panels/UpcomingAnime';
import RecommendedAnime from './panels/RecommendedAnime';
import Button from '../../components/Input/Button';

import { setLayoutEditMode } from '../../core/slices/mainpage';
import { useGetSettingsQuery, usePatchSettingsMutation } from '../../core/rtkQuery/splitV3Api/settingsApi';
import { initialSettings } from '../settings/SettingsPage';

const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardPage() {
  const dispatch = useDispatch();

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const settingsQuery = useGetSettingsQuery();
  const settings = settingsQuery.data ?? initialSettings;
  const layout = settings.WebUI_Settings.layout ?? initialSettings.WebUI_Settings.layout;
  const [patchSettings] = usePatchSettingsMutation();

  const [currentLayout, setCurrentLayout] = useState(initialSettings.WebUI_Settings.layout.dashboard);

  useEffect(() => {
    if (settingsQuery.isSuccess) setCurrentLayout(layout.dashboard);
  }, [settingsQuery.data]);

  const cancelLayoutChange = () => {
    setCurrentLayout(layout.dashboard);
    dispatch(setLayoutEditMode(false));
    toast.dismiss('layoutEditMode');
  };

  const saveLayout = () => {
    const newSettings = JSON.parse(JSON.stringify(settings)); // If the settings object is copied, it's copying the property descriptors and the properties become read-only. Not sure how to bypass except doing this.
    newSettings.WebUI_Settings.layout.dashboard = currentLayout;
    patchSettings({ oldSettings: settings, newSettings }).unwrap().then(() => {
      dispatch(setLayoutEditMode(false));
      toast.dismiss('layoutEditMode');
      toast.success('Layout Saved!');
    }, (error) => {
      toast.error('', error.data);
    });
  };

  useEffect(() => {
    if (layoutEditMode) {
      const renderToast = () => (
        <div className="flex flex-col">
          Edit Mode Enabled
          <div className="flex items-center justify-end mt-3">
            <Button onClick={() => cancelLayoutChange()} className="bg-background-alt px-3 py-1.5 mr-3">Cancel</Button>
            <Button onClick={() => saveLayout()} className="bg-highlight-1 px-3 py-1.5">Save</Button>
          </div>
        </div>
      );

      if (!toast.isActive('layoutEditMode')) {
        toast.info('', renderToast(), {
          autoClose: false,
          draggable: false,
          closeOnClick: false,
          toastId: 'layoutEditMode',
          className: 'w-56 ml-auto',
        });
      } else {
        toast.infoUpdate('layoutEditMode', '', renderToast());
      }
    } else {
      toast.dismiss('layoutEditMode');
    }
  }, [layoutEditMode, currentLayout]);

  const renderResizeHandle = () => (
    <div className="react-resizable-handle right-0 bottom-0 cursor-nwse-resize">
      <Icon path={mdiMenuDown} size={1.5} className="text-highlight-1" rotate={-45}/>
    </div>
  );

  return (
    <ResponsiveGridLayout
      layouts={currentLayout}
      breakpoints={{ lg: 1024, md: 768, sm: 640 }} // These match tailwind breakpoints (for consistency)
      cols={{ lg: 12, md: 10, sm: 6 }}
      rowHeight={0}
      margin={[32, 32]}
      className="w-full"
      onLayoutChange={(_layout, layouts) => setCurrentLayout(layouts)}
      isDraggable={layoutEditMode}
      isResizable={layoutEditMode}
      resizeHandle={renderResizeHandle()}
    >
      <div key="queueProcessor">
        <QueueProcessor />
      </div>
      <div key="importBreakdown">
        <ImportBreakdown />
      </div>
      <div key="recentlyImported">
        <RecentlyImported />
      </div>
      <div key="collectionBreakdown">
        <CollectionBreakdown />
      </div>
      <div key="collectionTypeBreakdown">
        <SeriesBreakdown />
      </div>
      <div key="importFolders">
        <ImportFolders />
      </div>
      <div key="shokoNews">
        <ShokoNews />
      </div>
      <div key="continueWatching">
        <ContinueWatching />
      </div>
      <div key="nextUp">
        <NextUp />
      </div>
      <div key="upcomingAnime">
        <UpcomingAnime />
      </div>
      <div key="recommendedAnime">
        <RecommendedAnime />
      </div>
    </ResponsiveGridLayout>
  );
}

export default DashboardPage;
