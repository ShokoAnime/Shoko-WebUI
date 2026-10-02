import type { MetadataProviderDraftType } from '@/core/react-query/metadata/draft';
import type { PluginRenamerSettingsType, SettingsAnidbMyListType, SettingsType } from '@/core/types/api/settings';

export type SettingValueType =
  | string
  | string[]
  | number
  | boolean
  | SettingsAnidbMyListType
  | PluginRenamerSettingsType
  | undefined;

export type SettingsContextType = {
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: SettingValueType) => void;
};

/**
 * The context of the settings page and of the first run: the settings draft, plus the metadata provider draft, both
 * sent on save.
 */
export type SettingsPageContextType = SettingsContextType & {
  metadataDraft: MetadataProviderDraftType;
  setMetadataDraft: (draft: MetadataProviderDraftType) => void;
};
