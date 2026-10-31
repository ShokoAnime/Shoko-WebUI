import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { groupBy, isEmpty, map } from 'lodash';

import SettingsNavLink from '@/components/Settings/SettingsNavLink';
import { usePluginPagesQuery } from '@/core/react-query/plugin/queries';

const SettingsPluginNav = () => {
  const pluginGroups = groupBy(usePluginPagesQuery().data, page => page.PluginInfo.ID);

  if (isEmpty(pluginGroups)) return null;

  return (
    <div className="mt-6 w-full border-t border-panel-border pt-6">
      <div className="mb-4 text-center text-lg">Plugins</div>
      {map(pluginGroups, (group, groupId) => (
        <div className="mb-4 flex flex-col gap-y-2" key={groupId}>
          <div className="px-2 text-center text-sm text-panel-text-primary opacity-60">
            {group[0].PluginInfo.Name}
          </div>
          {group.map(page => (
            page.CanEmbed
              ? (
                <SettingsNavLink to={`plugin/config/${groupId}/${page.ID}`} hasTrailingAction key={page.ID}>
                  {page.Name}
                  <button
                    type="button"
                    data-tooltip-id="tooltip"
                    data-tooltip-content={`Open ${page.Name} in new tab`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      window.open(page.Url, '_blank', 'noopener,noreferrer');
                    }}
                    className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-panel-text-primary opacity-60 transition-opacity hover:opacity-100"
                  >
                    <Icon path={mdiOpenInNew} size={0.7} />
                  </button>
                </SettingsNavLink>
              )
              : (
                <a
                  href={page.Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-x-2 rounded-lg p-2 transition-colors hover:bg-panel-menu-item-background-hover"
                  key={page.ID}
                >
                  {page.Name}
                  <Icon path={mdiOpenInNew} size={0.7} />
                </a>
              )
          ))}
        </div>
      ))}
    </div>
  );
};

export default SettingsPluginNav;
