import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiMagnify, mdiPlayCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useRefreshSeriesAniDBInfoMutation } from '@/core/react-query/series/mutations';

import type { TagType } from '@/core/types/api/tags';

type Props = {
  search: string;
  tagSourceFilter: Set<string>;
  showSpoilers: boolean;
  seriesId: number;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleSort: () => void;
  sort: boolean;
};
const TagsSearchAndFilterPanel = React.memo(
  ({ handleInputChange, search, seriesId, showSpoilers, sort, tagSourceFilter, toggleSort }: Props) => {
    const { t } = useTranslation('series');
    const { isPending: anidbRefreshPending, mutate: refreshAnidb } = useRefreshSeriesAniDBInfoMutation(seriesId);
    const refreshAnidbCallback = useCallback(() => {
      refreshAnidb({ force: true });
    }, [refreshAnidb]);

    const searchInput = useMemo(() => (
      <Input
        id="search"
        label={t('panels.tags.searchLabel')}
        startIcon={mdiMagnify}
        type="text"
        placeholder={t('panels.tags.searchPlaceholder')}
        value={search}
        onChange={handleInputChange}
      />
    ), [handleInputChange, search, t]);
    const tagSources = useMemo(() => (
      <div className="flex flex-col gap-y-2">
        <div className="text-base font-bold">{t('panels.tags.tagSourceTitle')}</div>
        <div className="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6">
          {['AniDB', 'User'].map((tagSource: TagType['Source']) => (
            <Checkbox
              justify
              label={tagSource === 'AniDB' ? t('panels.tags.tagSources.anidb') : t('panels.tags.tagSources.user')}
              key={tagSource}
              id={tagSource}
              isChecked={!tagSourceFilter.has(tagSource)}
              onChange={handleInputChange}
            />
          ))}
        </div>
      </div>
    ), [handleInputChange, tagSourceFilter, t]);
    const spoilers = useMemo(() => (
      <div className="flex flex-col gap-x-2">
        <div className="text-base font-bold">{t('panels.tags.displayTitle')}</div>
        <Checkbox
          id="show-spoilers"
          label={t('panels.tags.showSpoilers')}
          isChecked={showSpoilers}
          onChange={handleInputChange}
          justify
        />
      </div>
    ), [handleInputChange, showSpoilers, t]);
    const sortAction = useMemo(() => (
      <button
        type="button"
        className="flex w-full flex-row justify-between"
        onClick={toggleSort}
      >
        {t('panels.tags.changeSortPrefix')}
        {sort ? t('panels.tags.sortWeight') : t('panels.tags.sortAlphabetical')}
        <Icon
          path={mdiPlayCircleOutline}
          className="pointer-events-auto text-panel-icon-action"
          size={1}
        />
      </button>
    ), [sort, toggleSort, t]);
    const forceRefreshAnidbData = useMemo(() => (
      <button
        type="button"
        className="flex w-full flex-row justify-between disabled:cursor-not-allowed disabled:opacity-65"
        onClick={refreshAnidbCallback}
        disabled={anidbRefreshPending}
      >
        {t('panels.tags.forceRefresh')}
        <Icon
          path={mdiPlayCircleOutline}
          className="pointer-events-auto text-panel-icon-action group-disabled:cursor-not-allowed"
          size={1}
        />
      </button>
    ), [anidbRefreshPending, refreshAnidbCallback, t]);
    return (
      <div className="flex w-100 shrink-0 flex-col gap-y-6">
        <ShokoPanel
          title={t('panels.searchAndFilter')}
          className="w-full"
          contentClassName="gap-y-6"
          fullHeight={false}
          sticky
          transparent
        >
          {searchInput}
          {tagSources}
          {spoilers}
          <div className="flex flex-col gap-2">
            <div className="text-base font-bold">{t('panels.tags.quickActions')}</div>
            {sortAction}
            {forceRefreshAnidbData}
          </div>
        </ShokoPanel>
      </div>
    );
  },
);

export default TagsSearchAndFilterPanel;
