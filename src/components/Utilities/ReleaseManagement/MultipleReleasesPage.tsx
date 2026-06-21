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

  const [defaultSelected, setDefaultSelected] = useState(true);
  const [exceptions, setExceptions] = useImmer<Set<number>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);
  const searchQuery = searchParams.get('search') ?? '';
  const [autoDeleteMode, setAutoDeleteMode] = useState(false);
  const onlyWithRedundant = autoDeleteMode;
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
    setExceptions((draft) => {
      if (draft.has(seriesId)) draft.delete(seriesId);
      else draft.add(seriesId);
    });
  };

  const handleToggleAutoDelete = () => {
    if (!autoDeleteMode) {
      setDefaultSelected(true);
      setExceptions(new Set());
    }
    setAutoDeleteMode(prev => !prev);
  };

  const allDeselected = !defaultSelected && exceptions.size === 0;

  const handleSelectDeselectAll = () => {
    if (allDeselected) {
      setDefaultSelected(true);
    } else {
      setDefaultSelected(false);
    }
    setExceptions(new Set());
  };

  const includedForPreview = !defaultSelected ? [...exceptions] : undefined;
  const excludedForPreview = defaultSelected ? [...exceptions] : undefined;

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
              {autoDeleteMode
                ? (
                  <Button buttonType="secondary" className="px-5 py-3" onClick={handleToggleAutoDelete}>
                    Cancel
                  </Button>
                )
                : (
                  <Button
                    buttonType="primary"
                    className="flex items-center gap-x-2.5 px-4 py-3 font-semibold"
                    disabled={seriesCount === 0}
                    onClick={handleToggleAutoDelete}
                  >
                    <Icon path={mdiTrashCanOutline} size={0.8333} />
                    Auto Delete
                  </Button>
                )}
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
                    disabled={allDeselected}
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
            autoDeleteMode={autoDeleteMode}
            defaultSelected={defaultSelected}
            exceptions={exceptions}
            setExceptions={setExceptions}
            search={searchQuery}
            onSeriesDetailOpen={handleDetailOpen}
            onRowSelect={handleRowSelect}
            onSeriesCountChange={setSeriesCount}
          />
        </div>
      </div>

      <MultipleReleasesPreviewModal
        open={previewOpen}
        includedSeriesIDs={includedForPreview}
        excludedSeriesIDs={excludedForPreview}
        onlyFinishedSeries={onlyFinishedSeries}
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
