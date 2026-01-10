import React from 'react';
import { useTranslation } from 'react-i18next';
import { mdiInformationOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';

import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';

type Props = {
  type: string;
  availability: string;
  watched: string;
  hidden: string;
  search: string;
  unaired: string;
  hasUnaired: boolean;
  hasMissing: boolean;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

const EpisodeSearchAndFilterPanel = React.memo((props: Props) => {
  const { t } = useTranslation('series');
  const {
    availability,
    hasMissing,
    hasUnaired,
    hidden,
    onFilterChange,
    search,
    type,
    unaired,
    watched,
  } = props;

  return (
    <div className="flex flex-col gap-y-6">
      <ShokoPanel
        title={t('panels.searchAndFilter')}
        className="w-100"
        contentClassName="gap-y-6"
        fullHeight={false}
        sticky
        transparent
      >
        <Input
          inputClassName=""
          id="search"
          label={t('panels.episodes.searchLabel')}
          startIcon={mdiMagnify}
          type="text"
          placeholder={t('panels.episodes.searchPlaceholder')}
          value={search}
          onChange={onFilterChange}
        />

        <Select
          id="type"
          label={t('panels.episodes.typeLabel')}
          value={type}
          onChange={onFilterChange}
        >
          <option value="">{t('panels.episodes.type.all')}</option>
          <option value="Normal">{t('panels.episodes.type.episodes')}</option>
          <option value="Special">{t('panels.episodes.type.specials')}</option>
          <option value="Other">{t('panels.episodes.type.others')}</option>
          <option value="ThemeSong,OpeningSong,EndingSong">{t('panels.episodes.type.credits')}</option>
          <option value="Unknown,Trailer,Parody,Interview,Extra">{t('panels.episodes.type.misc')}</option>
        </Select>

        <Select
          id="includeMissing"
          label={t('panels.episodes.statusLabel')}
          value={availability}
          onChange={onFilterChange}
        >
          <option value="true">{t('panels.episodes.status.all')}</option>
          <option value="false">{t('panels.episodes.status.available')}</option>
          <option value="only">{t('panels.episodes.status.missing')}</option>
        </Select>

        <Select
          id="includeWatched"
          label={t('panels.episodes.watchedLabel')}
          value={watched}
          onChange={onFilterChange}
        >
          <option value="true">{t('panels.episodes.watched.all')}</option>
          <option value="only">{t('panels.episodes.watched.watched')}</option>
          <option value="false">{t('panels.episodes.watched.unwatched')}</option>
        </Select>

        <Select
          id="includeHidden"
          label={t('panels.episodes.hiddenLabel')}
          value={hidden}
          onChange={onFilterChange}
        >
          <option value="true">{t('panels.episodes.hidden.all')}</option>
          <option value="false">{t('panels.episodes.hidden.hide')}</option>
          <option value="only">{t('panels.episodes.hidden.only')}</option>
        </Select>

        <Select
          id="includeUnaired"
          label={t('panels.episodes.airLabel')}
          value={unaired}
          onChange={onFilterChange}
        >
          <option value="true">{t('panels.episodes.air.all')}</option>
          <option value="only">{t('panels.episodes.air.unaired')}</option>
          <option value="false">{t('panels.episodes.air.aired')}</option>
        </Select>

        {(hasUnaired || hasMissing) && <hr className="border border-panel-border" />}
        <div className="flex flex-col gap-y-3">
          {hasUnaired && (
            <div className="flex flex-row gap-x-3">
              <Icon path={mdiInformationOutline} className="text-panel-icon-warning" size={1} />
              <div className="grow text-base font-semibold">
                {t('panels.episodes.warningUnaired')}
              </div>
            </div>
          )}
          {hasMissing && (
            <div className="flex flex-row gap-x-3">
              <Icon path={mdiInformationOutline} className="text-panel-icon-warning" size={1} />
              <div className="grow text-base font-semibold">
                {t('panels.episodes.warningMissing')}
              </div>
            </div>
          )}
        </div>
      </ShokoPanel>
    </div>
  );
});

export default EpisodeSearchAndFilterPanel;
