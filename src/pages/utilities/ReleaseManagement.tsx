import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'react-router';
import {
  mdiCheckboxMarkedCircleOutline,
  mdiCloseCircleOutline,
  mdiCog,
  mdiMagnify,
  mdiRefresh,
  mdiTrashCanOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { useIsFetching } from '@tanstack/react-query';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import ReleaseManagementSettingsModal from '@/components/Dialogs/ReleaseManagementSettingsModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import ReleaseManagementPreviewModal from '@/components/Utilities/ReleaseManagement/ReleaseManagementPreviewModal';
import ReleaseManagementSeriesList from '@/components/Utilities/ReleaseManagement/ReleaseManagementSeriesList';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { resetQueries } from '@/core/react-query/queryClient';

const ReleaseManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 250);

  useEffect(() => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      if (debouncedSearch) newParams.set('search', debouncedSearch);
      else newParams.delete('search');
      return newParams;
    });
  }, [debouncedSearch, setSearchParams]);

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set(event.target.id, String(event.target.checked));
      return newParams;
    });
  };

  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';
  const includeVariations = searchParams.get('includeVariations') === 'true';

  const [showSettingsModal, toggleSettingsModal] = useToggle(false);
  const [showPreviewModal, togglePreviewModal] = useToggle(false);
  const [autoDeleteMode, toggleAutoDeleteMode] = useToggle(false);
  const [allSelected, toggleAllSelected] = useToggle(true);
  const [selectedSeries, setSelectedSeries] = useState<number[]>([]);

  const isSeriesQueryFetching = useIsFetching({ queryKey: ['release-management', 'series'] }) > 0;
  const [seriesCount, setSeriesCount] = useState(0);
  const selectedCount = allSelected ? (seriesCount - selectedSeries.length) : selectedSeries.length;

  const handleRefresh = () => {
    if (isSeriesQueryFetching) return;
    resetQueries(['release-management']);
  };
  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  return (
    <>
      <title>Multiple Releases | Shoko</title>
      <div className="flex grow flex-col gap-y-6 overflow-y-auto">
        <ShokoPanel
          title="Release Management"
          options={<ItemCount count={seriesCount} suffix="Series" selected={autoDeleteMode ? selectedCount : 0} />}
        >
          <div className="flex items-center gap-x-3">
            <Input
              type="text"
              placeholder="Search..."
              startIcon={mdiMagnify}
              id="search"
              onChange={event => setSearch(event.target.value)}
              value={search}
              inputClassName="px-4 py-3"
            />

            <div className="flex grow items-center gap-x-4 rounded-md border border-panel-border bg-panel-background-alt px-4 py-2">
              <MenuButton
                onClick={handleRefresh}
                icon={mdiRefresh}
                name="Refresh"
                loading={isSeriesQueryFetching}
                keybinding="R"
              />

              <Checkbox
                id="includeVariations"
                isChecked={includeVariations}
                onChange={handleFilterChange}
                label="Include Variations"
                labelRight
              />

              <Checkbox
                id="onlyFinishedSeries"
                isChecked={onlyFinishedSeries}
                onChange={handleFilterChange}
                label="Only Finished Series"
                labelRight
              />

              {autoDeleteMode && (
                <MenuButton
                  onClick={toggleAllSelected}
                  icon={allSelected ? mdiCloseCircleOutline : mdiCheckboxMarkedCircleOutline}
                  name={allSelected ? 'Unselect All' : 'Select All'}
                  highlightType="primary"
                />
              )}
            </div>

            <Button
              buttonType={autoDeleteMode ? 'secondary' : 'primary'}
              className="flex items-center gap-x-2.5 px-4 py-3 font-semibold"
              disabled={autoDeleteMode && seriesCount === 0}
              onClick={toggleAutoDeleteMode}
            >
              {autoDeleteMode ? 'Cancel' : (
                <>
                  <Icon path={mdiTrashCanOutline} size={0.8333} />
                  Auto Delete
                </>
              )}
            </Button>

            <Button
              buttonType="secondary"
              className="p-3"
              onClick={toggleSettingsModal}
              tooltip="Settings"
            >
              <Icon path={mdiCog} size={0.8333} />
            </Button>

            {autoDeleteMode && (
              <Button
                buttonType="danger"
                className="flex items-center gap-x-2.5 px-4 py-3 font-semibold whitespace-nowrap"
                disabled={selectedCount === 0}
                onClick={togglePreviewModal}
              >
                <Icon path={mdiTrashCanOutline} size={0.8333} />
                Delete
              </Button>
            )}
          </div>
        </ShokoPanel>

        <ReleaseManagementSeriesList
          allSelected={allSelected}
          autoDeleteMode={autoDeleteMode}
          setSelectedSeries={setSelectedSeries}
          setSeriesCount={setSeriesCount}
        />
      </div>

      <ReleaseManagementPreviewModal
        show={showPreviewModal}
        onClose={togglePreviewModal}
        allSelected={allSelected}
        selectedSeries={selectedSeries}
      />

      <ReleaseManagementSettingsModal
        show={showSettingsModal}
        onClose={toggleSettingsModal}
      />
    </>
  );
};

export default ReleaseManagement;
