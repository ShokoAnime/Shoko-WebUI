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

/** The settings page's context: the settings draft, plus the metadata page's provider draft, both sent on Save. */
export type SettingsPageContextType = SettingsContextType & {
  metadataDraft: MetadataProviderDraftType;
  setMetadataDraft: (draft: MetadataProviderDraftType) => void;
};
