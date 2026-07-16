import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'react-router';
import { mdiRefresh, mdiSelectMultiple } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useIsFetching } from '@tanstack/react-query';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import QuickSelectModal from '@/components/Utilities/LegacyReleaseManagement/QuickSelectModal';
import SeriesList from '@/components/Utilities/LegacyReleaseManagement/SeriesList';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { resetQueries } from '@/core/react-query/queryClient';

const DuplicateFiles = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const isSeriesQueryFetching = useIsFetching({ queryKey: ['release-management', 'series'] }) > 0;

  const [seriesCount, setSeriesCount] = useState(0);
  const [selectedSeries, setSelectedSeries] = useState(0);

  const handleRefresh = () => {
    if (isSeriesQueryFetching) return;
    resetQueries(['release-management', 'series']);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set(event.target.id, String(event.target.checked));
      return newParams;
    });
  };

  const [showQuickSelectModal, toggleShowQuickSelectModal] = useToggle(false);

  return (
    <>
      <title>Duplicate Files | Shoko</title>
      <div className="flex grow flex-col gap-y-6 overflow-y-auto">
        <ShokoPanel title="Duplicate Files" options={<ItemCount count={seriesCount} suffix="Series" />}>
          <div className="flex items-center gap-x-3">
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
            <Button
              buttonType="secondary"
              className="flex gap-x-2.5 px-4 py-3 font-semibold"
              disabled={!selectedSeries}
              onClick={toggleShowQuickSelectModal}
            >
              <Icon path={mdiSelectMultiple} size={0.8333} />
              Quick Select
            </Button>
          </div>
        </ShokoPanel>

        <SeriesList
          type="DuplicateFiles"
          setSelectedSeriesId={setSelectedSeries}
          setSeriesCount={setSeriesCount}
        />
      </div>

      <QuickSelectModal
        show={showQuickSelectModal}
        onClose={toggleShowQuickSelectModal}
        seriesId={selectedSeries}
      />
    </>
  );
};

export default DuplicateFiles;
