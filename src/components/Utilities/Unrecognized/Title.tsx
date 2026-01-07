import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

const TabButton = ({ id, name }: { id: string, name: string }) => (
  <NavLink
    to={`../unrecognized/${id}`}
    className={(
      { isActive },
    ) => (isActive ? 'text-panel-text-primary' : 'hover:text-panel-text-primary transition-colors')}
  >
    {name}
  </NavLink>
);

const Title = () => {
  const { t } = useTranslation('panels');
  return (
    <div className="flex items-center gap-x-2 font-semibold">
      {t('unrecognizedFiles.title')}
      <Icon path={mdiChevronRight} size={1} />
      <TabButton id="files" name={t('unrecognizedFiles.tabs.unrecognized')} />
      <div>|</div>
      <TabButton id="manually-linked-files" name={t('unrecognizedFiles.tabs.manuallyLinked')} />
      <div>|</div>
      <TabButton id="ignored-files" name={t('unrecognizedFiles.tabs.ignored')} />
    </div>
  );
};

export default Title;
