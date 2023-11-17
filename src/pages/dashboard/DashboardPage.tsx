import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDispatch, useSelector } from 'react-redux';
import { mdiMenuDown } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { setLayoutEditMode } from '@/core/slices/mainpage';
import { initialSettings } from '@/pages/settings/SettingsPage';

import CollectionStats from './panels/CollectionStats';
import ContinueWatching from './panels/ContinueWatching';
import ImportFolders from './panels/ImportFolders';
import MediaType from './panels/MediaType';
import NextUp from './panels/NextUp';
import QueueProcessor from './panels/QueueProcessor';
import RecentlyImported from './panels/RecentlyImported';
import RecommendedAnime from './panels/RecommendedAnime';
import ShokoNews from './panels/ShokoNews';
import UnrecognizedFiles from './panels/UnrecognizedFiles';
import UpcomingAnime from './panels/UpcomingAnime';

import type { RootState } from '@/core/store';

const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardPage() {
  const dispatch = useDispatch();

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const settingsQuery = useGetSettingsQuery();
  const settings = useMemo(() => settingsQuery.data ?? initialSettings, [settingsQuery]);
  const [patchSettings] = usePatchSettingsMutation();

  const {
    hideCollectionBreakdown,
    hideImportFolders,
    hideQueueProcessor,
    hideRecentlyImported,
    hideShokoNews,
  } = settings.WebUI_Settings.dashboard;

  const [currentLayout, setCurrentLayout] = useState(
    settings.WebUI_Settings.layout.dashboard ?? initialSettings.WebUI_Settings.layout.dashboard,
  );

  useEffect(() => {
    const layout = settings.WebUI_Settings.layout ?? initialSettings.WebUI_Settings.layout;
    if (settingsQuery.isSuccess) setCurrentLayout(layout.dashboard);
  }, [settings, settingsQuery.isSuccess]);

  const cancelLayoutChange = useCallback(() => {
    const layout = settings.WebUI_Settings.layout ?? initialSettings.WebUI_Settings.layout;
    setCurrentLayout(layout.dashboard);
    dispatch(setLayoutEditMode(false));
    toast.dismiss('layoutEditMode');
  }, [settings, dispatch]);

  const saveLayout = useCallback(() => {
    const newSettings = JSON.parse(JSON.stringify(settings)); // If the settings object is copied, it's copying the property descriptors and the properties become read-only. Not sure how to bypass except doing this.
    newSettings.WebUI_Settings.layout.dashboard = currentLayout;
    patchSettings({ oldSettings: settings, newSettings }).unwrap().then(() => {
      dispatch(setLayoutEditMode(false));
      toast.dismiss('layoutEditMode');
      toast.success('Layout Saved!');
    }, (error) => {
      toast.error('', error.data);
    });
  }, [currentLayout, dispatch, patchSettings, settings]);

  useEffect(() => {
    if (layoutEditMode) {
      const renderToast = () => (
        <div className="flex flex-col">
          Edit Mode Enabled
          <div className="mt-3 flex items-center justify-end gap-x-3 font-semibold">
            <Button onClick={() => cancelLayoutChange()} buttonType="secondary" className="px-3 py-1.5">Cancel</Button>
            <Button onClick={() => saveLayout()} buttonType="primary" className="px-3 py-1.5">Save</Button>
          </div>
        </div>
      );

      if (!toast.isActive('layoutEditMode')) {
        toast.info('', renderToast(), {
          autoClose: false,
          draggable: false,
          closeOnClick: false,
          toastId: 'layoutEditMode',
          className: 'max-w-[17rem] ml-auto',
        });
      } else {
        toast.infoUpdate('layoutEditMode', '', renderToast());
      }
    } else {
      toast.dismiss('layoutEditMode');
    }
  }, [layoutEditMode, currentLayout, cancelLayoutChange, saveLayout]);

  const renderResizeHandle = () => (
    <div className="react-resizable-handle bottom-0 right-0 cursor-nwse-resize">
      <Icon path={mdiMenuDown} size={1.5} className="text-panel-text-primary" rotate={-45} />
    </div>
  );

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [currentLayout]);

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
      containerPadding={[0, 0]}
    >
      {!hideQueueProcessor && (
        <div key="queueProcessor">
          <QueueProcessor />
        </div>
      )}
      <div key="importBreakdown">
        <UnrecognizedFiles />
      </div>
      {!hideRecentlyImported && (
        <div key="recentlyImported">
          <RecentlyImported />
        </div>
      )}
      {!hideCollectionBreakdown && (
        <div key="collectionBreakdown">
          <CollectionStats />
        </div>
      )}
      <div key="collectionTypeBreakdown">
        <MediaType />
      </div>
      {!hideImportFolders && (
        <div key="importFolders">
          <ImportFolders />
        </div>
      )}
      {!hideShokoNews && (
        <div key="shokoNews">
          <ShokoNews />
        </div>
      )}
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
