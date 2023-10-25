import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { mdiCogOutline, mdiFilterMenuOutline, mdiFilterOutline, mdiFormatListText, mdiViewGridOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { cloneDeep } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import CollectionTitle from '@/components/Collection/CollectionTitle';
import CollectionView from '@/components/Collection/CollectionView';
import DisplaySettingsModal from '@/components/Collection/DisplaySettingsModal';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import { useGetFilterQuery, useGetGroupQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { SeriesTypeEnum } from '@/core/types/api/series';
import { dayjs } from '@/core/util';
import useMainPoster from '@/hooks/useMainPoster';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { SeriesType } from '@/core/types/api/series';

const OptionButton = ({ icon, onClick }) => (
  <div
    className="cursor-pointer rounded border border-panel-border bg-button-secondary px-5 py-2 drop-shadow-md"
    onClick={onClick}
  >
    <Icon path={icon} size={1} />
  </div>
);

const TimelineItem = ({ series }: { series: SeriesType }) => {
  const mainPoster = useMainPoster(series);
  const seriesType = series.AniDB?.Type === SeriesTypeEnum.TVSpecial
    ? 'TV Special'
    : series.AniDB?.Type;

  return (
    <Link to={`/webui/collection/series/${series.IDs.ID}`}>
      <div className="flex gap-x-4" key={series.IDs.ID}>
        <BackgroundImagePlaceholderDiv
          image={mainPoster}
          className="h-20 w-[3.4375rem] shrink-0 rounded-lg border border-panel-border drop-shadow-md"
        />
        <div className="flex flex-col font-semibold">
          <div className="flex gap-y-2">
            {dayjs(series.AniDB?.AirDate).year()}
            &nbsp;|&nbsp;
            <div className="text-panel-text-important">{seriesType}</div>
          </div>
          <div className="line-clamp-2">{series.Name}</div>
        </div>
      </div>
    </Link>
  );
};

const TimelineSidebar = ({ series }: { series: SeriesType[] }) => (
  <div className="flex min-h-full overflow-hidden transition-all">
    <div className="ml-8 flex w-[26.125rem] grow flex-col gap-y-8 rounded border border-panel-border bg-panel-background p-8">
      <div className="text-xl font-semibold">Timeline</div>
      <div className="flex flex-col gap-y-4">
        {series.map(item => <TimelineItem series={item} key={item.IDs.ID} />)}
      </div>
    </div>
  </div>
);

function Collection() {
  const { filterId, groupId } = useParams();

  const filterData = useGetFilterQuery({ filterId }, { skip: !filterId });
  const groupData = useGetGroupQuery({ groupId: groupId! }, { skip: !groupId });
  const subsectionName = groupId ? groupData?.data?.Name : filterData?.data?.Name;

  const settingsQuery = useGetSettingsQuery();
  const settings = useMemo(() => settingsQuery?.data ?? initialSettings, [settingsQuery]);
  const viewSetting = settings.WebUI_Settings.collection.view;
  const [patchSettings] = usePatchSettingsMutation();

  const [mode, setMode] = useState<'poster' | 'list'>('poster');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDisplaySettingsModal, setShowDisplaySettingsModal] = useState(false);
  const [groupTotal, setGroupTotal] = useState(0);
  const [timelineSeries, setTimelineSeries] = useState<SeriesType[]>([]);

  useEffect(() => {
    setMode(viewSetting);
  }, [viewSetting]);

  const toggleMode = async () => {
    const newMode = mode === 'list' ? 'poster' : 'list';
    // Optimistically update view mode to reduce lag without waiting for settings refetch.
    setMode(newMode);
    const newSettings = cloneDeep(settings);
    newSettings.WebUI_Settings.collection.view = newMode;
    patchSettings({ oldSettings: settings, newSettings }).catch(console.error);
  };

  const toggleFilters = () => {
    setShowFilterSidebar(!showFilterSidebar);
  };

  return (
    <>
      <div className="flex grow flex-col gap-y-8">
        <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background p-8">
          <CollectionTitle count={groupTotal} filterOrGroup={subsectionName} />
          <div className="flex gap-x-2">
            {!groupId && (
              <>
                <OptionButton onClick={() => setShowFilterModal(true)} icon={mdiFilterMenuOutline} />
                <OptionButton onClick={toggleFilters} icon={mdiFilterOutline} />
              </>
            )}
            <OptionButton onClick={toggleMode} icon={mode === 'poster' ? mdiFormatListText : mdiViewGridOutline} />
            <OptionButton onClick={() => setShowDisplaySettingsModal(true)} icon={mdiCogOutline} />
          </div>
        </div>
        <div className="flex grow">
          <CollectionView
            mode={mode}
            setGroupTotal={setGroupTotal}
            setTimelineSeries={setTimelineSeries}
            isSidebarOpen={showFilterSidebar}
          />
          <div
            className={cx(
              'flex items-start overflow-hidden transition-all',
              (!groupId && showFilterSidebar) ? 'w-[26.125rem] opacity-100' : 'w-0 opacity-0',
            )}
          >
            <div className="ml-8 line-clamp-1 flex grow items-center justify-center rounded border border-panel-border bg-panel-background p-8">
              Filter sidebar
            </div>
          </div>
          {groupId && <TimelineSidebar series={timelineSeries} />}
        </div>
      </div>
      <FiltersModal show={showFilterModal} onClose={() => setShowFilterModal(false)} />
      <DisplaySettingsModal show={showDisplaySettingsModal} onClose={() => setShowDisplaySettingsModal(false)} />
    </>
  );
}

export default Collection;
