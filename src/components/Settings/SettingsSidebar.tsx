import SettingsNavLink from '@/components/Settings/SettingsNavLink';
import SettingsPluginNav from '@/components/Settings/SettingsPluginNav';

const items = [
  { name: 'General', path: 'general' },
  { name: 'Import', path: 'import' },
  { name: 'Hashing & Release', path: 'hashing-release' },
  { name: 'AniDB', path: 'anidb' },
  { name: 'Metadata', path: 'metadata' },
  { name: 'Collection', path: 'collection' },
  { name: 'Integrations', path: 'integrations' },
  { name: 'Scheduled Actions', path: 'scheduled-actions' },
  { name: 'Plugin Management', path: 'plugin-management' },
  // { name: 'Display', path: 'display' },
  { name: 'User Management', path: 'user-management' },
  // { name: 'Themes', path: 'themes' },
  { name: 'API Keys', path: 'api-keys' },
];

const SettingsSidebar = () => (
  <div className="relative top-0 z-10 flex w-87.5 flex-col gap-y-4 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold">
    <div className="sticky top-6">
      <div className="mb-8 text-center text-xl">
        Core Settings
      </div>
      <div className="flex flex-col items-center gap-y-2">
        {items.map(item => (
          <SettingsNavLink to={item.path} key={item.path}>
            {item.name}
          </SettingsNavLink>
        ))}
        <SettingsPluginNav />
      </div>
    </div>
  </div>
);

export default SettingsSidebar;
