import React from 'react';
import { Icon } from '@mdi/react';
import { mdiCogOutline, mdiFilterOutline, mdiFormatListText } from '@mdi/js';

const OptionButton = ({ icon, onClick }) => (
  <div className="px-5 py-2 rounded border-background-border border bg-background-nav drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]" onClick={onClick}>
    <Icon path={icon} size={1} />
  </div>
);

const GridOptions = ({ toggleMode, showFilters, showServerFilters }) => (
  <div className="flex space-x-2" title="Settings">
    <OptionButton onClick={showFilters} icon={mdiFilterOutline} />
    <OptionButton onClick={toggleMode} icon={mdiFormatListText} />
    <OptionButton onClick={showServerFilters} icon={mdiCogOutline} />
  </div>
);

export default GridOptions;