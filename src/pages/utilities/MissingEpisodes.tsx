import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'react-router';
import { mdiEyeOffOutline, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useIsFetching } from '@tanstack/react-query';
import { map } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitySeriesList from '@/components/Utilities/UtilitySeriesList';
import { useHideEpisodeMutation } from '@/core/react-query/episode/mutations';
import { resetQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';

import type { EpisodeType } from '@/core/types/api/episode';

const MissingEpisodes = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const isSeriesQueryFetching = useIsFetching({ queryKey: ['release-management', 'series'] }) > 0;

  const [seriesCount, setSeriesCount] = useState(0);
  const [selectedEpisodes, setSelectedEpisodes] = useState<EpisodeType[]>([]);

  const handleRefresh = () => {
    if (isSeriesQueryFetching) return;
    resetQueries(['release-management', 'series']);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  const onlyCollecting = searchParams.get('onlyCollecting') === 'true';
  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      newParams.set(event.target.id, String(event.target.checked));
      return newParams;
    });
  };

  const [hidePending, setHidePending] = useState(false);

  const { mutateAsync: hideEpisode } = useHideEpisodeMutation();

  const hideEpisodes = () => {
    setHidePending(true);

    const operations = map(selectedEpisodes, episode => hideEpisode({ episodeId: episode.IDs.ID, hidden: true }));

    Promise.all(operations)
      .then(() => toast.success('Successful!'))
      .catch(() => toast.error('One or more operations failed!'))
      .finally(() => {
        setHidePending(false);
        resetQueries(['release-management']);
        setSelectedEpisodes([]);
      });
  };

  return (
    <>
      <title>Missing Episodes | Shoko</title>
      <div className="flex grow flex-col gap-y-6 overflow-y-auto">
        <ShokoPanel title="Missing Episodes" options={<ItemCount count={seriesCount} suffix="Series" />}>
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
                id="onlyCollecting"
                isChecked={onlyCollecting}
                onChange={handleFilterChange}
                label="Only Collecting"
                labelRight
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
              buttonType="primary"
              className="flex gap-x-2.5 px-4 py-3 font-semibold"
              onClick={hideEpisodes}
              loading={hidePending}
            >
              <Icon path={mdiEyeOffOutline} size={0.8333} />
              Hide
            </Button>
          </div>
        </ShokoPanel>

        <UtilitySeriesList
          type="MissingEpisodes"
          setSelectedEpisodes={setSelectedEpisodes}
          setSeriesCount={setSeriesCount}
        />
      </div>
    </>
  );
};

export default MissingEpisodes;
