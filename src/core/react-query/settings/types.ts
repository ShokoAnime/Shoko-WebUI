import type { SettingsType } from '@/core/types/api/settings';

export type SettingsPatchRequestType = {
  newSettings: SettingsType;
  skipValidation?: boolean;
};

export type AniDBLoginRequestType = {
  Username: string;
  Password: string;
};

export type SupportedLanguagesResponseType = {
  Name: string;
  Alpha2: string;
}[];
