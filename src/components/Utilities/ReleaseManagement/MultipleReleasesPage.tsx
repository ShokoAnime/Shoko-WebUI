import React, { useState } from 'react';
import { useSearchParams } from 'react-router';
import { mdiCog, mdiMagnify, mdiRefresh, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useIsFetching } from '@tanstack/react-query';
import cx from 'classnames';
import { useImmer } from 'use-immer';

import ReleaseManagementSettingsModal from '@/components/Dialogs/ReleaseManagementSettingsModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import Title from '@/components/Utilities/ReleaseManagement/Title';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { resetQueries } from '@/core/react-query/queryClient';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import MultipleReleasesPreviewModal from './MultipleReleasesPreviewModal';
import MultipleReleasesSeriesList from './MultipleReleasesSeriesList';

const MultipleReleasesPage = () => {
  const navigate = useNavigateVoid();
  const [searchParams, setSearchParams] = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set(event.target.id, String(event.target.checked));
      return newParams;
    });
  };

  const isSeriesQueryFetching = useIsFetching({ queryKey: ['release-management', 'multiple-releases'] }) > 0;

  const [rowSelection, setRowSelection] = useImmer<Record<number, boolean>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const searchQuery = searchParams.get('search') ?? '';
  const [autoDeleteMode, setAutoDeleteMode] = useState(false);
  const onlyWithRedundant = autoDeleteMode;
  const [allSeriesIds, setAllSeriesIds] = useState<number[]>([]);
  const [seriesCount, setSeriesCount] = useState(0);

  const handleRefresh = () => {
    if (isSeriesQueryFetching) return;
    resetQueries(['release-management', 'multiple-releases']);
  };

  const handleDetailOpen = (seriesId: number) => {
    navigate(
      `/webui/utilities/release-management/MultipleReleases/${seriesId}`,
      { state: { listSearch: searchParams.toString() } },
    );
  };

  const handleRowSelect = (seriesId: number) => {
    setRowSelection((draft) => {
      draft[seriesId] = !(draft[seriesId] ?? true);
    });
  };

  const handleToggleAutoDelete = () => {
    if (!autoDeleteMode) {
      setRowSelection(Object.fromEntries(allSeriesIds.map(id => [id, true])));
    }
    setAutoDeleteMode(prev => !prev);
  };

  const allDeselected = allSeriesIds.length > 0 && allSeriesIds.every(id => !rowSelection[id]);

  const handleSelectDeselectAll = () => {
    if (allDeselected) {
      setRowSelection(Object.fromEntries(allSeriesIds.map(id => [id, true])));
    } else {
      setRowSelection(Object.fromEntries(allSeriesIds.map(id => [id, false])));
    }
  };

  const isFiltered = !!searchQuery || onlyFinishedSeries || onlyWithRedundant;
  const includedForPreview = isFiltered ? allSeriesIds.filter(id => rowSelection[id]) : undefined;
  const excludedForPreview = !isFiltered ? allSeriesIds.filter(id => !rowSelection[id]) : undefined;

  return (
    <>
      <title>Multiple Releases | Shoko</title>
      <div className="flex grow flex-col gap-y-6 overflow-y-auto">
        <ShokoPanel title={<Title />} options={<ItemCount count={seriesCount} suffix="Series" />}>
          <div className="flex items-center gap-x-3">
            <Input
              id="series-search"
              type="text"
              placeholder="Search series..."
              startIcon={mdiMagnify}
              value={searchQuery}
              onChange={(event) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (event.target.value) next.set('search', event.target.value);
                  else next.delete('search');
                  return next;
                });
              }}
            />
            <div className="relative box-border flex grow items-center gap-x-4 rounded-md border border-panel-border bg-panel-background-alt px-4 py-2">
              <MenuButton
                onClick={handleRefresh}
                icon={mdiRefresh}
                name="Refresh"
                loading={isSeriesQueryFetching}
                keybinding="R"
              />

              <Checkbox
                id="onlyFinishedSeries"
                isChecked={onlyFinishedSeries}
                onChange={handleFilterChange}
                label="Only Finished Series"
                labelRight
              />
            </div>

            <div className="flex items-center gap-x-2">
              <Button
                buttonType={autoDeleteMode ? 'secondary' : 'primary'}
                className="flex items-center gap-x-2.5 px-4 py-3 font-semibold"
                disabled={seriesCount === 0}
                onClick={handleToggleAutoDelete}
              >
                <Icon path={mdiTrashCanOutline} size={0.8333} />
                Auto Delete
              </Button>
              <Button
                buttonType="secondary"
                className="p-3"
                onClick={() => setSettingsOpen(true)}
                tooltip="Configure release management settings"
              >
                <Icon path={mdiCog} size={0.8333} />
              </Button>
              <div
                className={cx(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  autoDeleteMode ? 'max-w-88 opacity-100' : 'max-w-0 opacity-0',
                )}
              >
                <div className="ml-3 flex items-center gap-x-3">
                  <Button
                    buttonType="secondary"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                    onClick={handleSelectDeselectAll}
                  >
                    {allDeselected ? 'Select All' : 'Deselect All'}
                  </Button>
                  <Button
                    buttonType="danger"
                    className="flex items-center gap-x-2.5 px-4 py-3 font-semibold whitespace-nowrap"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Icon path={mdiTrashCanOutline} size={0.8333} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ShokoPanel>

        <div className="flex grow flex-col overflow-y-auto rounded-md border border-panel-border bg-panel-background p-6">
          <MultipleReleasesSeriesList
            onlyFinishedSeries={onlyFinishedSeries}
            onlyWithRedundant={onlyWithRedundant}
            activeSeriesId={0}
            autoDeleteMode={autoDeleteMode}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            search={searchQuery}
            onSeriesDetailOpen={handleDetailOpen}
            onRowSelect={handleRowSelect}
            onSeriesCountChange={setSeriesCount}
            onSeriesIdsChange={setAllSeriesIds}
          />
        </div>
      </div>

      <MultipleReleasesPreviewModal
        open={previewOpen}
        includedSeriesIDs={includedForPreview}
        excludedSeriesIDs={excludedForPreview}
        overrides={new Map()}
        onClose={() => setPreviewOpen(false)}
      />

      <ReleaseManagementSettingsModal
        show={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default MultipleReleasesPage;
