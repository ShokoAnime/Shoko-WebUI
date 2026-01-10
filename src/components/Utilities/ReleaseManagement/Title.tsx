import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

const TabButton = ({ id, name }: { id: string, name: string }) => (
  <NavLink
    to={`../release-management/${id}`}
    className={(
      { isActive },
    ) => (isActive ? 'text-panel-text-primary' : 'hover:text-panel-text-primary transition-colors')}
  >
    {name}
  </NavLink>
);

const Title = () => {
  const { t } = useTranslation('utilities');
  return (
    <div className="flex items-center gap-x-2 font-semibold">
      {t('releaseManagement.title')}
      <Icon path={mdiChevronRight} size={1} />
      <TabButton id="multiples" name={t('releaseManagement.tabs.multiples')} />
      <div>|</div>
      <TabButton id="duplicates" name={t('releaseManagement.tabs.duplicates')} />
      <div>|</div>
      <TabButton id="missing-episodes" name={t('releaseManagement.tabs.missingEpisodes')} />
    </div>
  );
};

export default Title;
