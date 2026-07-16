import React, { useEffect, useState } from 'react';
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

import ReleaseManagementSettingsModal from '@/components/Dialogs/ReleaseManagementSettingsModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { resetQueries } from '@/core/react-query/queryClient';

import { useDebounceValue, useToggle } from 'usehooks-ts';
import { useMultipleReleaseSeriesQuery } from '@/core/react-query/release-management/queries';
import MultipleReleasesSeriesList from '@/components/Utilities/ReleaseManagement/MultipleReleasesSeriesList';
import MultipleReleasesPreviewModal from '@/components/Utilities/ReleaseManagement/MultipleReleasesPreviewModal';

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

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set(event.target.id, String(event.target.checked));
      return newParams;
    });
  };

  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';
  // ignoreVariations should be true by default
  const ignoreVariations = (searchParams.get('ignoreVariations') ?? 'true') === 'true';

  const [showSettingsModal, toggleSettingsModal] = useToggle(false);
  const [showPreviewModal, togglePreviewModal] = useToggle(false);
  const [autoDeleteMode, toggleAutoDeleteMode] = useToggle(false);
  const [allSelected, toggleAllSelected] = useToggle(true);
  const [selectedSeries, setSelectedSeries] = useState<number[]>([]);

  const seriesQuery = useMultipleReleaseSeriesQuery({
    onlyFinishedSeries,
    onlyWithRedundant: autoDeleteMode,
    includeVariations: !ignoreVariations,
    search: searchParams.get('search') ?? undefined,
    pageSize: 25,
  });
  const seriesCount = seriesQuery.data?.pages[0].Total ?? 0;
  const selectedCount = allSelected ? (seriesCount - selectedSeries.length) : selectedSeries.length;

  const handleRefresh = () => {
    if (seriesQuery.isFetching) return;
    resetQueries(['release-management', 'multiple-releases']);
  };

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
                loading={seriesQuery.isFetching}
                keybinding="R"
              />

              <Checkbox
                id="ignoreVariations"
                isChecked={ignoreVariations}
                onChange={handleFilterChange}
                label="Ignore Variations"
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

        <MultipleReleasesSeriesList
          allSelected={allSelected}
          autoDeleteMode={autoDeleteMode}
          onlyFinishedSeries={onlyFinishedSeries}
          setSelectedSeries={setSelectedSeries}
        />
      </div>

      <MultipleReleasesPreviewModal
        open={showPreviewModal}
        onClose={togglePreviewModal}
        allSelected={allSelected}
        selectedSeries={selectedSeries}
        onlyFinishedSeries={onlyFinishedSeries}
      />

      <ReleaseManagementSettingsModal
        show={showSettingsModal}
        onClose={toggleSettingsModal}
      />
    </>
  );
};

export default ReleaseManagement;
