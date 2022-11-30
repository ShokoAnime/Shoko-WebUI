import React from 'react';
import { Icon } from '@mdi/react';
import { mdiCogOutline, mdiFormatListText } from '@mdi/js';

const GridOptions = ({ toggleMode, showFilters }) => (
  <div className="flex" title="Settings">
    <span className="px-2 cursor-pointer" title="View" onClick={toggleMode}><Icon path={mdiFormatListText} size={1} horizontal vertical rotate={180}/></span>
    <span className="px-2 cursor-pointer" title="Settings" onClick={showFilters}><Icon path={mdiCogOutline} size={1} horizontal vertical rotate={180}/></span>
  </div>
);

export default GridOptions;